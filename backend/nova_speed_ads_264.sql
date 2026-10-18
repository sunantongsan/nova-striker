-- One completed rewarded video buys 500 seconds, equal to 50 NOVA at 10s/NOVA.
create table nova_private.speed_ads264(owner uuid not null references auth.users(id),id uuid not null,target jsonb not null,provider text not null check(provider in('test','admob','monetag')),created_at timestamptz not null default now(),claimed_at timestamptz,seconds int not null default 500 check(seconds between 0 and 500),primary key(owner,id));
alter table nova_private.speed_ads264 enable row level security;
revoke all on nova_private.speed_ads264 from public,anon,authenticated;
alter table nova_private.admob_intents230 drop constraint admob_intents230_kind_check;
alter table nova_private.admob_intents230 add check(kind in('gold','power','crystals','speed','checkin','production','raid','timer'));
alter table nova_private.monetag_intents231 drop constraint monetag_intents231_kind_check;
alter table nova_private.monetag_intents231 add check(kind in('gold','power','crystals','speed','checkin','production','mining','raid','timer'));
create function nova_private.speed264(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'speed264';rid uuid:=(payload->>'request_id')::uuid;r nova_private.speed_ads264;j nova_private.upgrade_jobs225;provider text;verified bool;grant_seconds int;begin
 if uid is null or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 if mode not in('prepare','claim') or mode is null or rid is null or payload->>'owner' is distinct from uid::text then raise exception 'รายการไม่ตรงบัญชี';end if;
 perform pg_advisory_xact_lock(153014,1);
 select * into r from nova_private.speed_ads264 where owner=uid and id=rid for update;
 if r.id is not null and r.target is distinct from payload->'target' then raise exception 'รายการไม่ตรงงาน';end if;
 if mode='prepare' and r.id is null then
  if jsonb_typeof(payload->'target') is distinct from 'object' or length((payload->'target')::text)>20000 or coalesce(payload->'target'->>'kind','') not in('building','training','research','server') then raise exception 'ไม่พบงานเร่งเวลา';end if;
  if payload->'target'->>'kind'='server' and not exists(select 1 from nova_private.upgrade_jobs225 where owner=uid and request_id=(payload->'target'->>'id')::uuid and completed_at is null) then raise exception 'งานนี้เสร็จแล้ว';end if;
  provider:=case when exists(select 1 from nova_private.telegram_accounts231 where user_id=uid) then 'monetag' when exists(select 1 from nova_private.admob_settings230 where enabled) then 'admob' else 'test' end;
  if provider='test' and not exists(select 1 from nova_private.test_checkin_settings248 where enabled) then raise exception 'โฆษณายังไม่พร้อม';end if;
  if provider='monetag' and not exists(select 1 from nova_private.monetag_settings231 where enabled) then raise exception 'โฆษณายังไม่พร้อม';end if;
  insert into nova_private.speed_ads264(owner,id,target,provider) values(uid,rid,payload->'target',provider) returning * into r;
  -- Provider intent cannot be redeemed as currency or a different upgrade through the legacy API.
  if provider='admob' then insert into nova_private.admob_intents230(owner,id,kind,amount) values(uid,rid,'timer',0);
  elsif provider='monetag' then insert into nova_private.monetag_intents231(owner,id,kind,amount) values(uid,rid,'timer',0);end if;
 end if;
 if r.id is null then raise exception 'ไม่พบรายการ';end if;
 if mode='claim' and r.claimed_at is null then
  if payload->>'completed' is distinct from 'true' then raise exception 'ดูโฆษณาให้ครบก่อน';end if;
  verified:=case r.provider when 'test' then now()<r.created_at+interval '30 minutes' and exists(select 1 from nova_private.test_checkin_settings248 where enabled)
   when 'admob' then exists(select 1 from nova_private.admob_intents230 where owner=uid and id=rid and kind='timer' and verified_at is not null and claimed_at is null and not cancelled)
   else exists(select 1 from nova_private.monetag_intents231 where owner=uid and id=rid and kind='timer' and verified_at is not null and claimed_at is null and not cancelled) end;
  if verified then
   grant_seconds:=500;
   if r.target->>'kind'='server' then
    if nova_private.siege_locked(uid) then raise exception 'รอการรบสิ้นสุดก่อน รางวัลถูกเก็บไว้แล้ว';end if;
    select * into j from nova_private.upgrade_jobs225 where owner=uid and request_id=(r.target->>'id')::uuid for update;
    grant_seconds:=case when j.completed_at is not null or j.request_id is null then 0 else least(500,greatest(0,ceil(extract(epoch from(j.finishes_at-now())))))::int end;
    update nova_private.upgrade_jobs225 set finishes_at=greatest(now(),finishes_at-make_interval(secs=>grant_seconds)) where owner=uid and request_id=j.request_id and completed_at is null;
    perform nova_private.settle(uid);
   end if;
   update nova_private.speed_ads264 set claimed_at=now(),seconds=grant_seconds where owner=uid and id=rid returning * into r;
   if r.provider='admob' then update nova_private.admob_intents230 set claimed_at=now(),granted=0 where owner=uid and id=rid;
   elsif r.provider='monetag' then update nova_private.monetag_intents231 set claimed_at=now(),granted=0 where owner=uid and id=rid;end if;
  end if;
 end if;
 return jsonb_build_object('owner',uid,'speed264',true,'locked',nova_private.siege_locked(uid),'receipt',jsonb_build_object('id',rid,'target',r.target,'provider',r.provider,'claimed',r.claimed_at is not null,'seconds',r.seconds,'expires_at',r.created_at+interval '30 minutes'),'online',case when r.target->>'kind'='server' then nova_private.command('status','{}') else null end);
end $$;
alter function nova_private.test_command(text,jsonb) rename to test_command_before_speed264;
create function nova_private.test_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$begin
 if payload ? 'speed264' then
  if action not in('test_status','test_claim') then raise exception 'คำสั่งไม่ถูกต้อง';end if;
  return nova_private.speed264(payload);
 end if;return nova_private.test_command_before_speed264(action,payload);
end $$;
revoke all on function nova_private.speed264(jsonb),nova_private.test_command_before_speed264(text,jsonb) from public,anon,authenticated;
revoke all on function nova_private.test_command(text,jsonb) from public,anon;
grant execute on function nova_private.test_command(text,jsonb) to authenticated;
-- Bring legacy server speed ads to the same 50 NOVA ceiling. Pending quotes retain their promise.
do $$declare r record;s text;begin
 for r in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='nova_private' and p.prokind='f' and prosrc like '%least(1500,%' loop
  s:=pg_get_functiondef(r.oid);execute replace(s,'least(1500,','least(500,');
 end loop;
end $$;
