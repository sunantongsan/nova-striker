CREATE OR REPLACE FUNCTION public.nova_grant_play348(who uuid, token_hash text, product text, orderid text, is_test boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare amount int;receipt nova_private.play_purchases348;balance bigint;
begin
 -- Initial real-money rollout is restricted in the database as well as the Edge allowlist.
 if not is_test and not exists(select 1 from auth.users u where u.id=who and lower(u.email)='sunan.tongsan@gmail.com' and not coalesce(u.is_anonymous,false)) then raise exception 'Real purchases are restricted to the verified owner pilot';end if;
 if is_test is null then raise exception 'Missing purchase type';end if;
 if not is_test and (orderid is null or orderid not like 'GPA.%') then raise exception 'Missing order';end if;
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
end $function$;

REVOKE ALL ON FUNCTION public.nova_grant_play348(uuid,text,text,text,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.nova_grant_play348(uuid,text,text,text,boolean) TO service_role;
