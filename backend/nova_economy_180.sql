-- Economy 1.8: tenfold crystal production, reversible exchanges, three-resource raids.
-- Preserve balances and start new production rates at migration time.
do $$ declare player_id uuid; begin for player_id in select user_id from public.nova_war_players loop perform nova_private.settle(player_id);end loop;end $$;
update public.nova_war_players set produced_at=now();
alter table public.nova_war_players drop constraint if exists nova_war_players_crystals_check;
alter table public.nova_war_players add constraint nova_war_players_crystals_check check(crystals between 0 and 100000000);
alter table public.nova_war_reports drop constraint if exists nova_war_reports_loot_check;
alter table public.nova_war_reports add constraint nova_war_reports_loot_check check(loot between 0 and 100000000);
alter table public.nova_war_reports add column if not exists loot_gold bigint not null default 0 check(loot_gold>=0);
alter table public.nova_war_reports add column if not exists loot_power bigint not null default 0 check(loot_power>=0);
alter table public.nova_war_players add column if not exists resource_gold bigint not null default 0 check(resource_gold>=0);
alter table public.nova_war_players add column if not exists resource_power bigint not null default 0 check(resource_power>=0);
alter table public.nova_war_players add column if not exists gold_delta bigint not null default 0;
alter table public.nova_war_players add column if not exists power_delta bigint not null default 0;
alter table public.nova_war_players add column if not exists gold_cap bigint not null default 50000;
alter table public.nova_war_players add column if not exists power_cap bigint not null default 50000;
alter table public.nova_war_players add column if not exists gold_rate integer not null default 0;
alter table public.nova_war_players add column if not exists power_rate integer not null default 0;
alter table public.nova_war_players add column if not exists resource_at timestamptz not null default now();
alter table public.nova_war_players add column if not exists snapshot_seq bigint not null default 0;
CREATE OR REPLACE FUNCTION nova_private.rate(p nova_war_players)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$ select case when exists(select 1 from jsonb_array_elements(p.layout) b where b->>'type'='crystalplant') then (p.infra->>'crystalplant')::integer*1200 else 0 end $function$
;
CREATE OR REPLACE FUNCTION nova_private.capacity(p nova_war_players)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$ select greatest(p.crystals,case when exists(select 1 from jsonb_array_elements(p.layout) b where b->>'type'='crystalstore') then 20000+(p.infra->>'crystalstore')::integer*80000 else 20000 end) $function$
;

create or replace function nova_private.resource_balance(p public.nova_war_players,kind text) returns bigint language sql stable set search_path='' as $$
 select least(case when kind='gold' then p.gold_cap else p.power_cap end,
 case when kind='gold' then p.resource_gold else p.resource_power end +
 greatest(0,floor(extract(epoch from(now()-p.resource_at))*case when kind='gold' then p.gold_rate else p.power_rate end/3600)::bigint))
