-- New accounts from activation onward; exactly one server credit per account.
create table nova_private.welcome_settings247(singleton boolean primary key default true check(singleton),starts_at timestamptz not null default now());
insert into nova_private.welcome_settings247(singleton) values(true);
alter table nova_private.welcome_settings247 enable row level security;
revoke all on nova_private.welcome_settings247 from public,anon,authenticated;
alter table nova_private.test_wallets add column welcome_claimed247 timestamptz,add column welcome_id247 uuid;
alter function nova_private.test_command(text,jsonb) rename to test_command_before_welcome247;
create function nova_private.test_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();result jsonb;eligible boolean;w nova_private.test_wallets;mode text:=payload->>'welcome247';
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 if mode is not null and (mode not in ('status','claim') or (mode='claim' and action<>'test_claim') or (mode='status' and action<>'test_status')) then raise exception 'คำสั่งโบนัสไม่ถูกต้อง';end if;
 if mode='claim' and payload->>'owner' is distinct from uid::text then raise exception 'ใช้บัญชีเดิมเพื่อรับโบนัส';end if;
 perform pg_advisory_xact_lock(153014,1);
 result:=nova_private.test_command_before_welcome247(case when mode='claim' then 'test_status' else action end,payload-'welcome247');
 select exists(select 1 from auth.users u cross join nova_private.welcome_settings247 s where u.id=uid and u.created_at>=s.starts_at and not coalesce(u.is_anonymous,false)) into eligible;
 select * into w from nova_private.test_wallets where user_id=uid for update;
 if mode='claim' then
  if not eligible then raise exception 'โบนัสนี้สำหรับบัญชีใหม่ที่สมัครหลังเริ่มกิจกรรม';end if;
  if w.welcome_claimed247 is null then
   update nova_private.test_wallets set gems=gems+500,welcome_claimed247=now(),welcome_id247=gen_random_uuid() where user_id=uid returning * into w;
  end if;
 end if;
 return result||jsonb_build_object('test_gems',w.gems,'welcome247',jsonb_build_object('eligible',eligible,'amount',500,'claimed',w.welcome_claimed247 is not null,'id',w.welcome_id247,'claimed_at',w.welcome_claimed247));
end $$;
revoke all on function nova_private.test_command_before_welcome247(text,jsonb) from public,anon,authenticated;
revoke all on function nova_private.test_command(text,jsonb) from public,anon;
grant execute on function nova_private.test_command(text,jsonb) to authenticated;
