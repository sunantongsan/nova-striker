-- 405: until AdMob is approved (admob_settings230.enabled=false), speed-up videos use Google's demo
-- rewarded ad again (provider 'test') while test_checkin_settings248 is enabled. Same 15 min per video,
-- same six-per-Thai-day cap, same 30-minute receipt window. Reverts the 368 block on new test receipts.
begin;
create or replace function nova_private.speed264(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'speed264';rid uuid:=(payload->>'request_id')::uuid;r nova_private.speed_ads264;j nova_private.upgrade_jobs225;provider text;verified bool;grant_seconds int;begin
 if uid is null or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 if mode not in('prepare','claim') or mode is null or rid is null or payload->>'owner' is distinct from uid::text then raise exception 'รายการไม่ตรงบัญชี';end if;
 perform pg_advisory_xact_lock(153014,1);
 select * into r from nova_private.speed_ads264 where owner=uid and id=rid for update;
 if r.id is not null and r.target is distinct from payload->'target' then raise exception 'รายการไม่ตรงงาน';end if;
 if mode='prepare' and r.id is null then
  if (select count(*) from nova_private.speed_ads264 where owner=uid and created_at>=(date_trunc('day',now() at time zone 'Asia/Bangkok') at time zone 'Asia/Bangkok') and (claimed_at is not null or created_at>now()-interval '30 minutes' or exists(select 1 from nova_private.admob_intents230 a where a.owner=uid and a.id=speed_ads264.id and a.verified_at is not null) or exists(select 1 from nova_private.monetag_intents231 m where m.owner=uid and m.id=speed_ads264.id and m.verified_at is not null)))>=6 then raise exception 'รับสิทธิ์เร่งเวลาครบ 6 ครั้งวันนี้แล้ว';end if;
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
   grant_seconds:=r.seconds;
   if r.target->>'kind'='server' then
    if nova_private.siege_locked(uid) then raise exception 'รอการรบสิ้นสุดก่อน รางวัลถูกเก็บไว้แล้ว';end if;
    select * into j from nova_private.upgrade_jobs225 where owner=uid and request_id=(r.target->>'id')::uuid for update;
    grant_seconds:=case when j.completed_at is not null or j.request_id is null then 0 else least(r.seconds,greatest(0,ceil(extract(epoch from(j.finishes_at-now())))))::int end;
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
commit;
