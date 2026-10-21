-- Include indexed, per-account grant receipts in existing wallet/admin replies.
-- No second transfer: gifts/promotions already credited the server wallet.
create function nova_private.external_credits297() returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); total bigint;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'login_required';end if;
 select coalesce((select sum(amount) from nova_private.gifts294 where recipient=uid),0)+coalesce((select sum(amount) from nova_private.promo_claims294 where user_id=uid),0) into total;
 return jsonb_build_object('owner',uid,'credited',total);
end $$;
revoke all on function nova_private.external_credits297() from public,anon,authenticated;
create or replace function nova_private.test_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if payload ? 'admin293' then
  if action<>'test_status' then raise exception 'invalid_admin_action';end if;
  result:=nova_private.admin293(payload);
 else
  result:=nova_private.test_command_before_admin293(action,payload);
 end if;
 return result||jsonb_build_object('external297',nova_private.external_credits297());
end $$;
revoke all on function nova_private.test_command(text,jsonb) from public,anon;
grant execute on function nova_private.test_command(text,jsonb) to authenticated;
