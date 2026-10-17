-- Temporary demo-ad check-in grants. These are not provider-verified ad revenue.
create table nova_private.test_checkin_settings248(singleton boolean primary key default true check(singleton),enabled boolean not null default true,expires_at timestamptz not null default now()+interval '14 days');
insert into nova_private.test_checkin_settings248(singleton) values(true);
create table nova_private.test_checkin_receipts248(owner uuid not null references auth.users(id),day date not null,id uuid not null unique,amount integer not null check(amount>=20),created_at timestamptz not null default now(),claimed_at timestamptz,granted integer not null default 0,primary key(owner,day));
alter table nova_private.test_checkin_settings248 enable row level security;
alter table nova_private.test_checkin_receipts248 enable row level security;
revoke all on nova_private.test_checkin_settings248,nova_private.test_checkin_receipts248 from public,anon,authenticated;
alter function nova_private.test_command(text,jsonb) rename to test_command_before_demo248;
create function nova_private.test_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();result jsonb;enabled boolean;w nova_private.test_wallets;r nova_private.test_checkin_receipts248;mode text:=payload->>'checkin_test248';today date:=(now() at time zone 'Asia/Bangkok')::date;rid uuid;grant_amount integer;
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
   grant_amount:=20+5*(case when w.claimed_day=today-1 then w.checkin_streak233 else 0 end);
   insert into nova_private.test_checkin_receipts248(owner,day,id,amount) values(uid,today,rid,grant_amount) on conflict(owner,day) do nothing;
   select * into r from nova_private.test_checkin_receipts248 where owner=uid and day=today for update;
  end if;
  if r.id is null then raise exception 'ไม่พบรายการรางวัล';end if;
  if mode='claim' and r.claimed_at is null then
   if payload->>'completed248' is distinct from 'true' then raise exception 'ดูโฆษณาทดสอบให้ครบก่อน';end if;
   grant_amount:=0;
   -- Claims cannot advance or replay a past day's streak. A real-ad claim shares this cap.
   if enabled and r.day=today and (w.claimed_day is null or w.claimed_day<today) then
    grant_amount:=r.amount;
    update nova_private.test_wallets set gems=gems+grant_amount,claimed_day=today,checkin_streak233=(grant_amount-20)/5+1,checkin_reward233=grant_amount where user_id=uid;
   end if;
   update nova_private.test_checkin_receipts248 set claimed_at=now(),granted=grant_amount where owner=uid and id=r.id returning * into r;
   result:=nova_private.test_command_before_demo248('test_status','{}');
  end if;
  result:=result||jsonb_build_object('test_receipt248',jsonb_build_object('id',r.id,'day',r.day,'amount',r.amount,'claimed',r.claimed_at is not null,'granted',r.granted));
 end if;
 return result||jsonb_build_object('test_checkin248',enabled);
end $$;
revoke all on function nova_private.test_command_before_demo248(text,jsonb) from public,anon,authenticated;
revoke all on function nova_private.test_command(text,jsonb) from public,anon;
grant execute on function nova_private.test_command(text,jsonb) to authenticated;