$$;
revoke all on function nova_private.resource_balance(public.nova_war_players,text) from public,anon,authenticated;
CREATE OR REPLACE FUNCTION nova_private.command(action text, payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid:=auth.uid(); me public.nova_war_players; enemy public.nova_war_players; report public.nova_war_reports;
 target uuid; nonce uuid; tactic text; v_layout jsonb; v_item jsonb; kind text; caps jsonb:='{"hq":1,"barracks":2,"factory":1,"mine":3,"reactor":3,"gun":4,"tesla":2,"camp":2,"wall":100,"airbase":1,"tech":1,"storage":2,"crystalplant":1,"crystalstore":1,"goldstore":2,"powerstore":2,"garrison":1,"missileturret":1,"cannonturret":1,"shield":1}';
 result jsonb; price integer; lev integer; ix integer; delta integer; used integer; costs integer[]:=array[2,8,6,6,10,16,20,20,15,30,45]; sizes integer[]:=array[1,4,3,2,2,4,5,6,3,6,8]; receipt jsonb; available integer; gain integer; pct integer; amount integer; gold_loot bigint; power_loot bigint; snap jsonb;
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
 -- The existing local gold/power economy is mirrored with monotonic snapshots.
 -- Cumulative raid deltas prevent a stale local save from restoring stolen resources.
 snap:=payload->'resourceSnapshot';
 if snap->>'owner' is not null and snap->>'owner'<>uid::text then raise exception 'กรุณาใช้บัญชีเดิมสำหรับฐานนี้';end if;
 if snap is not null and (snap->>'seq')::bigint>me.snapshot_seq then
  if (snap->>'gold')::bigint not between 0 and 200000000 or (snap->>'power')::bigint not between 0 and 200000000
   or (snap->>'gold_cap')::bigint not between 50000 and 10000000 or (snap->>'power_cap')::bigint not between 50000 and 10000000
   or (snap->>'gold_rate')::integer not between 0 and 97200 or (snap->>'power_rate')::integer not between 0 and 97200
   then raise exception 'ข้อมูลทรัพยากรไม่ถูกต้อง';end if;
  update public.nova_war_players set
   resource_gold=least((snap->>'gold_cap')::bigint,greatest(0,(snap->>'gold')::bigint+gold_delta-coalesce((snap->>'gold_delta')::bigint,0))),
   resource_power=least((snap->>'power_cap')::bigint,greatest(0,(snap->>'power')::bigint+power_delta-coalesce((snap->>'power_delta')::bigint,0))),
   gold_cap=(snap->>'gold_cap')::bigint,power_cap=(snap->>'power_cap')::bigint,
   gold_rate=(snap->>'gold_rate')::integer,power_rate=(snap->>'power_rate')::integer,
   resource_at=now(),snapshot_seq=(snap->>'seq')::bigint where user_id=uid returning * into me;
 end if;
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
       if kind='garrison' and lev>=me.tier then raise exception 'อัปเกรดระดับกองกำลังออนไลน์ก่อน';end if;price:=case when payload->>'economyVersion'='2' then 200*lev*lev else 50*lev end;
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
         price:=0;for v_item in select value from jsonb_array_elements(payload->'items') loop lev:=(v_item->>'level')::integer;if lev is null or lev<1 or lev>=15 then raise exception 'ระดับกำแพงไม่ถูกต้อง';end if;price:=price+greatest(0,case when payload->>'economyVersion'='2' then 200*(lev-4)*(lev-4) else 20*(lev-4) end);end loop;
       elsif kind='sell_crystals' then
         amount:=(payload->>'quantity')::integer;if amount is null or amount<1 or amount>1000 then raise exception 'จำนวนไม่ถูกต้อง';end if;
         price:=amount*10000;receipt:=receipt||jsonb_build_object('gems',amount);
       elsif kind='unit' then
         if ix is null or ix<7 or ix>10 then raise exception 'ไม่พบอาวุธ';end if;price:=costs[ix+1];
       elsif kind='upgrade' then
         lev:=(payload->>'level')::integer;if lev is null or lev<5 or lev>=15 then raise exception 'ระดับอาคารไม่ถูกต้อง';end if;price:=case when payload->>'economyVersion'='2' then 200*(lev-4)*(lev-4) else 20*(lev-4) end;
       else raise exception 'รายการไม่ถูกต้อง';end if;
       receipt:=receipt||jsonb_build_object('kind',kind,'index',ix,'level',lev,'cost',price);
     end if;
     if me.crystals<price then raise exception 'ผลึกไม่พอ';end if;
     update public.nova_war_players set produced_at=case when action='infrastructure' then now() else produced_at end,crystals=me.crystals-price,infra=me.infra,inventory=me.inventory,garrison=me.garrison,research=me.research where user_id=uid returning * into me;
     insert into nova_private.receipts values(uid,nonce,receipt);
   end if;
 end if;
 result:=jsonb_build_object('enrolled',true,'owner',uid,'callsign',me.callsign,'tier',me.tier,'crystals',me.crystals,'capacity',nova_private.capacity(me),'rate',nova_private.rate(me),'infra',me.infra,'inventory',me.inventory,'garrison',me.garrison,'research',me.research,'vault',0,'resources',jsonb_build_object('gold_delta',me.gold_delta,'power_delta',me.power_delta,'seq',me.snapshot_seq),'shield_until',me.shield_until,'raid_after',me.raid_after,'server_time',now());
 if receipt is not null then result:=result||jsonb_build_object('receipt',receipt);end if;
 if action='targets' then
   select coalesce(jsonb_agg(t),'[]'::jsonb) into v_layout from (
     select p.user_id as id,p.callsign,p.tier,
       floor(least(nova_private.capacity(p),p.crystals+greatest(0,floor(extract(epoch from(now()-p.produced_at))*nova_private.rate(p)/3600)::integer))*.6)::integer as loot, floor(nova_private.resource_balance(p,'gold')*.6)::bigint as loot_gold,floor(nova_private.resource_balance(p,'power')*.6)::bigint as loot_power,
       p.layout
     from public.nova_war_players p where p.user_id<>uid and p.shield_until<=now() and abs(p.tier-me.tier)<=1
       and not exists(select 1 from public.nova_war_reports r where r.attacker=uid and r.defender=p.user_id and r.created_at>now()-interval '30 minutes')
     order by p.crystals desc,p.user_id limit 20
   )t;
   result:=result||jsonb_build_object('targets',v_layout,'waiting_shield',(select count(*) from public.nova_war_players p where p.user_id<>uid and p.shield_until>now()),'waiting_rematch',(select count(*) from public.nova_war_reports where attacker=uid and created_at>now()-interval '30 minutes'));
 end if;
 if action='history' then
   select coalesce(jsonb_agg(t),'[]'::jsonb) into v_layout from (
     select r.id,r.attacker=uid as attacking,r.tactic,r.destruction,r.loot,r.loot_gold,r.loot_power,r.created_at,p.callsign as opponent
     from public.nova_war_reports r join public.nova_war_players p on p.user_id=case when r.attacker=uid then r.defender else r.attacker end
     where r.attacker=uid or r.defender=uid order by r.created_at desc limit 20
   )t;
   result:=result||jsonb_build_object('history',v_layout);
 end if;
 if action='attack' then
   target:=(payload->>'target')::uuid;nonce:=(payload->>'request_id')::uuid;tactic:=payload->>'tactic';
   if target is null or nonce is null or target=uid or tactic is null or tactic not in ('infantry','siege','air') then raise exception 'เป้าหมายไม่ถูกต้อง'; end if;
   select * into report from public.nova_war_reports where attacker=uid and request_id=nonce;
   if report.id is not null then return result||jsonb_build_object('report',jsonb_build_object('id',report.id,'destruction',report.destruction,'loot',report.loot,'loot_gold',report.loot_gold,'loot_power',report.loot_power,'tactic',report.tactic)); end if;
   if me.raid_after>now() then raise exception 'หน่วยจู่โจมยังไม่พร้อม รอครบ 3 นาที'; end if;
   select * into enemy from public.nova_war_players where user_id=target;
   if enemy.user_id is null or abs(enemy.tier-me.tier)>1 then raise exception 'ไม่พบฐานระดับใกล้เคียง'; end if;
   if enemy.shield_until>now() then raise exception 'ฐานนี้มีโล่คุ้มครองแล้ว'; end if;
   if exists(select 1 from public.nova_war_reports where attacker=uid and defender=target and created_at>now()-interval '30 minutes') then raise exception 'ต้องรอ 30 นาทีก่อนบุกคนเดิม'; end if;
   select * into enemy from nova_private.settle(target);available:=enemy.crystals;
   pct:=greatest(0,least(100,nova_private.resolve_raid(enemy.layout,me.tier,enemy.tier,tactic)+coalesce((me.research->>'weapon')::integer,0)*3-coalesce((enemy.research->>'armor')::integer,0)*3-(select count(*)::integer*8 from jsonb_array_elements(enemy.layout) b where b->>'type' in ('shield','missileturret','cannonturret'))-(select case when exists(select 1 from jsonb_array_elements(enemy.layout) b where b->>'type'='garrison') then coalesce(sum(v::integer*sizes[ord::integer]),0)::integer/3 else 0 end from jsonb_array_elements_text(enemy.garrison) with ordinality as g(v,ord))));
   amount:=floor(available*.6)::integer;
   amount:=least(nova_private.capacity(me)-me.crystals,floor(amount*pct/100.0)::integer);
   gold_loot:=least(greatest(0,me.gold_cap-nova_private.resource_balance(me,'gold')),floor(nova_private.resource_balance(enemy,'gold')*.6*pct/100.0)::bigint);
   power_loot:=least(greatest(0,me.power_cap-nova_private.resource_balance(me,'power')),floor(nova_private.resource_balance(enemy,'power')*.6*pct/100.0)::bigint);
   update public.nova_war_players set resource_gold=nova_private.resource_balance(enemy,'gold')-gold_loot,resource_power=nova_private.resource_balance(enemy,'power')-power_loot,gold_delta=gold_delta-gold_loot,power_delta=power_delta-power_loot,resource_at=now(),crystals=available-amount,produced_at=now(),shield_until=now()+interval '30 minutes' where user_id=target;
   update public.nova_war_players set resource_gold=nova_private.resource_balance(me,'gold')+gold_loot,resource_power=nova_private.resource_balance(me,'power')+power_loot,gold_delta=gold_delta+gold_loot,power_delta=power_delta+power_loot,resource_at=now(),crystals=crystals+amount,raid_after=now()+interval '3 minutes',shield_until=now() where user_id=uid returning * into me;
   insert into public.nova_war_reports(attacker,defender,request_id,tactic,destruction,loot,loot_gold,loot_power) values(uid,target,nonce,tactic,pct,amount,gold_loot,power_loot) returning * into report;
   result:=result||jsonb_build_object('resources',jsonb_build_object('gold_delta',me.gold_delta,'power_delta',me.power_delta,'seq',me.snapshot_seq),'crystals',me.crystals,'shield_until',me.shield_until,'raid_after',me.raid_after,'report',jsonb_build_object('id',report.id,'destruction',pct,'loot',amount,'loot_gold',gold_loot,'loot_power',power_loot,'tactic',tactic));
 end if;
 return result;
end $function$
;
CREATE OR REPLACE FUNCTION nova_private.test_command(action text, payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid:=auth.uid(); w nova_private.test_wallets; today date:=(now() at time zone 'Asia/Bangkok')::date; result jsonb; r jsonb; target jsonb; nonce uuid; kind text; qty integer; amount integer; price integer; me public.nova_war_players;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ'; end if;
 if action not in ('test_status','test_claim','test_exchange','test_targets','test_cancel') then raise exception 'คำสั่งไม่ถูกต้อง'; end if;
 if not coalesce((select enabled from nova_private.test_settings where singleton),false) then raise exception 'กิจกรรมทดสอบสิ้นสุดแล้ว'; end if;
 perform pg_advisory_xact_lock(153014,1);
 insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
 select * into w from nova_private.test_wallets where user_id=uid for update;
 if action='test_claim' and (w.claimed_day is null or w.claimed_day<today) then
  update nova_private.test_wallets set gems=gems+10000,claimed_day=today where user_id=uid returning * into w;
 end if;
 if action in ('test_exchange','test_cancel') then
  nonce:=(payload->>'request_id')::uuid;
  if nonce is null then raise exception 'ไม่พบรหัสรายการ'; end if;
  select receipt into r from nova_private.test_receipts where user_id=uid and request_id=nonce;
  if r is null and action='test_cancel' then
   r:=jsonb_build_object('id',nonce,'cancelled',true);
   insert into nova_private.test_receipts values(uid,nonce,r);
  end if;
  if r is null then
   kind:=payload->>'kind';
   if kind is null or kind not in ('gold','power','crystals') then raise exception 'เลือกทรัพยากรไม่ถูกต้อง'; end if;
   qty:=(payload->>'quantity')::integer;
   if qty is null or qty<1 or qty>1000 then raise exception 'จำนวนไม่ถูกต้อง'; end if;
   if payload->>'rateVersion'='2' then price:=qty*10;amount:=qty*case when kind='crystals' then 1000 else 5000 end;else price:=qty*10;amount:=qty*case when kind='crystals' then 10 else 500 end;end if;
   if w.gems<price then raise exception 'เพชรทดสอบไม่พอ'; end if;
   if kind='crystals' then
    select * into me from public.nova_war_players where user_id=uid;
    if me.user_id is null then raise exception 'เข้าร่วมและส่งผังฐานออนไลน์ก่อนแลกผลึก'; end if;
    select * into me from nova_private.settle(uid);
    if me.crystals+amount>nova_private.capacity(me) then raise exception 'คลังผลึกเต็ม อัปเกรดคลังก่อน'; end if;
    update public.nova_war_players set crystals=crystals+amount where user_id=uid;
   end if;
   update nova_private.test_wallets set gems=gems-price where user_id=uid returning * into w;
   r:=jsonb_build_object('id',nonce,'kind',kind,'amount',amount,'cost',price);
   insert into nova_private.test_receipts values(uid,nonce,r);
  end if;
 end if;
 result:=jsonb_build_object('owner',uid,'test_gems',w.gems,'can_claim',w.claimed_day is null or w.claimed_day<today,'server_day',today,'receipt',r);
 if action in ('test_exchange','test_cancel') then
  select * into me from public.nova_war_players where user_id=uid;
  if me.user_id is not null then result:=result||jsonb_build_object('online',nova_private.command('status','{}')); end if;
 end if;
 if action='test_targets' then
  select jsonb_build_object('id',p.user_id,'callsign',p.callsign,'tier',p.tier,'layout',p.layout,'garrison',p.garrison,'research',p.research,'practice',true,'bot',false) into target
   from public.nova_war_players p where p.user_id<>uid
   order by (p.user_id::text=coalesce(payload->>'previous','')),random() limit 1;
  if target is null then
   target:=jsonb_build_object('id','test-bot','callsign','ฐานทดสอบ NOVA','tier',1,'practice',true,'bot',true,'layout','[{"type":"hq","x":10,"y":10},{"type":"gun","x":8,"y":10},{"type":"tesla","x":12,"y":10},{"type":"mine","x":10,"y":8},{"type":"reactor","x":10,"y":12},{"type":"wall","x":8,"y":12},{"type":"wall","x":9,"y":12}]'::jsonb);
  end if;
  result:=result||jsonb_build_object('target',target);
 end if;
 return result;
end $function$
;
