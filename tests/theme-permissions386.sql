begin;
insert into auth.users(id,is_anonymous) values('38600000-0000-4000-8000-000000000001',false);
insert into nova_private.test_wallets(user_id,gems) values('38600000-0000-4000-8000-000000000001',100);
select set_config('request.jwt.claim.sub','38600000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$declare p jsonb:='{"theme383":"buy","owner":"38600000-0000-4000-8000-000000000001","theme":"ocean","request_id":"38600000-0000-4000-8000-000000000002"}';r jsonb;begin
r:=public.nova_test_command('test_claim',p);
assert r#>>'{themes,ocean,unlocked}'='true';
assert r#>>'{receipt,cost}'='50';
assert public.nova_test_command('test_claim',p)=r;
r:=public.nova_test_command('test_status',jsonb_set(p,'{theme383}','"status"'));
assert r#>>'{themes,ocean,unlocked}'='true';
begin
perform public.nova_test_command('test_claim',jsonb_set(p,'{owner}','"38600000-0000-4000-8000-000000000099"'));
raise exception 'Owner check missing';
exception when raise_exception then if sqlerrm <> 'Sign in required' then raise;end if;end;
end$$;
reset role;
do $$begin
assert (select gems=50 from nova_private.test_wallets where user_id='38600000-0000-4000-8000-000000000001');
assert not has_function_privilege('anon','nova_private.test_command(text,jsonb)','execute');
assert not has_function_privilege('authenticated','nova_private.themes_command383(jsonb)','execute');
assert not has_table_privilege('authenticated','nova_private.themes383','update');
end$$;
select 'PASS authenticated public RPC purchase, replay, status, owner isolation, balance and restricted privileges; rolled back' result;
rollback;