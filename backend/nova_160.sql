-- Nova 1.6: server-owned crystal infrastructure, arsenal, garrison and spending receipts.
alter table public.nova_war_players drop constraint if exists nova_war_players_tier_check;
alter table public.nova_war_players add constraint nova_war_players_tier_check check(tier between 1 and 15);
alter table public.nova_war_players drop constraint if exists nova_war_players_crystals_check;
alter table public.nova_war_players add constraint nova_war_players_crystals_check check(crystals between 0 and 1000000);
alter table public.nova_war_players add column if not exists infra jsonb not null default '{"crystalplant":1,"crystalstore":1,"garrison":1}';
alter table public.nova_war_players add column if not exists inventory jsonb not null default '[0,0,0,0,0,0,0,0,0,0,0]';
alter table public.nova_war_players add column if not exists garrison jsonb not null default '[0,0,0,0,0,0,0,0,0,0,0]';
alter table public.nova_war_players add column if not exists research jsonb not null default '{"weapon":0,"armor":0}';
create table if not exists nova_private.receipts(user_id uuid references public.nova_war_players(user_id) on delete cascade, request_id uuid, payload jsonb not null, primary key(user_id,request_id));
alter table nova_private.receipts enable row level security;
revoke all on nova_private.receipts from public,anon,authenticated;
create or replace function nova_private.rate(p public.nova_war_players) returns integer language sql immutable set search_path='' as $$ select case when exists(select 1 from jsonb_array_elements(p.layout) b where b->>'type'='crystalplant') then (p.infra->>'crystalplant')::integer*120 else 0 end $$;
create or replace function nova_private.capacity(p public.nova_war_players) returns integer language sql immutable set search_path='' as $$ select greatest(p.crystals,case when exists(select 1 from jsonb_array_elements(p.layout) b where b->>'type'='crystalstore') then 200+(p.infra->>'crystalstore')::integer*800 else 200 end) $$;
create or replace function nova_private.settle(who uuid) returns public.nova_war_players language plpgsql set search_path='' as $$
declare p public.nova_war_players; rate integer; gain integer; cap integer; begin
 select * into p from public.nova_war_players where user_id=who;rate:=nova_private.rate(p);cap:=nova_private.capacity(p);
 if rate=0 then update public.nova_war_players set produced_at=now() where user_id=who returning * into p;
 else gain:=greatest(0,floor(extract(epoch from(now()-p.produced_at))*rate/3600)::integer);
 update public.nova_war_players set crystals=least(cap,crystals+gain),produced_at=case when crystals+gain>=cap then now() else produced_at+gain*(3600.0/rate)*interval '1 second' end where user_id=who returning * into p;end if;return p;end $$;
