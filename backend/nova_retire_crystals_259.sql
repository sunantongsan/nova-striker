-- Reversible archive: preserve every affected value before retiring the feature.
-- Private, RLS enabled, and no client grants. Never overwrite the first snapshot.
create table if not exists nova_private.crystal_retirement259_backup (
 owner uuid primary key,
 captured_at timestamptz not null default now(),
 crystals integer not null,
 produced_at timestamptz not null,
 layout jsonb not null,
 jobs jsonb not null,
 receipts jsonb not null
);
alter table nova_private.crystal_retirement259_backup enable row level security;
revoke all on nova_private.crystal_retirement259_backup from public,anon,authenticated;
insert into nova_private.crystal_retirement259_backup(owner,crystals,produced_at,layout,jobs,receipts)
 select p.user_id,p.crystals,p.produced_at,p.layout,
 coalesce((select jsonb_agg(to_jsonb(j)) from nova_private.upgrade_jobs225 j where j.owner=p.user_id and j.category='infrastructure' and j.item in ('crystalplant','crystalstore')),'[]'),
 coalesce((select jsonb_agg(to_jsonb(r)) from nova_private.receipts r join nova_private.upgrade_jobs225 j on j.owner=r.user_id and j.request_id=r.request_id where r.user_id=p.user_id and j.category='infrastructure' and j.item in ('crystalplant','crystalstore')),'[]')
 from public.nova_war_players p on conflict(owner) do nothing;
