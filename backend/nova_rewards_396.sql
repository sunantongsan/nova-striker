-- Fixed 5/15 daily, 1/3 campaign and 3/9 raid rewards. Preserve paid balances.

begin;
alter table nova_private.test_checkin_receipts248 drop constraint test_checkin_receipts248_amount_check;
alter table nova_private.test_checkin_receipts248 add constraint test_checkin_receipts248_amount_check check(amount>=0);

CREATE OR REPLACE FUNCTION nova_private.test_command_before_welcome247(action text, payload jsonb)
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
 if payload->>'normal396'='true' and action='test_claim' and payload->>'checkin233'='true' and (w.claimed_day is null or w.claimed_day<today) then
  qty:=case when w.claimed_day=today-1 then w.checkin_streak233+1 else 1 end;
  amount:=5;
  update nova_private.test_wallets set gems=gems+amount,claimed_day=today,checkin_streak233=qty,checkin_reward233=amount where user_id=uid returning * into w;
 end if;
 if action in ('test_exchange','test_cancel') then
  nonce:=(payload->>'request_id')::uuid;
  if nonce is null then raise exception 'ไม่พบรหัสรายการ'; end if;
  select receipt into r from nova_private.test_receipts where user_id=uid and request_id=nonce;
  if r is null and action='test_cancel' then
   r:=jsonb_build_object('id',nonce,'cancelled',true);
   insert into nova_private.test_receipts values(uid,nonce,r);
  end if;
  if r is null then raise exception 'กรุณาเปิดเกมใหม่เพื่อใช้อัตราแลกใหม่';
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
 return result||jsonb_build_object('admob230',coalesce((select enabled from nova_private.admob_settings230 where id),false),'monetag231',exists(select 1 from nova_private.telegram_accounts231 where user_id=uid) and coalesce((select enabled from nova_private.monetag_settings231 where id),false))||jsonb_build_object('checkin233',jsonb_build_object('day',today,'claimed',coalesce(w.claimed_day>=today,false),'streak',case when w.claimed_day>=today-1 then w.checkin_streak233 else 0 end,'reward',case when w.claimed_day=today then w.checkin_reward233 else 0 end,'next_reward',5,'ad_reward396',15,'server_time',now(),'next_reset',((today+1)::timestamp at time zone 'Asia/Bangkok'),'schedule340',true));
end $function$
;