revoke all on function nova_private.rate(public.nova_war_players),nova_private.capacity(public.nova_war_players),nova_private.settle(uuid) from public,anon,authenticated;
-- Stop legacy passive accrual at migration time; existing balances are preserved.
update public.nova_war_players set crystals=least(1000,crystals+greatest(0,floor(extract(epoch from(now()-produced_at))/180)::integer)),produced_at=now();
create or replace function nova_private.command(action text, payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); me public.nova_war_players; enemy public.nova_war_players; report public.nova_war_reports;
 target uuid; nonce uuid; tactic text; v_layout jsonb; v_item jsonb; kind text; caps jsonb:='{"hq":1,"barracks":2,"factory":1,"mine":3,"reactor":3,"gun":4,"tesla":2,"camp":2,"wall":100,"airbase":1,"tech":1,"storage":2,"crystalplant":1,"crystalstore":1,"goldstore":2,"powerstore":2,"garrison":1,"missileturret":1,"cannonturret":1,"shield":1}';
 result jsonb; price integer; lev integer; ix integer; delta integer; used integer; costs integer[]:=array[2,8,6,6,10,16,20,20,15,30,45]; sizes integer[]:=array[1,4,3,2,2,4,5,6,3,6,8]; receipt jsonb; available integer; gain integer; pct integer; amount integer;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ'; end if;
 if action not in ('status','enroll','publish','targets','attack','upgrade','history','leave','infrastructure','forge','station','research','fund','cancel') then raise exception 'คำสั่งไม่ถูกต้อง'; end if;
 -- Small initial population: one short transaction lock prevents double spending and crossed raids.
 perform pg_advisory_xact_lock(153014,1);
 select * into me from public.nova_war_players where user_id=uid;
 if me.user_id is not null then select * into me from nova_private.settle(uid); end if;
 if action in ('enroll','publish') then
   v_layout:=payload->'layout';
   if v_layout is null or jsonb_typeof(v_layout)<>'array' or jsonb_array_length(v_layout)<1 or jsonb_array_length(v_layout)>160 then raise exception 'ผังฐานไม่ถูกต้อง'; end if;
   for v_item in select value from jsonb_array_elements(v_layout) loop
     kind:=v_item->>'type';
     if kind is null or not(caps ? kind) or coalesce(v_item->>'x','') !~ '^([1-9]|1[0-9]|20)$' or coalesce(v_item->>'y','') !~ '^([1-9]|1[0-9]|20)$' then raise exception 'ช่องฐานไม่ถูกต้อง'; end if;
   end loop;
   if (select count(*) from jsonb_array_elements(v_layout) b where b->>'type'='hq')<>1
   or exists(select 1 from jsonb_array_elements(v_layout) b group by b->>'x',b->>'y' having count(*)>1)
   or exists(select 1 from jsonb_array_elements(v_layout) b group by b->>'type' having count(*)>(caps->>(b->>'type'))::integer) then raise exception 'จำนวนอาคารหรือผังฐานไม่ถูกต้อง'; end if;
   -- Only the formation is imported. Tier and balances are owned by the server.
   select jsonb_agg(jsonb_build_object('type',b->>'type','x',(b->>'x')::integer,'y',(b->>'y')::integer)) into v_layout from jsonb_array_elements(v_layout) b;
   if me.user_id is null then
     insert into public.nova_war_players(user_id,callsign,layout) values(uid,'NOVA-'||upper(left(uid::text,8)),v_layout) returning * into me;
   else
     update public.nova_war_players p set produced_at=now(),layout=v_layout where p.user_id=uid returning * into me;
   end if;
 end if;
 if me.user_id is null then return jsonb_build_object('enrolled',false); end if;
 select * into me from nova_private.settle(uid);
 if action='leave' then delete from public.nova_war_players where user_id=uid; return jsonb_build_object('enrolled',false); end if;
 if action='upgrade' then
   if me.tier>=15 then raise exception 'ระดับสูงสุดแล้ว'; end if;
   if me.crystals<me.tier*150 then raise exception 'ผลึกไม่พอ'; end if;
   update public.nova_war_players set crystals=crystals-tier*150,tier=tier+1 where user_id=uid returning * into me;
 end if;
 if action='cancel' then
   nonce:=(payload->>'request_id')::uuid;if nonce is null then raise exception 'ต้องมีรหัสรายการ';end if;
   select r.payload into receipt from nova_private.receipts r where r.user_id=uid and r.request_id=nonce;
   if receipt is null then receipt:=jsonb_build_object('id',nonce,'cancelled',true);insert into nova_private.receipts values(uid,nonce,receipt);end if;
 end if;
 if action in ('infrastructure','forge','station','research','fund') then
   nonce:=(payload->>'request_id')::uuid;if nonce is null then raise exception 'ต้องมีรหัสรายการ';end if;
   select r.payload into receipt from nova_private.receipts r where r.user_id=uid and r.request_id=nonce;
   if receipt is null then
     price:=0;receipt:=jsonb_build_object('id',nonce,'action',action);
     if action='infrastructure' then
       kind:=payload->>'kind';if kind not in ('crystalplant','crystalstore','garrison') or kind is null then raise exception 'ไม่พบอาคาร';end if;
       if not exists(select 1 from jsonb_array_elements(me.layout) b where b->>'type'=kind) then raise exception 'สร้างและส่งผังอาคารก่อน';end if;
       lev:=(me.infra->>kind)::integer;if lev>=15 then raise exception 'อาคารระดับสูงสุด';end if;
       if lev>=me.tier then raise exception 'อัปเกรดระดับกองกำลังออนไลน์ก่อน';end if;price:=50*lev;
       me.infra:=jsonb_set(me.infra,array[kind],to_jsonb(lev+1));
     elsif action='forge' then
       ix:=(payload->>'kind')::integer;if ix is null or ix<0 or ix>10 then raise exception 'ไม่พบหน่วย';end if;
       price:=costs[ix+1];
       if (select sum(v::integer) from jsonb_array_elements_text(me.inventory) as t(v))>=150 then raise exception 'กองทัพออนไลน์เต็ม';end if;
       me.inventory:=jsonb_set(me.inventory,array[ix::text],to_jsonb((me.inventory->>ix)::integer+1));
     elsif action='station' then
       ix:=(payload->>'kind')::integer;delta:=(payload->>'delta')::integer;
       if ix is null or ix<0 or ix>10 or delta is null or delta not in (-1,1) then raise exception 'คำสั่งประจำการไม่ถูกต้อง';end if;
       if not exists(select 1 from jsonb_array_elements(me.layout) b where b->>'type'='garrison') then raise exception 'สร้างกองบัญชาการและส่งผังฐานก่อน';end if;
       select coalesce(sum(v::integer*sizes[ord::integer]),0) into used from jsonb_array_elements_text(me.garrison) with ordinality as g(v,ord);
       if delta=1 and ((me.inventory->>ix)::integer<1 or used+sizes[ix+1]>5+(me.infra->>'garrison')::integer*5) then raise exception 'ทหารไม่พอหรือกองบัญชาการเต็ม';end if;
       if delta=-1 and (me.garrison->>ix)::integer<1 then raise exception 'ไม่มีทหารประจำการ';end if;
       me.inventory:=jsonb_set(me.inventory,array[ix::text],to_jsonb((me.inventory->>ix)::integer-delta));
       me.garrison:=jsonb_set(me.garrison,array[ix::text],to_jsonb((me.garrison->>ix)::integer+delta));
     elsif action='research' then
       kind:=payload->>'kind';if kind is null or kind not in ('weapon','armor') then raise exception 'ไม่พบวิจัย';end if;
       if not exists(select 1 from jsonb_array_elements(me.layout) b where b->>'type'='tech') then raise exception 'สร้างและส่งผังศูนย์วิจัยก่อน';end if;lev:=(me.research->>kind)::integer;if lev>=5 then raise exception 'วิจัยระดับสูงสุด';end if;price:=50*(lev+1);
       me.research:=jsonb_set(me.research,array[kind],to_jsonb(lev+1));
     elsif action='fund' then
       kind:=payload->>'kind';ix:=(payload->>'index')::integer;
       if kind='walls' then
         if jsonb_typeof(payload->'items')<>'array' or jsonb_array_length(payload->'items')>100 or jsonb_array_length(payload->'items')<1 then raise exception 'แนวกำแพงไม่ถูกต้อง';end if;
         price:=0;for v_item in select value from jsonb_array_elements(payload->'items') loop lev:=(v_item->>'level')::integer;if lev is null or lev<1 or lev>=15 then raise exception 'ระดับกำแพงไม่ถูกต้อง';end if;price:=price+greatest(0,20*(lev-4));end loop;
       elsif kind='unit' then
         if ix is null or ix<7 or ix>10 then raise exception 'ไม่พบอาวุธ';end if;price:=costs[ix+1];
       elsif kind='upgrade' then
         lev:=(payload->>'level')::integer;if lev is null or lev<5 or lev>=15 then raise exception 'ระดับอาคารไม่ถูกต้อง';end if;price:=20*(lev-4);
       else raise exception 'รายการไม่ถูกต้อง';end if;
       receipt:=receipt||jsonb_build_object('kind',kind,'index',ix,'level',lev,'cost',price);
     end if;
     if me.crystals<price then raise exception 'ผลึกไม่พอ';end if;
     update public.nova_war_players set produced_at=case when action='infrastructure' then now() else produced_at end,crystals=me.crystals-price,infra=me.infra,inventory=me.inventory,garrison=me.garrison,research=me.research where user_id=uid returning * into me;
     insert into nova_private.receipts values(uid,nonce,receipt);
   end if;
 end if;
 result:=jsonb_build_object('enrolled',true,'owner',uid,'callsign',me.callsign,'tier',me.tier,'crystals',me.crystals,'capacity',nova_private.capacity(me),'rate',nova_private.rate(me),'infra',me.infra,'inventory',me.inventory,'garrison',me.garrison,'research',me.research,'vault',80,'shield_until',me.shield_until,'raid_after',me.raid_after,'server_time',now());
 if receipt is not null then result:=result||jsonb_build_object('receipt',receipt);end if;
 if action='targets' then
   select coalesce(jsonb_agg(t),'[]'::jsonb) into v_layout from (
     select p.user_id as id,p.callsign,p.tier,
       least(100,greatest(0,floor((least(nova_private.capacity(p),p.crystals+greatest(0,floor(extract(epoch from(now()-p.produced_at))*nova_private.rate(p)/3600)::integer))-80)*.25)::integer)) as loot,
       p.layout
     from public.nova_war_players p where p.user_id<>uid and p.shield_until<=now() and abs(p.tier-me.tier)<=1
       and not exists(select 1 from public.nova_war_reports r where r.attacker=uid and r.defender=p.user_id and r.created_at>now()-interval '30 minutes')
     order by p.crystals desc,p.user_id limit 20
   )t;
   result:=result||jsonb_build_object('targets',v_layout,'waiting_shield',(select count(*) from public.nova_war_players p where p.user_id<>uid and p.shield_until>now()),'waiting_rematch',(select count(*) from public.nova_war_reports where attacker=uid and created_at>now()-interval '30 minutes'));
 end if;
 if action='history' then
   select coalesce(jsonb_agg(t),'[]'::jsonb) into v_layout from (
     select r.id,r.attacker=uid as attacking,r.tactic,r.destruction,r.loot,r.created_at,p.callsign as opponent
     from public.nova_war_reports r join public.nova_war_players p on p.user_id=case when r.attacker=uid then r.defender else r.attacker end
     where r.attacker=uid or r.defender=uid order by r.created_at desc limit 20
   )t;
   result:=result||jsonb_build_object('history',v_layout);
 end if;
 if action='attack' then
   target:=(payload->>'target')::uuid;nonce:=(payload->>'request_id')::uuid;tactic:=payload->>'tactic';
   if target is null or nonce is null or target=uid or tactic is null or tactic not in ('infantry','siege','air') then raise exception 'เป้าหมายไม่ถูกต้อง'; end if;
   select * into report from public.nova_war_reports where attacker=uid and request_id=nonce;
   if report.id is not null then return result||jsonb_build_object('report',jsonb_build_object('id',report.id,'destruction',report.destruction,'loot',report.loot,'tactic',report.tactic)); end if;
   if me.raid_after>now() then raise exception 'หน่วยจู่โจมยังไม่พร้อม รอครบ 3 นาที'; end if;
   select * into enemy from public.nova_war_players where user_id=target;
   if enemy.user_id is null or abs(enemy.tier-me.tier)>1 then raise exception 'ไม่พบฐานระดับใกล้เคียง'; end if;
   if enemy.shield_until>now() then raise exception 'ฐานนี้มีโล่คุ้มครองแล้ว'; end if;
   if exists(select 1 from public.nova_war_reports where attacker=uid and defender=target and created_at>now()-interval '30 minutes') then raise exception 'ต้องรอ 30 นาทีก่อนบุกคนเดิม'; end if;
   select * into enemy from nova_private.settle(target);available:=enemy.crystals;
   pct:=greatest(0,least(100,nova_private.resolve_raid(enemy.layout,me.tier,enemy.tier,tactic)+coalesce((me.research->>'weapon')::integer,0)*3-coalesce((enemy.research->>'armor')::integer,0)*3-(select count(*)::integer*8 from jsonb_array_elements(enemy.layout) b where b->>'type' in ('shield','missileturret','cannonturret'))-(select case when exists(select 1 from jsonb_array_elements(enemy.layout) b where b->>'type'='garrison') then coalesce(sum(v::integer*sizes[ord::integer]),0)::integer/3 else 0 end from jsonb_array_elements_text(enemy.garrison) with ordinality as g(v,ord))));
   amount:=least(100,floor(greatest(0,available-80)*.25)::integer);
   amount:=least(nova_private.capacity(me)-me.crystals,floor(amount*pct/100.0)::integer);
   update public.nova_war_players set crystals=available-amount,produced_at=now(),shield_until=now()+interval '30 minutes' where user_id=target;
   update public.nova_war_players set crystals=crystals+amount,raid_after=now()+interval '3 minutes',shield_until=now() where user_id=uid returning * into me;
   insert into public.nova_war_reports(attacker,defender,request_id,tactic,destruction,loot) values(uid,target,nonce,tactic,pct,amount) returning * into report;
   result:=result||jsonb_build_object('crystals',me.crystals,'shield_until',me.shield_until,'raid_after',me.raid_after,'report',jsonb_build_object('id',report.id,'destruction',pct,'loot',amount,'tactic',tactic));
 end if;
 return result;
end $$;
revoke all on function nova_private.command(text,jsonb) from public,anon;
grant execute on function nova_private.command(text,jsonb) to authenticated;
create or replace function public.nova_war_command(action text,payload jsonb default '{}'::jsonb)
returns jsonb language sql security invoker set search_path='' as $$ select nova_private.command(action,payload); $$;
revoke all on function public.nova_war_command(text,jsonb) from public,anon;
grant execute on function public.nova_war_command(text,jsonb) to authenticated;
