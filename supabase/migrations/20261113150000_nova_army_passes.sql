create table nova_private.army_passes (
 owner uuid not null references auth.users(id) on delete cascade,
 boost integer not null check (boost in (20,50)),
 quantity bigint not null check(quantity>=0),
 primary key(owner,boost)
);
create table nova_private.army_pass_receipts (
 owner uuid not null references auth.users(id) on delete cascade,
 request_id uuid not null,
 operation text not null check(operation in ('buy','use')),
 boost integer not null check(boost in (20,50)),
 primary key(owner,request_id)
);
revoke all on nova_private.army_passes,nova_private.army_pass_receipts from public,anon,authenticated;
create function nova_private.army_pass_command(payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 uid uuid:=auth.uid();
 operation text:=payload->>'armyPass';
 boost_size integer;
 request_id uuid;
 receipt nova_private.army_pass_receipts;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then
  raise exception 'Sign in required';
 end if;
 if operation is null or operation not in ('status','buy','use') then raise exception 'Invalid operation'; end if;
 if operation<>'status' then
  boost_size:=(payload->>'boost')::integer;
  request_id:=(payload->>'request_id')::uuid;
  if request_id is null or boost_size is null or boost_size not in (20,50) then raise exception 'Invalid pass request';end if;
  perform pg_advisory_xact_lock(153014,1);
  select * into receipt from nova_private.army_pass_receipts r where r.owner=uid and r.request_id=army_pass_command.request_id;
  if found then
   if receipt.operation<>army_pass_command.operation or receipt.boost<>boost_size then raise exception 'Request already used';end if;
  else
   if operation='buy' then
    update nova_private.test_wallets set gems=gems-boost_size where user_id=uid and gems>=boost_size;
    if not found then return jsonb_build_object('armyPassError','insufficient_nova');end if;
    insert into nova_private.army_passes values(uid,boost_size,1)
    on conflict(owner,boost) do update set quantity=army_passes.quantity+1;
   else
    update nova_private.army_passes set quantity=quantity-1 where owner=uid and boost=boost_size and quantity>0;
    if not found then return jsonb_build_object('armyPassError','pass_unavailable');end if;
   end if;
   insert into nova_private.army_pass_receipts values(uid,request_id,operation,boost_size);
  end if;
 end if;
 return jsonb_build_object(
  'armyPasses',coalesce((select jsonb_object_agg(boost,quantity) from nova_private.army_passes where owner=uid),'{}'::jsonb),
  'gems',coalesce((select gems from nova_private.test_wallets where user_id=uid),0));
end $$;
revoke all on function nova_private.army_pass_command(jsonb) from public,anon,authenticated;
create or replace function nova_private.test_command(action text,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if payload ? 'armyPass' then
  if action not in ('test_status','test_claim') then raise exception 'Invalid pass transport';end if;
  return nova_private.army_pass_command(payload);
 end if;
 if payload ? 'theme383' then
  if action not in ('test_status','test_claim') then raise exception 'Invalid theme transport';end if;
  return nova_private.themes_command383(payload);
 end if;
 return nova_private.test_command_before383(action,payload);
end $$;
