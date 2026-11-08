-- Restore authenticated access through the SECURITY INVOKER public RPC.
-- The private dispatcher retains account validation; no table/helper grants.
grant execute on function nova_private.test_command(text,jsonb) to authenticated;