-- Retire crystals without resetting research, troop levels or NOVA balances.
CREATE OR REPLACE FUNCTION nova_private.rate(p nova_war_players)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
select 0;
$function$
;
CREATE OR REPLACE FUNCTION nova_private.capacity(p nova_war_players)
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
select 0;
$function$
;
CREATE OR REPLACE FUNCTION nova_private.command_before_siege(action text, payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid:=auth.uid(); me public.nova_war_players; enemy public.nova_war_players; report public.nova_war_reports;
 target uuid; nonce uuid; tactic text; v_layout jsonb; v_item jsonb; kind text; caps jsonb:='{"hq":1,"barracks":2,"factory":1,"mine":3,"reactor":3,"gun":4,"tesla":2,"camp":2,"wall":100,"airbase":1,"tech":1,"storage":2,"crystalplant":1,"crystalstore":1,"goldstore":2,"powerstore":2,"garrison":1,"missileturret":4,"cannonturret":1,"shield":1,"mercenary":1}';
 result jsonb; price integer; lev integer; ix integer; delta integer; used integer; costs integer[]:=array[2,8,6,6,10,16,20,20,15,30,45]; sizes integer[]:=array[1,4,3,2,2,4,5,6,3,6,8]; receipt jsonb; available integer; gain integer; pct integer; amount integer; gold_loot bigint; power_loot bigint; snap jsonb;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ'; end if;
 if action='attack' and exists(select 1 from nova_private.live_battles where not finished and (attacker=uid or defender=uid or attacker=nullif(payload->>'target','')::uuid or defender=nullif(payload->>'target','')::uuid)) then raise exception 'ฐานนี้กำลังอยู่ในการรบ';end if;
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
     if kind is null or not(caps ? kind) or coalesce(v_item->>'lv','1') !~ '^([1-9]|1[0-5])$' or coalesce(v_item->>'x','') !~ '^([1-9]|1[0-9]|20)$' or coalesce(v_item->>'y','') !~ '^([1-9]|1[0-9]|20)$' then raise exception 'ช่องฐานไม่ถูกต้อง'; end if;
   end loop;
   -- rocket_caps227: HQ levels 1 / 5 / 10 / 15 unlock 1 / 2 / 3 / 4 batteries.
   caps:=jsonb_set(caps,'{missileturret}',to_jsonb((select case when coalesce(max((b->>'lv')::integer),1)>=15 then 4 when coalesce(max((b->>'lv')::integer),1)>=10 then 3 when coalesce(max((b->>'lv')::integer),1)>=5 then 2 else 1 end from jsonb_array_elements(v_layout) b where b->>'type'='hq')));
   if (select count(*) from jsonb_array_elements(v_layout) b where b->>'type'='hq')<>1
   or exists(select 1 from jsonb_array_elements(v_layout) b group by b->>'x',b->>'y' having count(*)>1)
   or exists(select 1 from jsonb_array_elements(v_layout) b group by b->>'type' having count(*)>(caps->>(b->>'type'))::integer) then raise exception 'จำนวนอาคารหรือผังฐานไม่ถูกต้อง'; end if;
   -- Only the formation is imported. Tier and balances are owned by the server.
   select jsonb_agg(jsonb_build_object('type',b->>'type','x',(b->>'x')::integer,'y',(b->>'y')::integer,'lv',coalesce((b->>'lv')::integer,1))) into v_layout from jsonb_array_elements(v_layout) b;
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
         price:=0;receipt:=receipt||jsonb_build_object('cancelled',true);
       elsif kind='unit' then
         if ix is null or ix<7 or ix>10 then raise exception 'ไม่พบอาวุธ';end if;price:=costs[ix+1];
       elsif kind='upgrade' then
         lev:=(payload->>'level')::integer;if lev is null or lev<5 or lev>=15 then raise exception 'ระดับอาคารไม่ถูกต้อง';end if;price:=case when payload->>'economyVersion'='2' then 200*(lev-4)*(lev-4) else 20*(lev-4) end;
       else raise exception 'รายการไม่ถูกต้อง';end if;
       receipt:=receipt||jsonb_build_object('kind',kind,'index',ix,'level',lev,'cost',price);
     end if;
     if action='fund' then price:=0;receipt:=receipt||jsonb_build_object('cost',0);end if;
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
       floor(least(nova_private.capacity(p),p.crystals+greatest(0,floor(extract(epoch from(now()-p.produced_at))*nova_private.rate(p)/3600)::integer))*.5)::integer as loot, floor(nova_private.resource_balance(p,'gold')*.5)::bigint as loot_gold,floor(nova_private.resource_balance(p,'power')*.5)::bigint as loot_power,
       p.layout,p.shield_until,(p.shield_until<=now() and not exists(select 1 from public.nova_war_reports r where r.attacker=uid and r.defender=p.user_id and r.created_at>now()-interval '30 minutes')) as can_attack
     from public.nova_war_players p where p.user_id<>uid and nova_private.match255(uid,p.user_id)
       and (nullif(payload->>'after','') is null or p.user_id>(payload->>'after')::uuid)
     order by p.user_id limit 20
   )t;
   result:=result||jsonb_build_object('targets',v_layout,'waiting_shield',(select count(*) from public.nova_war_players p where p.user_id<>uid and nova_private.match255(uid,p.user_id) and p.shield_until>now()),'waiting_rematch',(select count(*) from public.nova_war_reports where attacker=uid and created_at>now()-interval '30 minutes'));
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
   if enemy.user_id is null then raise exception 'ไม่พบฐานผู้เล่น'; end if;
   if not nova_private.match255(uid,target) then raise exception 'ไม่พบคู่ต่อสู้นี้ กรุณาค้นหาใหม่';end if; if enemy.shield_until>now() then raise exception 'ฐานนี้มีโล่คุ้มครองแล้ว'; end if;
   if exists(select 1 from public.nova_war_reports where attacker=uid and defender=target and created_at>now()-interval '30 minutes') then raise exception 'ต้องรอ 30 นาทีก่อนบุกคนเดิม'; end if;
   select * into enemy from nova_private.settle(target);available:=enemy.crystals;
   pct:=greatest(0,least(100,nova_private.resolve_raid(enemy.layout,me.tier,enemy.tier,tactic)+coalesce((me.research->>'weapon')::integer,0)*3-coalesce((enemy.research->>'armor')::integer,0)*3-(select count(*)::integer*8 from jsonb_array_elements(enemy.layout) b where b->>'type' in ('shield','missileturret','cannonturret'))-(select case when exists(select 1 from jsonb_array_elements(enemy.layout) b where b->>'type'='garrison') then coalesce(sum(v::integer*sizes[ord::integer]),0)::integer/3 else 0 end from jsonb_array_elements_text(enemy.garrison) with ordinality as g(v,ord))));
   amount:=floor(available*.5)::integer;
   amount:=least(nova_private.capacity(me)-me.crystals,floor(amount*pct/100.0)::integer);
   gold_loot:=least(greatest(0,me.gold_cap-nova_private.resource_balance(me,'gold')),floor(nova_private.resource_balance(enemy,'gold')*.5*pct/100.0)::bigint);
   power_loot:=least(greatest(0,me.power_cap-nova_private.resource_balance(me,'power')),floor(nova_private.resource_balance(enemy,'power')*.5*pct/100.0)::bigint);
   update public.nova_war_players set resource_gold=nova_private.resource_balance(enemy,'gold')-floor(nova_private.resource_balance(enemy,'gold')*.5*pct/100),resource_power=nova_private.resource_balance(enemy,'power')-floor(nova_private.resource_balance(enemy,'power')*.5*pct/100),gold_delta=gold_delta-floor(nova_private.resource_balance(enemy,'gold')*.5*pct/100),power_delta=power_delta-floor(nova_private.resource_balance(enemy,'power')*.5*pct/100),resource_at=now(),crystals=available-floor(available*.5*pct/100),produced_at=now(),shield_until=greatest(shield_until,now()+case when pct=100 then interval '4 hours' else interval '30 minutes' end) where user_id=target;
   update public.nova_war_players set resource_gold=nova_private.resource_balance(me,'gold')+gold_loot,resource_power=nova_private.resource_balance(me,'power')+power_loot,gold_delta=gold_delta+gold_loot,power_delta=power_delta+power_loot,resource_at=now(),crystals=crystals+amount,raid_after=now()+interval '3 minutes',shield_until=now() where user_id=uid returning * into me;
   insert into public.nova_war_reports(attacker,defender,request_id,tactic,destruction,loot,loot_gold,loot_power) values(uid,target,nonce,tactic,pct,amount,gold_loot,power_loot) returning * into report;
   result:=result||jsonb_build_object('resources',jsonb_build_object('gold_delta',me.gold_delta,'power_delta',me.power_delta,'seq',me.snapshot_seq),'crystals',me.crystals,'shield_until',me.shield_until,'raid_after',me.raid_after,'report',jsonb_build_object('id',report.id,'destruction',pct,'loot',amount,'loot_gold',gold_loot,'loot_power',power_loot,'tactic',tactic));
 end if;
 return result;
