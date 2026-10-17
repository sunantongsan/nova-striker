-- Rollback only after every paid job has completed. Abort rather than lose paid upgrades.
-- Keeps completed jobs/receipts and all player balances/levels intact.
begin;
select pg_advisory_xact_lock(153014,1);
do $$ declare src text;begin
 if exists(select 1 from nova_private.upgrade_jobs225 where completed_at is null) then
  raise exception 'Active paid upgrades remain. Let jobs complete and settle before rollback.';
 end if;
 select pg_get_functiondef('nova_private.command_before_timers225(text,jsonb)'::regprocedure) into src;
 execute replace(src,'FUNCTION nova_private.command_before_timers225(','FUNCTION nova_private.command(');
 select pg_get_functiondef('nova_private.settle_before_timers225(uuid)'::regprocedure) into src;
 execute replace(src,'FUNCTION nova_private.settle_before_timers225(','FUNCTION nova_private.settle(');
end $$;
revoke all on function nova_private.command(text,jsonb),nova_private.settle(uuid) from public,anon,authenticated;
grant execute on function nova_private.command(text,jsonb) to authenticated;
commit;
