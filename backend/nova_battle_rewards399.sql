-- 399: battle rewards.
-- * Bot bases (multiplayer missions): every win = 2 NOVA + normal resources. A rewarded video triples
--   the win: +4 NOVA on the server (6 total); the client triples the resources it already deposited.
-- * Player attacks: 100% destruction = 5 NOVA. Loot + NOVA can be collected without a video (x1),
--   or with a completed rewarded video (x3 NOVA and x3 resources, capped by free storage).
-- Existing unclaimed raid rewards and first-win campaign credits stay as they are.
begin;
alter table nova_private.admob_intents230 drop constraint admob_intents230_kind_check;
alter table nova_private.admob_intents230 add constraint admob_intents230_kind_check check(kind in ('gold','power','crystals','speed','checkin','production','raid','timer','campaign'));
alter table nova_private.monetag_intents231 drop constraint monetag_intents231_kind_check;
alter table nova_private.monetag_intents231 add constraint monetag_intents231_kind_check check(kind in ('gold','power','crystals','speed','checkin','production','mining','raid','timer','campaign'));

-- Player attacks --------------------------------------------------------------------------
alter table nova_private.raid_rewards260 add column if not exists granted_nova399 int, add column if not exists multiplier399 int;

create or replace function nova_private.raid_credit255() returns trigger language plpgsql security definer set search_path='' as $$
declare reward int:=0;weight numeric;total numeric;begin
 if new.destruction=100 then
  reward:=5;
  if exists(select 1 from nova_private.sieges where id=new.request_id) then
   select count(*),count(*) filter(where owner=new.attacker) into total,weight from nova_private.siege_orders where room=new.request_id and not cancelled262 and id<=(select ack from nova_private.sieges where id=new.request_id);
   reward:=case when total>0 then ceil(reward*weight/total) else 0 end;
  end if;
 end if;
 insert into nova_private.raid_rewards260(owner,battle,report,gold,power,nova) values(new.attacker,new.request_id,new.id,new.loot_gold,new.loot_power,coalesce(reward,0));
 update public.nova_war_reports set nova255=coalesce(reward,0) where id=new.id;return new;
end $$;