end $function$
;
CREATE OR REPLACE FUNCTION nova_private.command(action text, payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid:=auth.uid();r jsonb;receipt jsonb;rid uuid;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 perform pg_advisory_xact_lock(153014,1);
 -- Accept legacy layouts, removing only retired buildings.
 if action in ('enroll','publish') and jsonb_typeof(payload->'layout')='array' then
  payload:=jsonb_set(payload,'{layout}',coalesce((select jsonb_agg(b) from jsonb_array_elements(payload->'layout') b where b->>'type' not in ('crystalplant','crystalstore')),'[]'));
 end if;
 -- Preserve receipts for paid/in-flight work; cancel only unaccepted retired requests.
 if action in ('upgrade','infrastructure','forge') or (action='research' and payload->>'kind' in ('weapon','armor') and not (payload ? 'enhance')) then
  rid:=nullif(payload->>'request_id','')::uuid;
  select q.payload into receipt from nova_private.receipts q where q.user_id=uid and q.request_id=rid;
  if receipt is null and rid is not null then
   receipt:=jsonb_build_object('id',rid,'cancelled',true,'retired259',true);
   insert into nova_private.receipts values(uid,rid,receipt);
  end if;
  return nova_private.command_before_nova257('status','{}')||jsonb_build_object('receipt',receipt,'crystals_retired259',true);
 end if;
 if payload->>'enhance' in ('building:crystalplant','building:crystalstore') and not exists(select 1 from nova_private.receipts q where q.user_id=uid and q.request_id=nullif(command.payload->>'request_id','')::uuid) then raise exception 'อาคารนี้ถูกนำออกแล้ว';end if;
 r:=nova_private.command_before_nova257(action,payload);
 if action='research' and payload ? 'enhance' and r ? 'receipt' then
  rid:=(payload->>'request_id')::uuid;
  update nova_private.upgrade_jobs225 set finishes_at=least(finishes_at,now()) where owner=uid and request_id=rid and category='enhance' and completed_at is null;
  perform nova_private.settle(uid);
  select q.payload into receipt from nova_private.receipts q where q.user_id=uid and q.request_id=rid;
  r:=nova_private.command_before_nova257('status','{}')||jsonb_build_object('receipt',receipt);
 end if;
 return r;
end $function$
;
CREATE OR REPLACE FUNCTION nova_private.resource_quote233(p nova_war_players, kind text, wanted bigint DEFAULT NULL::bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
declare rate numeric;room bigint;balance bigint;amount bigint;seconds numeric;used numeric;
begin
 if kind is null or kind not in ('gold','power') or wanted is not null and (wanted<=0 or wanted>100000000) then raise exception 'เลือกทรัพยากรไม่ถูกต้อง';end if;
 if kind='crystals' then rate:=nova_private.rate(p);balance:=p.crystals;room:=greatest(0,nova_private.capacity(p)-balance);
 else select coalesce(sum((b->>'lv')::int*2160),0)*nova_private.production_factor245(p,kind) into rate from jsonb_array_elements(p.layout) b where b->>'type'=case kind when 'gold' then 'mine' else 'reactor' end;
 balance:=nova_private.resource_balance(p,kind);room:=greatest(0,case kind when 'gold' then p.gold_cap else p.power_cap end-balance);end if;
 amount:=case when rate>0 then least(room,coalesce(wanted,floor(rate/2)::bigint)) else 0 end;seconds:=case when rate>0 then amount*3600/rate else 0 end;
 used:=case when p.boost_day245=(now() at time zone 'Asia/Bangkok')::date then p.boost_seconds245 else 0 end;
 return jsonb_build_object('production245',true,'production240',nova_private.production_quote240(p),'kind',kind,'hourly_rate',rate,'seconds',seconds,'ad_amount',least(floor(rate/2),room),'ad_base',floor(rate/2),'paid_base',floor(rate/2),'amount',amount,'cost',nova_private.boost_price245(seconds,used,kind='crystals'),'balance',balance,'room',room,'boost_seconds_today',used);
end $function$
;
CREATE OR REPLACE FUNCTION nova_private.bundle_quote238(p nova_war_players, needs jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
declare k text;n bigint;q jsonb;items jsonb:='[]';total int:=0;amount bigint:=0;price int;ok bool:=true;ad_kind text;ad_amount bigint:=0;largest int:=-1;
begin
 if coalesce((needs->>'crystals')::bigint,0)<>0 then raise exception 'เลือกทรัพยากรไม่ถูกต้อง';end if;
 if jsonb_typeof(needs) is distinct from 'object' then raise exception 'Invalid resource quantities';end if;
 foreach k in array array['gold','power'] loop
  n:=coalesce((needs->>k)::bigint,0);if n<0 or n>100000000 then raise exception 'Invalid resource quantities';end if;
  if n=0 then continue;end if;
  q:=nova_private.resource_quote233(p,k,n);
  if (q->>'paid_base')::bigint<=0 or (q->>'room')::bigint<n then ok:=false;end if;
  price:=case when (q->>'paid_base')::bigint>0 then (q->>'cost')::int else 0 end;
  total:=total+price;amount:=amount+n;
  items:=items||jsonb_build_array(jsonb_build_object('kind',k,'amount',n,'cost',price));
  if (q->>'ad_amount')::bigint>0 and price>largest then largest:=price;ad_kind:=k;ad_amount:=(q->>'ad_amount')::bigint;end if;
 end loop;
 return jsonb_build_object('production240',nova_private.production_quote240(p),'kind','bundle','items',items,'cost',total,'amount',amount,'available',ok and amount>0 and total>0,'ad_kind',ad_kind,'ad_amount',ad_amount);
end $function$
;
-- Zero legacy balances and remove retired structures only. Keep upgrade bonuses.
update public.nova_war_players p set crystals=0,produced_at=now(),
 layout=coalesce((select jsonb_agg(b) from jsonb_array_elements(p.layout) b where b->>'type' not in ('crystalplant','crystalstore')),'[]');
-- Retired construction jobs no longer occupy a builder. Other paid jobs finish normally.
update nova_private.upgrade_jobs225 set completed_at=now()
 where completed_at is null and category='infrastructure' and item in ('crystalplant','crystalstore');
update nova_private.receipts r set payload=r.payload||jsonb_build_object('pending',false,'completed',true)
 from nova_private.upgrade_jobs225 j where r.user_id=j.owner and r.request_id=j.request_id
 and j.category='infrastructure' and j.item in ('crystalplant','crystalstore');