CREATE OR REPLACE FUNCTION nova_private.test_command_before_mining251(action text, payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid:=auth.uid();result jsonb;enabled boolean;w nova_private.test_wallets;r nova_private.test_checkin_receipts248;mode text:=payload->>'checkin_test248';today date:=(now() at time zone 'Asia/Bangkok')::date;rid uuid;grant_amount integer;streak340 integer;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 if mode is not null then
  if not ((mode in ('prepare','status') and action='test_status') or (mode='claim' and action='test_claim')) then raise exception 'คำสั่งทดสอบไม่ถูกต้อง';end if;
  if payload->>'owner' is distinct from uid::text then raise exception 'ใช้บัญชีเดิมเพื่อตรวจรางวัล';end if;
  rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'ไม่มีรหัสรางวัล';end if;
 end if;
 perform pg_advisory_xact_lock(153014,1);
 select exists(select 1 from nova_private.test_checkin_settings248 s join auth.users u on u.id=uid where s.enabled and s.expires_at>now() and not coalesce(u.is_anonymous,false))
  and not exists(select 1 from nova_private.telegram_accounts231 where user_id=uid)
  and not coalesce((select s.enabled from nova_private.admob_settings230 s where s.id),false) into enabled;
 result:=nova_private.test_command_before_demo248(case when mode is not null then 'test_status' else action end,payload-'checkin_test248');
 if mode is not null then
  select * into w from nova_private.test_wallets where user_id=uid for update;
  select * into r from nova_private.test_checkin_receipts248 where owner=uid and id=rid for update;
  if mode='prepare' and r.id is null then
   if not enabled then raise exception 'โหมดโฆษณาทดสอบยังไม่เปิดให้บริการ';end if;
   if w.claimed_day>=today then raise exception 'รับเช็กอินวันนี้แล้ว';end if;
   streak340:=case when w.claimed_day=today-1 then w.checkin_streak233+1 else 1 end;grant_amount:=15;
   insert into nova_private.test_checkin_receipts248(owner,day,id,amount,checkin_streak340) values(uid,today,rid,grant_amount,streak340) on conflict(owner,day) do nothing;
   select * into r from nova_private.test_checkin_receipts248 where owner=uid and day=today for update;
  end if;
  if r.id is null then raise exception 'ไม่พบรายการรางวัล';end if;
  if mode='claim' and r.claimed_at is null then
   if payload->>'completed248' is distinct from 'true' then raise exception 'ดูโฆษณาทดสอบให้ครบก่อน';end if;
   grant_amount:=0;
   -- Claims cannot advance or replay a past day's streak. A real-ad claim shares this cap.
   if enabled and r.day=today and (w.claimed_day is null or w.claimed_day<today) then
    grant_amount:=r.amount;
    update nova_private.test_wallets set gems=gems+grant_amount,claimed_day=today,checkin_streak233=coalesce(r.checkin_streak340,(grant_amount-20)/5+1),checkin_reward233=grant_amount where user_id=uid;
   end if;
   update nova_private.test_checkin_receipts248 set claimed_at=now(),granted=grant_amount where owner=uid and id=r.id returning * into r;
   result:=nova_private.test_command_before_demo248('test_status','{}');
  end if;
  result:=result||jsonb_build_object('test_receipt248',jsonb_build_object('id',r.id,'day',r.day,'amount',r.amount,'claimed',r.claimed_at is not null,'granted',r.granted));
 end if;
 return result||jsonb_build_object('test_checkin248',enabled);
end $function$
;

CREATE OR REPLACE FUNCTION nova_private.checkin_ad234(action text, payload jsonb, provider text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid:=auth.uid();mode text;tbl text;enabled bool;rid uuid;r record;w nova_private.test_wallets;day date:=(now() at time zone 'Asia/Bangkok')::date;reward_day date;amount bigint;streak integer;result jsonb;
begin
 if uid is null or payload->>'owner' is distinct from uid::text then raise exception 'ใช้บัญชีเดิมเพื่อตรวจรางวัล';end if;
 if provider='monetag' then
  if not exists(select 1 from nova_private.telegram_accounts231 where user_id=uid) then raise exception 'กรุณาเข้าสู่ระบบ';end if;
  tbl:='monetag_intents231';mode:=payload->>'monetag231';select s.enabled into enabled from nova_private.monetag_settings231 s where id;
 elsif provider='admob' then tbl:='admob_intents230';mode:=payload->>'admob230';select s.enabled into enabled from nova_private.admob_settings230 s where id;
 else raise exception 'Invalid provider';end if;
 if action<>'research' or mode is null or mode not in ('prepare','claim','status','cancel') then raise exception 'คำสั่งรางวัลไม่ถูกต้อง';end if;
 rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'ไม่มีรหัสรางวัล';end if;
 perform pg_advisory_xact_lock(153014,1);
 insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
 select * into w from nova_private.test_wallets where user_id=uid for update;
 execute format('select * from nova_private.%I where owner=$1 and id=$2 for update',tbl) into r using uid,rid;
 if r.id is not null and r.kind<>'checkin' then raise exception 'รหัสรางวัลถูกใช้แล้ว';end if;
 if mode='cancel' and r.id is null then
  execute format('insert into nova_private.%I(owner,id,kind,amount,cancelled) values($1,$2,''checkin'',0,true) returning *',tbl) into r using uid,rid;
 elsif mode='cancel' and r.verified_at is null then
  execute format('update nova_private.%I set cancelled=true where owner=$1 and id=$2 returning *',tbl) into r using uid,rid;
 elsif mode='prepare' and r.id is null then
  if not coalesce(enabled,false) then raise exception 'โฆษณารางวัลยังไม่เปิดให้บริการ';end if;
  if w.claimed_day>=day then raise exception 'รับเช็กอินวันนี้แล้ว';end if;
  if payload->>'job' is not null then raise exception 'Invalid checkin job';end if;
  -- Daily cap and verified receipts protect check-in; no unrelated ad cooldown.
  streak:=case when w.claimed_day=day-1 then w.checkin_streak233+1 else 1 end;amount:=15;
  execute format('insert into nova_private.%I(owner,id,kind,amount,checkin_streak340) values($1,$2,''checkin'',$3,$4) returning *',tbl) into r using uid,rid,amount,streak;
 end if;
 if r.id is null then raise exception 'ไม่พบรายการรางวัล';end if;
 reward_day:=(r.created_at at time zone 'Asia/Bangkok')::date;
 -- SDK completion alone never grants. A provider postback alone also cannot trigger this claim.
 if mode='claim' and payload->>'completed234'='true' and r.verified_at is not null and r.claimed_at is null and not r.cancelled then
  amount:=0;
  if w.claimed_day is null or w.claimed_day<reward_day then
   amount:=r.amount;
   update nova_private.test_wallets set gems=gems+amount,claimed_day=reward_day,checkin_streak233=coalesce(r.checkin_streak340,((amount-20)/5+1)::int),checkin_reward233=amount::int where user_id=uid;
  end if;
  execute format('update nova_private.%I set claimed_at=now(),granted=$3 where owner=$1 and id=$2 returning *',tbl) into r using uid,rid,amount,streak;
 end if;
 result:=nova_private.test_command('test_status','{}');
 return result||jsonb_build_object('admob230',provider='admob' and enabled,'monetag231',provider='monetag' and enabled,'ad_reward',jsonb_build_object('id',r.id,'kind',r.kind,'amount',r.amount,'day',reward_day,'expires_at',r.expires_at,'verified',r.verified_at is not null,'claimed',r.claimed_at is not null,'granted',r.granted,'cancelled',r.cancelled));
end $function$
;

CREATE OR REPLACE FUNCTION nova_private.test_command_before367(action text, payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid:=auth.uid(); stage_n int; stars_n int; prize int; total bigint; r jsonb;
begin
 if not(payload ? 'campaign362') then return nova_private.test_command_before362(action,payload);end if;
 if uid is null or payload->>'owner' is distinct from uid::text or action<>'test_claim' then raise exception 'Invalid campaign account';end if;
 stage_n:=(payload->>'stage')::int;stars_n:=(payload->>'stars')::int;
 if stage_n is null or stage_n not between 1 and 100 or stars_n is null or stars_n not between 1 and 3 then raise exception 'Invalid campaign result';end if;
 perform pg_advisory_xact_lock(153014,1);
 prize:=1;
 insert into nova_private.campaign_rewards362(owner,stage,stars,amount) values(uid,stage_n,stars_n,prize) on conflict do nothing;
 if found then
  insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
  update nova_private.test_wallets set gems=gems+prize where user_id=uid;
 end if;
 select sum(amount) into total from nova_private.campaign_rewards362 where owner=uid;
 select jsonb_build_object('owner',uid,'stage',stage,'stars',stars,'amount',amount,'credited',total) into r from nova_private.campaign_rewards362 where owner=uid and stage=stage_n;
 return jsonb_build_object('campaign362',r);
end $function$
;

CREATE OR REPLACE FUNCTION nova_private.raid_credit255()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare reward int:=0;weight numeric;total numeric;begin
 if new.destruction>0 then
  reward:=3;
  if exists(select 1 from nova_private.sieges where id=new.request_id) then
   select count(*),count(*) filter(where owner=new.attacker) into total,weight from nova_private.siege_orders where room=new.request_id and not cancelled262 and id<=(select ack from nova_private.sieges where id=new.request_id);
   reward:=case when total>0 and weight>0 then 3 else 0 end;
  end if;
 end if;
 insert into nova_private.raid_rewards260(owner,battle,report,gold,power,nova) values(new.attacker,new.request_id,new.id,new.loot_gold,new.loot_power,coalesce(reward,0));
 update public.nova_war_reports set nova255=coalesce(reward,0) where id=new.id;return new;
end $function$
;

alter table nova_private.raid_rewards260 add column policy396 boolean not null default false;
alter table nova_private.raid_rewards260 alter column policy396 set default true;

CREATE OR REPLACE FUNCTION nova_private.raid260(payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid:=auth.uid();mode text:=payload->>'raid260';rid uuid;i nova_private.raid_intents260;r nova_private.raid_rewards260;p public.nova_war_players;provider text;verified bool:=false;g bigint;pw bigint;receipt jsonb;begin
 if uid is null or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 if mode not in ('status','prepare','claim','normal') or mode is null then raise exception 'คำสั่งไม่ถูกต้อง';end if;
 if payload ? 'owner' and payload->>'owner' is distinct from uid::text then raise exception 'รายการไม่ตรงบัญชี';end if;
 perform pg_advisory_xact_lock(153014,1);
 if mode<>'status' then
  select * into r from nova_private.raid_rewards260 where owner=uid and battle=(payload->>'battle')::uuid for update;
  if r.owner is null then raise exception 'ไม่พบรางวัล';end if;
  rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'ไม่มีรหัสรายการ';end if;
  select * into i from nova_private.raid_intents260 where id=rid;
  if i.id is not null and (i.owner<>uid or i.battle<>r.battle) then raise exception 'รายการไม่ตรงบัญชี';end if;
  if mode in ('prepare','normal') and i.id is null and r.claimed_at is null then
   provider:=case when exists(select 1 from nova_private.telegram_accounts231 where user_id=uid) then 'monetag' when exists(select 1 from nova_private.admob_settings230 where enabled) then 'admob' else 'test' end;
   if provider='test' and not exists(select 1 from nova_private.test_checkin_settings248 where enabled) then raise exception 'โฆษณายังไม่พร้อม';end if;
   if provider='monetag' and not exists(select 1 from nova_private.monetag_settings231 where enabled) then raise exception 'โฆษณายังไม่พร้อม';end if;
   insert into nova_private.raid_intents260(id,owner,battle,provider) values(rid,uid,r.battle,provider) returning * into i;
   if provider='admob' then insert into nova_private.admob_intents230(owner,id,kind,amount) values(uid,rid,'raid',0);
   elsif provider='monetag' then insert into nova_private.monetag_intents231(owner,id,kind,amount) values(uid,rid,'raid',0);end if;
  end if;
  if r.claimed_at is null and i.id is null then raise exception 'ไม่พบรายการ';end if;
  if mode in ('claim','normal') and r.claimed_at is null then
   if mode<>'normal' and payload->>'completed' is distinct from 'true' then raise exception 'ดูโฆษณาให้ครบก่อน';end if;
   verified:=case i.provider when 'test' then now()<i.created_at+interval '30 minutes' and exists(select 1 from nova_private.test_checkin_settings248 where enabled)
    when 'admob' then exists(select 1 from nova_private.admob_intents230 where owner=uid and id=i.id and kind='raid' and verified_at is not null and not cancelled)
    else exists(select 1 from nova_private.monetag_intents231 where owner=uid and id=i.id and kind='raid' and verified_at is not null and not cancelled) end;
   if verified or mode='normal' then
    if r.policy396 and mode='claim' then r.nova:=r.nova*3;end if;
    select * into p from nova_private.settle(uid);
    g:=least(r.gold,greatest(0,p.gold_cap-nova_private.resource_balance(p,'gold')));pw:=least(r.power,greatest(0,p.power_cap-nova_private.resource_balance(p,'power')));
    update public.nova_war_players set resource_gold=nova_private.resource_balance(p,'gold')+g,resource_power=nova_private.resource_balance(p,'power')+pw,gold_delta=gold_delta+g,power_delta=power_delta+pw,resource_at=now() where user_id=uid;
    insert into nova_private.miners251(owner,code,code_key) values(uid,replace(uid::text,'-',''),replace(uid::text,'-','')) on conflict(owner) do nothing;
    insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
    update nova_private.miners251 set earned=earned+r.nova,credited=credited+r.nova where owner=uid;
    update nova_private.test_wallets set gems=gems+r.nova where user_id=uid;
    insert into nova_private.mining_ledger251(owner,kind,amount,source) values(uid,'raid',r.nova,r.report);
    update nova_private.raid_rewards260 set nova=r.nova,claimed_at=now(),granted_gold263=g,granted_power263=pw where owner=uid and battle=r.battle returning * into r;
    if i.provider='admob' then update nova_private.admob_intents230 set claimed_at=now(),granted=0 where owner=uid and id=i.id;
    elsif i.provider='monetag' then update nova_private.monetag_intents231 set claimed_at=now(),granted=0 where owner=uid and id=i.id;end if;
   end if;
  end if;
  receipt:=jsonb_build_object('id',rid,'battle',r.battle,'provider',i.provider,'claimed',r.claimed_at is not null,'granted',case when r.granted_gold263 is not null then jsonb_build_object('gold',r.granted_gold263,'power',r.granted_power263,'nova',r.nova) else null end,'expires_at',i.created_at+interval '30 minutes');
 end if;
 return nova_private.command('status','{}')||jsonb_build_object('owner',uid,'raid260',true,'receipt',receipt,'pending',coalesce((select jsonb_agg(jsonb_build_object('battle',battle,'gold',gold,'power',power,'nova',nova,'ad_nova396',case when policy396 then nova*3 else nova end) order by created_at) from nova_private.raid_rewards260 where owner=uid and claimed_at is null and gold+power+nova>0),'[]'::jsonb));
end $function$
;

create table nova_private.campaign_bonus396(
 owner uuid not null references auth.users(id) on delete cascade,stage int not null,
 id uuid not null unique,created_at timestamptz not null default now(),claimed_at timestamptz,
 primary key(owner,stage),foreign key(owner,stage) references nova_private.campaign_rewards362(owner,stage) on delete cascade
);
alter table nova_private.campaign_bonus396 enable row level security;
revoke all on nova_private.campaign_bonus396 from public,anon,authenticated;
create function nova_private.campaign_bonus396(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();s int:=(payload->>'stage')::int;rid uuid:=(payload->>'request_id')::uuid;mode text:=payload->>'campaign_bonus396';r nova_private.campaign_bonus396;
begin
 if uid is null or payload->>'owner' is distinct from uid::text or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'Invalid reward account';end if;
 if mode is null or mode not in('prepare','claim') or rid is null then raise exception 'Invalid reward request';end if;
 perform pg_advisory_xact_lock(153014,1);
 if not exists(select 1 from nova_private.campaign_rewards362 where owner=uid and stage=s and amount=1) then raise exception 'กรุณารอรับรางวัลปกติก่อน';end if;
 select * into r from nova_private.campaign_bonus396 where owner=uid and stage=s for update;
 if mode='prepare' and r.owner is null then
  if not exists(select 1 from nova_private.test_checkin_settings248 where enabled and expires_at>now()) then raise exception 'Test ads unavailable';end if;
  insert into nova_private.campaign_bonus396(owner,stage,id) values(uid,s,rid) returning * into r;
 end if;
 if r.owner is null or (mode='claim' and r.id<>rid) then raise exception 'Invalid reward receipt';end if;
 if mode='claim' and r.claimed_at is null then
  if payload->>'completed' is distinct from 'true' then raise exception 'Complete the test video first';end if;
  if not exists(select 1 from nova_private.test_checkin_settings248 where enabled and expires_at>now()) then raise exception 'Test ads unavailable';end if;
  update nova_private.test_wallets set gems=gems+2 where user_id=uid;
  update nova_private.campaign_bonus396 set claimed_at=now() where owner=uid and stage=s returning * into r;
 end if;
 return jsonb_build_object('owner',uid,'campaign_bonus396',true,'receipt',jsonb_build_object('id',r.id,'stage',s,'claimed',r.claimed_at is not null,'bonus',2),'external297',nova_private.external_credits297());
end $$;
revoke all on function nova_private.campaign_bonus396(jsonb) from public,anon,authenticated;


CREATE OR REPLACE FUNCTION nova_private.external_credits297()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r jsonb; total bigint;
begin
 r:=nova_private.external_credits_before367();
 select coalesce((select sum(amount) from nova_private.launch_grants367 where owner=auth.uid()),0)+coalesce((select sum(amount) from nova_private.coin_ads367 where owner=auth.uid() and claimed_at is not null),0) into total;
 return r||jsonb_build_object('credited',(r->>'credited')::bigint+total+2*(select count(*) from nova_private.campaign_bonus396 where owner=auth.uid() and claimed_at is not null));
end $function$
;

CREATE OR REPLACE FUNCTION nova_private.test_command(action text, payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if payload ? 'campaign_bonus396' then
  if action not in ('test_status','test_claim') then raise exception 'Invalid reward action';end if;
  return nova_private.campaign_bonus396(payload);
 end if;
 if payload ? 'theme383' then
  if action not in('test_status','test_claim') then raise exception 'Invalid theme transport';end if;
  return nova_private.themes_command383(payload);
 end if;
 return nova_private.test_command_before383(action,payload);
end $function$
;

-- Explicit temporary Google test reward mode, no production SSV bypass.
update nova_private.admob_settings230 set enabled=false;
update nova_private.test_checkin_settings248 set enabled=true,expires_at='infinity'::timestamptz;
commit;