create or replace function nova_private.raid260(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'raid260';rid uuid;i nova_private.raid_intents260;r nova_private.raid_rewards260;p public.nova_war_players;provider text;verified bool:=false;g bigint;pw bigint;nv int;mult int:=0;receipt jsonb;begin
 if uid is null or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 if mode is null or mode not in ('status','prepare','claim','collect') then raise exception 'คำสั่งไม่ถูกต้อง';end if;
 if payload ? 'owner' and payload->>'owner' is distinct from uid::text then raise exception 'รายการไม่ตรงบัญชี';end if;
 perform pg_advisory_xact_lock(153014,1);
 if mode<>'status' then
  select * into r from nova_private.raid_rewards260 where owner=uid and battle=(payload->>'battle')::uuid for update;
  if r.owner is null then raise exception 'ไม่พบรางวัล';end if;
  rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'ไม่มีรหัสรายการ';end if;
  select * into i from nova_private.raid_intents260 where id=rid;
  if i.id is not null and (i.owner<>uid or i.battle<>r.battle) then raise exception 'รายการไม่ตรงบัญชี';end if;
  if mode='prepare' and i.id is null and r.claimed_at is null then
   provider:=case when exists(select 1 from nova_private.telegram_accounts231 where user_id=uid) then 'monetag' when exists(select 1 from nova_private.admob_settings230 where enabled) then 'admob' else 'test' end;
   if provider='test' and not exists(select 1 from nova_private.test_checkin_settings248 where enabled) then raise exception 'โฆษณายังไม่พร้อม';end if;
   if provider='monetag' and not exists(select 1 from nova_private.monetag_settings231 where enabled) then raise exception 'โฆษณายังไม่พร้อม';end if;
   insert into nova_private.raid_intents260(id,owner,battle,provider) values(rid,uid,r.battle,provider) returning * into i;
   if provider='admob' then insert into nova_private.admob_intents230(owner,id,kind,amount) values(uid,rid,'raid',0);
   elsif provider='monetag' then insert into nova_private.monetag_intents231(owner,id,kind,amount) values(uid,rid,'raid',0);end if;
  end if;
  if mode in ('prepare','claim') and r.claimed_at is null and i.id is null then raise exception 'ไม่พบรายการ';end if;
  if mode='collect' and r.claimed_at is null then mult:=1;end if;
  if mode='claim' and r.claimed_at is null then
   if payload->>'completed' is distinct from 'true' then raise exception 'ดูโฆษณาให้ครบก่อน';end if;
   verified:=case i.provider when 'test' then now()<i.created_at+interval '30 minutes' and exists(select 1 from nova_private.test_checkin_settings248 where enabled)
    when 'admob' then exists(select 1 from nova_private.admob_intents230 where owner=uid and id=i.id and kind='raid' and verified_at is not null and not cancelled)
    else exists(select 1 from nova_private.monetag_intents231 where owner=uid and id=i.id and kind='raid' and verified_at is not null and not cancelled) end;
   if verified then mult:=3;end if;
  end if;
  if mult>0 then
   select * into p from nova_private.settle(uid);
   g:=least(r.gold*mult,greatest(0,p.gold_cap-nova_private.resource_balance(p,'gold')));pw:=least(r.power*mult,greatest(0,p.power_cap-nova_private.resource_balance(p,'power')));nv:=r.nova*mult;
   update public.nova_war_players set resource_gold=nova_private.resource_balance(p,'gold')+g,resource_power=nova_private.resource_balance(p,'power')+pw,gold_delta=gold_delta+g,power_delta=power_delta+pw,resource_at=now() where user_id=uid;
   insert into nova_private.miners251(owner,code,code_key) values(uid,replace(uid::text,'-',''),replace(uid::text,'-','')) on conflict(owner) do nothing;
   insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
   update nova_private.miners251 set earned=earned+nv,credited=credited+nv where owner=uid;
   update nova_private.test_wallets set gems=gems+nv where user_id=uid;
   insert into nova_private.mining_ledger251(owner,kind,amount,source) values(uid,'raid',nv,r.report);
   update nova_private.raid_rewards260 set claimed_at=now(),granted_gold263=g,granted_power263=pw,granted_nova399=nv,multiplier399=mult where owner=uid and battle=r.battle returning * into r;
   if i.provider='admob' then update nova_private.admob_intents230 set claimed_at=now(),granted=0 where owner=uid and id=i.id;
   elsif i.provider='monetag' then update nova_private.monetag_intents231 set claimed_at=now(),granted=0 where owner=uid and id=i.id;end if;
  end if;
  receipt:=jsonb_build_object('id',rid,'battle',r.battle,'provider',i.provider,'claimed',r.claimed_at is not null,'multiplier',r.multiplier399,'granted',case when r.granted_gold263 is not null then jsonb_build_object('gold',r.granted_gold263,'power',r.granted_power263,'nova',coalesce(r.granted_nova399,r.nova)) else null end,'expires_at',i.created_at+interval '30 minutes');
 end if;
 return nova_private.command('status','{}')||jsonb_build_object('owner',uid,'raid260',true,'raid399',true,'receipt',receipt,'pending',coalesce((select jsonb_agg(jsonb_build_object('battle',battle,'gold',gold,'power',power,'nova',nova) order by created_at) from nova_private.raid_rewards260 where owner=uid and claimed_at is null and gold+power+nova>0),'[]'::jsonb));
end $$;
revoke all on function nova_private.raid260(jsonb) from public,anon,authenticated;

-- Bot-base wins --------------------------------------------------------------------------
create table nova_private.campaign_wins399(
 owner uuid not null references auth.users(id) on delete cascade, id uuid not null,
 stage int not null check(stage between 1 and 100), stars int not null check(stars between 1 and 3),
 amount int not null default 2 check(amount=2), bonus int not null default 0 check(bonus in (0,4)),
 provider text check(provider in ('test','admob','monetag')), intent_at timestamptz,
 created_at timestamptz not null default now(), primary key(owner,id)
);
create index campaign_wins399_recent on nova_private.campaign_wins399(owner,created_at);
alter table nova_private.campaign_wins399 enable row level security;
revoke all on nova_private.campaign_wins399 from public,anon,authenticated;

create function nova_private.campaign_total399(uid uuid) returns bigint language sql stable security definer set search_path='' as $$
 select coalesce((select sum(amount) from nova_private.campaign_rewards362 where owner=uid),0)+coalesce((select sum(amount+bonus) from nova_private.campaign_wins399 where owner=uid),0)
$$;
revoke all on function nova_private.campaign_total399(uuid) from public,anon,authenticated;

create function nova_private.campaign399(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'campaign399';wid uuid;w nova_private.campaign_wins399;prov text;verified bool:=false;st int;sr int;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 if mode is null or mode not in ('win','prepare','claim') then raise exception 'คำสั่งไม่ถูกต้อง';end if;
 if payload->>'owner' is distinct from uid::text then raise exception 'รายการไม่ตรงบัญชี';end if;
 wid:=(payload->>'id')::uuid;if wid is null then raise exception 'ไม่มีรหัสรายการ';end if;
 perform pg_advisory_xact_lock(153014,1);
 select * into w from nova_private.campaign_wins399 where owner=uid and id=wid for update;
 if w.id is null then
  st:=(payload->>'stage')::int;sr:=(payload->>'stars')::int;
  if st is null or st not between 1 and 100 or sr is null or sr not between 1 and 3 then raise exception 'Invalid campaign result';end if;
  -- Light anti-spam spacing; normal battles take far longer.
  if exists(select 1 from nova_private.campaign_wins399 where owner=uid and created_at>now()-interval '20 seconds') then raise exception 'ส่งผลการรบเร็วเกินไป ลองใหม่อีกครั้ง';end if;
  insert into nova_private.campaign_wins399(owner,id,stage,stars) values(uid,wid,st,sr) returning * into w;
  insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
  update nova_private.test_wallets set gems=gems+w.amount where user_id=uid;
 end if;
 if mode='prepare' and w.bonus=0 and (w.provider is null or w.provider='test' and w.intent_at<now()-interval '30 minutes') then
  prov:=case when exists(select 1 from nova_private.telegram_accounts231 where user_id=uid) then 'monetag' when exists(select 1 from nova_private.admob_settings230 where enabled) then 'admob' else 'test' end;
  if prov='test' and not exists(select 1 from nova_private.test_checkin_settings248 where enabled) then raise exception 'โฆษณายังไม่พร้อม';end if;
  if prov='monetag' and not exists(select 1 from nova_private.monetag_settings231 where enabled) then raise exception 'โฆษณายังไม่พร้อม';end if;
  if prov<>'test' and w.provider is not null then raise exception 'โฆษณายังไม่พร้อม';end if;
  update nova_private.campaign_wins399 set provider=prov,intent_at=now() where owner=uid and id=wid returning * into w;
  if prov='admob' then insert into nova_private.admob_intents230(owner,id,kind,amount) values(uid,wid,'campaign',0);
  elsif prov='monetag' then insert into nova_private.monetag_intents231(owner,id,kind,amount) values(uid,wid,'campaign',0);end if;
 end if;
 if mode='claim' and w.bonus=0 then
  if w.provider is null then raise exception 'ไม่พบรายการ';end if;
  if payload->>'completed' is distinct from 'true' then raise exception 'ดูโฆษณาให้ครบก่อน';end if;
  verified:=case w.provider when 'test' then now()<w.intent_at+interval '30 minutes' and exists(select 1 from nova_private.test_checkin_settings248 where enabled)
   when 'admob' then exists(select 1 from nova_private.admob_intents230 where owner=uid and id=wid and kind='campaign' and verified_at is not null and not cancelled)
   else exists(select 1 from nova_private.monetag_intents231 where owner=uid and id=wid and kind='campaign' and verified_at is not null and not cancelled) end;
  if verified then
   update nova_private.campaign_wins399 set bonus=amount*2 where owner=uid and id=wid returning * into w;
   update nova_private.test_wallets set gems=gems+w.bonus where user_id=uid;
   if w.provider='admob' then update nova_private.admob_intents230 set claimed_at=now(),granted=0 where owner=uid and id=wid;
   elsif w.provider='monetag' then update nova_private.monetag_intents231 set claimed_at=now(),granted=0 where owner=uid and id=wid;end if;
  end if;
 end if;
 return jsonb_build_object('owner',uid,'campaign399',jsonb_build_object('id',w.id,'stage',w.stage,'amount',w.amount,'bonus',w.bonus,'claimed',w.bonus>0,'provider',w.provider,'expires_at',w.intent_at+interval '30 minutes','credited',nova_private.campaign_total399(uid)));
end $$;
revoke all on function nova_private.campaign399(jsonb) from public,anon,authenticated;

alter function nova_private.test_command(text,jsonb) rename to test_command_before399;
create function nova_private.test_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r jsonb;
begin
 if payload ? 'campaign399' then
  if action not in ('test_status','test_claim') then raise exception 'คำสั่งไม่ถูกต้อง';end if;
  return nova_private.campaign399(payload);
 end if;
 if payload ? 'raid260' and payload->>'raid260'='collect' and action<>'test_claim' then raise exception 'คำสั่งไม่ถูกต้อง';end if;
 r:=nova_private.test_command_before399(action,payload);
 -- Legacy first-win credits report the combined campaign total so delivery stays monotonic.
 if payload ? 'campaign362' and jsonb_typeof(r->'campaign362')='object' then
  r:=jsonb_set(r,'{campaign362,credited}',to_jsonb(nova_private.campaign_total399(auth.uid())));
 end if;
 return r;
end $$;
revoke all on function nova_private.test_command(text,jsonb) from public,anon;
grant execute on function nova_private.test_command(text,jsonb) to authenticated;
revoke all on function nova_private.test_command_before399(text,jsonb) from public,anon,authenticated;
commit;
