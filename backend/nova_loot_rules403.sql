-- 403: loot rules.
-- * NOVA by HQ gap (attacker vs target): target same or higher = full reward, 1-2 levels lower = 1 NOVA,
--   3+ levels lower = 0. Player attacks (100%): 5 / 1 / 0. Bot bases: 2 / 1 / 0.
-- * A bot base already cleared with 3 stars still pays resources (client side) but no NOVA.
-- * The rewarded video can still triple resources on a 0-NOVA bot win (claimed403 marks the video).
begin;
create or replace function nova_private.nova_rate403(attacker int,target int,full_reward int) returns int language sql immutable set search_path='' as $$
 select case when coalesce(attacker,1)<=coalesce(target,1) then full_reward when coalesce(attacker,1)-coalesce(target,1)<=2 then least(1,full_reward) else 0 end
$$;
revoke all on function nova_private.nova_rate403(int,int,int) from public,anon,authenticated;

alter table nova_private.campaign_wins399 drop constraint if exists campaign_wins399_amount_check;
alter table nova_private.campaign_wins399 drop constraint if exists campaign_wins399_bonus_check;
alter table nova_private.campaign_wins399 add column if not exists claimed403 timestamptz;
update nova_private.campaign_wins399 set claimed403=coalesce(intent_at,created_at) where bonus>0 and claimed403 is null;
alter table nova_private.campaign_wins399 add constraint campaign_wins399_amount_check check(amount between 0 and 2);
alter table nova_private.campaign_wins399 add constraint campaign_wins399_bonus_check check(bonus=0 or bonus=amount*2);

create or replace function nova_private.raid_credit255() returns trigger language plpgsql security definer set search_path='' as $$
declare reward int:=0;weight numeric;total numeric;begin
 if new.destruction=100 then
  reward:=nova_private.nova_rate403((select nova_private.hq255(layout) from public.nova_war_players where user_id=new.attacker),(select nova_private.hq255(layout) from public.nova_war_players where user_id=new.defender),5);
  if exists(select 1 from nova_private.sieges where id=new.request_id) then
   select count(*),count(*) filter(where owner=new.attacker) into total,weight from nova_private.siege_orders where room=new.request_id and not cancelled262 and id<=(select ack from nova_private.sieges where id=new.request_id);
   reward:=case when total>0 then ceil(reward*weight/total) else 0 end;
  end if;
 end if;
 insert into nova_private.raid_rewards260(owner,battle,report,gold,power,nova) values(new.attacker,new.request_id,new.id,new.loot_gold,new.loot_power,coalesce(reward,0));
 update public.nova_war_reports set nova255=coalesce(reward,0) where id=new.id;return new;
end $$;

create or replace function nova_private.campaign399(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'campaign399';wid uuid;w nova_private.campaign_wins399;prov text;verified bool:=false;st int;sr int;amt int;
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
  -- 403: NOVA depends on the HQ gap and is 0 when this bot base was already cleared with 3 stars.
  -- The client may only ask for less (it knows older local 3-star records), never more.
  amt:=case when exists(select 1 from nova_private.campaign_wins399 where owner=uid and stage=st and stars=3)
    or exists(select 1 from nova_private.campaign_rewards362 where owner=uid and stage=st and stars=3) then 0
   else nova_private.nova_rate403(coalesce((select nova_private.hq255(layout) from public.nova_war_players where user_id=uid),1),least(20,1+(st-1)/5),2) end;
  if payload ? 'nova403' then amt:=least(amt,greatest(0,coalesce((payload->>'nova403')::int,2)));end if;
  insert into nova_private.campaign_wins399(owner,id,stage,stars,amount) values(uid,wid,st,sr,amt) returning * into w;
  insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
  update nova_private.test_wallets set gems=gems+w.amount where user_id=uid;
 end if;
 if mode='prepare' and w.claimed403 is null and (w.provider is null or w.provider='test' and w.intent_at<now()-interval '30 minutes') then
  prov:=case when exists(select 1 from nova_private.telegram_accounts231 where user_id=uid) then 'monetag' when exists(select 1 from nova_private.admob_settings230 where enabled) then 'admob' else 'test' end;
  if prov='test' and not exists(select 1 from nova_private.test_checkin_settings248 where enabled) then raise exception 'โฆษณายังไม่พร้อม';end if;
  if prov='monetag' and not exists(select 1 from nova_private.monetag_settings231 where enabled) then raise exception 'โฆษณายังไม่พร้อม';end if;
  if prov<>'test' and w.provider is not null then raise exception 'โฆษณายังไม่พร้อม';end if;
  update nova_private.campaign_wins399 set provider=prov,intent_at=now() where owner=uid and id=wid returning * into w;
  if prov='admob' then insert into nova_private.admob_intents230(owner,id,kind,amount) values(uid,wid,'campaign',0);
  elsif prov='monetag' then insert into nova_private.monetag_intents231(owner,id,kind,amount) values(uid,wid,'campaign',0);end if;
 end if;
 if mode='claim' and w.claimed403 is null then
  if w.provider is null then raise exception 'ไม่พบรายการ';end if;
  if payload->>'completed' is distinct from 'true' then raise exception 'ดูโฆษณาให้ครบก่อน';end if;
  verified:=case w.provider when 'test' then now()<w.intent_at+interval '30 minutes' and exists(select 1 from nova_private.test_checkin_settings248 where enabled)
   when 'admob' then exists(select 1 from nova_private.admob_intents230 where owner=uid and id=wid and kind='campaign' and verified_at is not null and not cancelled)
   else exists(select 1 from nova_private.monetag_intents231 where owner=uid and id=wid and kind='campaign' and verified_at is not null and not cancelled) end;
  if verified then
   update nova_private.campaign_wins399 set bonus=amount*2,claimed403=now() where owner=uid and id=wid returning * into w;
   update nova_private.test_wallets set gems=gems+w.bonus where user_id=uid;
   if w.provider='admob' then update nova_private.admob_intents230 set claimed_at=now(),granted=0 where owner=uid and id=wid;
   elsif w.provider='monetag' then update nova_private.monetag_intents231 set claimed_at=now(),granted=0 where owner=uid and id=wid;end if;
  end if;
 end if;
 return jsonb_build_object('owner',uid,'campaign399',jsonb_build_object('id',w.id,'stage',w.stage,'amount',w.amount,'bonus',w.bonus,'claimed',w.claimed403 is not null,'provider',w.provider,'expires_at',w.intent_at+interval '30 minutes','credited',nova_private.campaign_total399(uid)));
end $$;
revoke all on function nova_private.campaign399(jsonb) from public,anon,authenticated;
commit;
