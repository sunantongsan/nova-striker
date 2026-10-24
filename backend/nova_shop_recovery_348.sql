-- Extend existing authoritative guardian receipts: 10 seconds/NOVA, 500 seconds/video.
do $migration$
declare body text;
begin
 body:=pg_get_functiondef('nova_private.titan_command_before347(jsonb)'::regprocedure);
 if position($q$'status','order','wait','complete'$q$ in body)=0 then
  if position($q$'speed'$q$ in body)=0 then raise exception 'Unexpected guardian handler';end if;
 end if;
 body:=replace(body,$q$'speed','prepare','claim'$q$,$q$'speed','heal','prepare','claim'$q$);
 body:=replace(body,$q$'resources','speed','upgrade'$q$,$q$'resources','speed','heal','upgrade'$q$);
 body:=replace(body,$q$if target='resources' and$q$, $q$if target='heal' and (s.level<1 or s.recovery_until347 is null or s.recovery_until347<=now()) then raise exception 'หุ่นพักฟื้นเสร็จแล้ว';end if;$q$||chr(10)||$q$     if target='resources' and$q$);
 body:=replace(body,$q$elsif target='speed' then$q$, $q$elsif target='heal' then update nova_private.titans342 set recovery_until347=greatest(now(),recovery_until347-interval '500 seconds') where owner=uid;$q$||chr(10)||$q$      elsif target='speed' then$q$);
 body:=replace(body,$q$elsif mode='speed' then$q$, $q$elsif mode='heal' then$q$||chr(10)||$q$     if s.level<1 or s.recovery_until347 is null or s.recovery_until347<=now() then raise exception 'หุ่นพักฟื้นเสร็จแล้ว';end if;price:=ceil(extract(epoch from(s.recovery_until347-now()))/10);update nova_private.titans342 set recovery_until347=now() where owner=uid;$q$||chr(10)||$q$    elsif mode='speed' then$q$);
 if position($q$mode='heal'$q$ in body)=0 or position($q$'speed','heal','prepare','claim'$q$ in body)=0 then raise exception 'Recovery patch did not match';end if;
 execute body;
end $migration$;
create or replace function nova_private.titan_state342(who uuid) returns jsonb language sql stable set search_path='' as $$
 select nova_private.titan_state_before347(who)||jsonb_build_object('recovery_until347',recovery_until347,'recovery_destroyed347',recovery_destroyed347,'resting347',coalesce(recovery_until347>now(),false),
 'heal_nova348',ceil(greatest(0,extract(epoch from(recovery_until347-now())))/10),'heal_ads348',ceil(greatest(0,extract(epoch from(recovery_until347-now())))/500)) from nova_private.titans342 where owner=who;
$$;
create table nova_private.nova_products348(product_id text primary key,nova int not null check(nova>0),price_thb int not null check(price_thb>0),active boolean not null default true);
insert into nova_private.nova_products348 values
 ('nova_5000',5000,30,true),('nova_10500',10500,59,true),('nova_19000',19000,99,true),('nova_40000',40000,199,true),('nova_85000',85000,399,true),('nova_180000',180000,799,true);
create table nova_private.play_purchases348(token_hash text primary key,owner uuid not null references auth.users(id),product_id text not null references nova_private.nova_products348(product_id),nova int not null,order_id text,created_at timestamptz not null default now(),test_purchase boolean not null);
alter table nova_private.nova_products348 enable row level security;
alter table nova_private.play_purchases348 enable row level security;
revoke all on nova_private.nova_products348,nova_private.play_purchases348 from public,anon,authenticated;
-- Only the authenticated Edge verifier may call this after checking the Google receipt.
create function public.nova_grant_play348(who uuid,token_hash text,product text,orderid text,is_test boolean) returns jsonb language plpgsql security definer set search_path='' as $$
declare amount int;receipt nova_private.play_purchases348;balance bigint;
begin
 if is_test is distinct from true then raise exception 'Real purchases are not enabled';end if;
 if token_hash is null or token_hash !~ '^[0-9a-f]{64}$' then raise exception 'Invalid receipt';end if;
 if not exists(select 1 from auth.users where id=who and not coalesce(is_anonymous,false)) then raise exception 'Sign in required';end if;
 perform pg_advisory_xact_lock(153014,1);
 select * into receipt from nova_private.play_purchases348 p where p.token_hash=nova_grant_play348.token_hash;
 if receipt.token_hash is not null then
  if receipt.owner<>who or receipt.product_id<>product then raise exception 'Receipt belongs to another account';end if;
  return jsonb_build_object('granted',false,'nova',receipt.nova,'gems',(select gems from nova_private.test_wallets where user_id=who));
 end if;
 select nova into amount from nova_private.nova_products348 where product_id=product and active;
 if amount is null then raise exception 'Unknown product';end if;
 insert into nova_private.play_purchases348 values(token_hash,who,product,amount,orderid,now(),is_test);
 insert into nova_private.test_wallets(user_id,gems) values(who,amount) on conflict(user_id) do update set gems=test_wallets.gems+amount returning gems into balance;
 return jsonb_build_object('granted',true,'nova',amount,'gems',balance);
end $$;
revoke all on function public.nova_grant_play348(uuid,text,text,text,boolean) from public,anon,authenticated;
grant execute on function public.nova_grant_play348(uuid,text,text,text,boolean) to service_role;
