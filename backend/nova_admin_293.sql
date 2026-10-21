-- Account-only presence: guests/offline devices are deliberately not counted.
create table nova_private.admins293(user_id uuid primary key references auth.users(id) on delete cascade,created_at timestamptz not null default now());
create table nova_private.presence293(user_id uuid primary key references auth.users(id) on delete cascade,last_seen timestamptz not null default now());
create index presence293_seen on nova_private.presence293(last_seen);
create table nova_private.feedback293(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,body text not null check(char_length(body) between 3 and 2000),status text not null default 'new' check(status in ('new','reviewing','done')),created_at timestamptz not null default now());
create index feedback293_owner_time on nova_private.feedback293(user_id,created_at);
create index feedback293_time on nova_private.feedback293(created_at desc);
create table nova_private.admin_audit293(id bigint generated always as identity primary key,actor uuid not null references auth.users(id),action text not null,before_value jsonb,after_value jsonb,created_at timestamptz not null default now());
alter table nova_private.admins293 enable row level security;
alter table nova_private.presence293 enable row level security;
alter table nova_private.feedback293 enable row level security;
alter table nova_private.admin_audit293 enable row level security;
revoke all on nova_private.admins293,nova_private.presence293,nova_private.feedback293,nova_private.admin_audit293 from public,anon,authenticated;
alter table nova_private.mining_settings251 add column base_rate293 numeric not null default 200 check(base_rate293 between 1 and 10000);
create or replace function nova_private.mining_rate251(n bigint) returns numeric language sql stable set search_path='' as $$
 select base_rate293 / power(2::numeric,case when n<=100 then 0 else ceil(log(10::numeric,n::numeric/100))::int end) from nova_private.mining_settings251 where id
$$;
revoke all on function nova_private.mining_rate251(bigint) from public,anon,authenticated;

create function nova_private.admin293(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); mode text:=payload->>'admin293'; is_admin boolean; oldval jsonb; newval jsonb; txt text; fid uuid; result jsonb;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'login_required';end if;
 select exists(select 1 from nova_private.admins293 where user_id=uid) into is_admin;
 if mode='presence' then
  insert into nova_private.presence293(user_id) values(uid) on conflict(user_id) do update set last_seen=now() where nova_private.presence293.last_seen<now()-interval '30 seconds';
  return jsonb_build_object('admin293',true,'is_admin',is_admin);
 elsif mode='feedback' then
  txt:=btrim(payload->>'body');
  if txt is null or char_length(txt) not between 3 and 2000 then raise exception 'feedback_length';end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,293));
  if exists(select 1 from nova_private.feedback293 where user_id=uid and created_at>now()-interval '1 minute') then raise exception 'feedback_wait';end if;
  insert into nova_private.feedback293(user_id,body) values(uid,txt) returning id into fid;
  return jsonb_build_object('admin293',true,'submitted',fid);
 end if;
 if not is_admin then raise exception 'admin_required' using errcode='42501';end if;
 if mode='settings' then
  perform pg_advisory_xact_lock(293,1);
  select jsonb_build_object('mining_enabled',enabled,'base_rate',base_rate293) into oldval from nova_private.mining_settings251 where id for update;
  if jsonb_typeof(payload->'enabled') is distinct from 'boolean' or jsonb_typeof(payload->'base_rate') is distinct from 'number' or (payload->>'base_rate')::numeric not between 1 and 10000 then raise exception 'invalid_settings';end if;
  if payload->'expected' is distinct from oldval then raise exception 'settings_changed';end if;
  update nova_private.mining_settings251 set enabled=(payload->>'enabled')::boolean,base_rate293=(payload->>'base_rate')::numeric where id;
  newval:=jsonb_build_object('mining_enabled',(payload->>'enabled')::boolean,'base_rate',(payload->>'base_rate')::numeric);
  insert into nova_private.admin_audit293(actor,action,before_value,after_value) values(uid,'mining_settings',oldval,newval);
 elsif mode='feedback_status' then
  if payload->>'status' is null or payload->>'status' not in ('new','reviewing','done') then raise exception 'invalid_status';end if;
  fid:=(payload->>'id')::uuid;
  select to_jsonb(f) into oldval from nova_private.feedback293 f where id=fid for update;
  if oldval is null then raise exception 'feedback_missing';end if;
  update nova_private.feedback293 set status=payload->>'status' where id=fid;
  insert into nova_private.admin_audit293(actor,action,before_value,after_value) values(uid,'feedback_status',jsonb_build_object('id',fid,'status',oldval->>'status'),jsonb_build_object('id',fid,'status',payload->>'status'));
 elsif mode<>'dashboard' or mode is null then raise exception 'invalid_admin_action';end if;
 with players as (
  select user_id from public.nova_war_players union select user_id from public.nova_rts_saves union select user_id from nova_private.base_names224 union select user_id from nova_private.test_wallets union select owner from nova_private.miners251 union select user_id from nova_private.presence293
 ) select jsonb_build_object('total',(select count(*) from players),'online',(select count(*) from nova_private.presence293 where last_seen>now()-interval '2 minutes'),'active24h',(select count(*) from nova_private.presence293 where last_seen>now()-interval '24 hours')) into result;
 return result||jsonb_build_object('admin293',true,'is_admin',true,'server_time',now(),'settings',(select jsonb_build_object('mining_enabled',enabled,'base_rate',base_rate293) from nova_private.mining_settings251 where id),'feedback',coalesce((select jsonb_agg(to_jsonb(f)) from (select f.id,f.body,f.status,f.created_at,coalesce(b.name,'—') as player from nova_private.feedback293 f left join nova_private.base_names224 b on b.user_id=f.user_id order by f.created_at desc limit 100) f),'[]'::jsonb),'audit',coalesce((select jsonb_agg(to_jsonb(a)) from (select action,before_value,after_value,created_at from nova_private.admin_audit293 order by id desc limit 20) a),'[]'::jsonb));
end $$;
revoke all on function nova_private.admin293(jsonb) from public,anon,authenticated;
alter function nova_private.test_command(text,jsonb) rename to test_command_before_admin293;
revoke all on function nova_private.test_command_before_admin293(text,jsonb) from public,anon,authenticated;
create function nova_private.test_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if payload ? 'admin293' then
  if action<>'test_status' then raise exception 'invalid_admin_action';end if;
  return nova_private.admin293(payload);
 end if;
 return nova_private.test_command_before_admin293(action,payload);
end $$;
revoke all on function nova_private.test_command(text,jsonb) from public,anon;
grant execute on function nova_private.test_command(text,jsonb) to authenticated;
-- public SQL wrapper must be rebound after renaming its callee.
create or replace function public.nova_test_command(action text,payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select nova_private.test_command(action,payload)$$;
revoke all on function public.nova_test_command(text,jsonb) from public,anon;
grant execute on function public.nova_test_command(text,jsonb) to authenticated;
