-- Account-scoped launch grants and verified NOVA ads. Does not enable live ads.
begin;
create table nova_private.launch_campaign367(
 id boolean primary key default true check(id),
 starts_at timestamptz, ends_at timestamptz,
 check((starts_at is null and ends_at is null) or (starts_at is not null and ends_at is not null and ends_at=starts_at+interval '30 days'))
);
insert into nova_private.launch_campaign367(id) values(true);
create table nova_private.launch_grants367(owner uuid primary key references auth.users(id) on delete cascade,amount integer not null default 1000 check(amount=1000),created_at timestamptz not null default now());
create table nova_private.coin_ads367(
 owner uuid not null references auth.users(id) on delete cascade, id uuid not null,
 amount integer not null default 5 check(amount=5),
 created_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '30 minutes',
 claimed_at timestamptz, primary key(owner,id),
 foreign key(owner,id) references nova_private.admob_intents230(owner,id) on delete cascade
);
create index coin_ads367_daily on nova_private.coin_ads367(owner,created_at);
alter table nova_private.launch_campaign367 enable row level security;
alter table nova_private.launch_grants367 enable row level security;
alter table nova_private.coin_ads367 enable row level security;
revoke all on nova_private.launch_campaign367,nova_private.launch_grants367,nova_private.coin_ads367 from public,anon,authenticated;

-- Reuse the existing cumulative delivery cursor so reconnecting cannot mint twice.
alter function nova_private.external_credits297() rename to external_credits_before367;
create function nova_private.external_credits297() returns jsonb language plpgsql security definer set search_path='' as $$
declare r jsonb; total bigint;
begin
 r:=nova_private.external_credits_before367();
 select coalesce((select sum(amount) from nova_private.launch_grants367 where owner=auth.uid()),0)+coalesce((select sum(amount) from nova_private.coin_ads367 where owner=auth.uid() and claimed_at is not null),0) into total;
 return r||jsonb_build_object('credited',(r->>'credited')::bigint+total);
end $$;

create function nova_private.launch367() returns void language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();
begin
 if uid is null then return;end if;
 perform pg_advisory_xact_lock(153014,1);
 insert into nova_private.launch_grants367(owner)
 select uid from auth.users u cross join nova_private.launch_campaign367 c
 where u.id=uid and not coalesce(u.is_anonymous,false)
 and now()>=c.starts_at and now()<c.ends_at
 and u.created_at>=c.starts_at and u.created_at<c.ends_at
 on conflict(owner) do nothing;
 if found then
  insert into nova_private.test_wallets(user_id,gems) values(uid,1000)
  on conflict(user_id) do update set gems=test_wallets.gems+1000;
 end if;
end $$;

create function nova_private.coin_ad367(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); mode text:=payload->>'coin_ad367'; rid uuid; r nova_private.coin_ads367; verified boolean; used integer; day_start timestamptz;
begin
 if uid is null or payload->>'owner' is distinct from uid::text or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'Sign in required';end if;
 if mode is null or mode not in('status','prepare','claim') then raise exception 'Invalid ad action';end if;
 perform pg_advisory_xact_lock(153014,1);
 day_start:=date_trunc('day',now() at time zone 'Asia/Bangkok') at time zone 'Asia/Bangkok';
 if mode<>'status' then
  rid:=(payload->>'request_id')::uuid;
  if rid is null then raise exception 'Missing receipt';end if;
  select * into r from nova_private.coin_ads367 where owner=uid and id=rid for update;
  if mode='prepare' and r.id is null then
   if not exists(select 1 from nova_private.admob_settings230 where enabled) then raise exception 'Ads are not available yet';end if;
   select count(*) into used from nova_private.coin_ads367 where owner=uid and created_at>=day_start and (claimed_at is not null or expires_at>now() or exists(select 1 from nova_private.admob_intents230 a where a.owner=uid and a.id=coin_ads367.id and a.verified_at is not null));
   if used>=6 then raise exception 'Daily limit reached';end if;
   -- Zero-value provider intent cannot be redeemed as currency via the legacy API.
   insert into nova_private.admob_intents230(owner,id,kind,amount) values(uid,rid,'timer',0);
   insert into nova_private.coin_ads367(owner,id) values(uid,rid) returning * into r;
  end if;
  if r.id is null then raise exception 'Receipt not found';end if;
  if mode='claim' and r.claimed_at is null then
   select verified_at is not null and not cancelled and claimed_at is null into verified from nova_private.admob_intents230 where owner=uid and id=rid for update;
   -- Client callbacks alone never qualify. Only signed AdMob SSV verifies an intent.
   if verified then
    update nova_private.coin_ads367 set claimed_at=now() where owner=uid and id=rid returning * into r;
    update nova_private.admob_intents230 set claimed_at=now(),granted=0 where owner=uid and id=rid;
    insert into nova_private.test_wallets(user_id,gems) values(uid,5) on conflict(user_id) do update set gems=test_wallets.gems+5;
   end if;
  end if;
 end if;
 select count(*) into used from nova_private.coin_ads367 where owner=uid and created_at>=day_start and (claimed_at is not null or expires_at>now() or exists(select 1 from nova_private.admob_intents230 a where a.owner=uid and a.id=coin_ads367.id and a.verified_at is not null));
 return jsonb_build_object('owner',uid,'coin_ad367',true,'available',exists(select 1 from nova_private.admob_settings230 where enabled),'amount',5,'daily_limit',6,'remaining',greatest(0,6-used),'next_reset',day_start+interval '1 day','external297',nova_private.external_credits297(),'receipt',case when r.id is null then null else jsonb_build_object('id',r.id,'claimed',r.claimed_at is not null,'verified',exists(select 1 from nova_private.admob_intents230 a where a.owner=uid and a.id=r.id and a.verified_at is not null and not a.cancelled),'expires_at',r.expires_at,'amount',r.amount) end);
end $$;

alter function nova_private.test_command(text,jsonb) rename to test_command_before367;
create function nova_private.test_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if payload ? 'coin_ad367' then
  if action not in('test_status','test_claim') then raise exception 'Invalid reward action';end if;
  return nova_private.coin_ad367(payload);
 end if;
 if action='test_status' then perform nova_private.launch367();end if;
 return nova_private.test_command_before367(action,payload);
end $$;
revoke all on function nova_private.external_credits_before367(),nova_private.external_credits297(),nova_private.launch367(),nova_private.coin_ad367(jsonb),nova_private.test_command_before367(text,jsonb) from public,anon,authenticated;
revoke all on function nova_private.test_command(text,jsonb) from public,anon;
grant execute on function nova_private.test_command(text,jsonb) to authenticated;
-- Set campaign dates only in the coordinated release; installing this migration starts no promotion.
commit;
