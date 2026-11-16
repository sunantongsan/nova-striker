-- 412 (applied to production 2026-11-16): speed-up videos may also target Fluid Z production (kind 'zfluid').
-- The server only verifies the video; the device adds 2 hours of its extractors' production.
do $$
declare def text:=pg_get_functiondef('nova_private.speed264(jsonb)'::regprocedure);
begin
 if position('''research'',''server'')' in def)=0 then raise exception 'speed264 kind list not found'; end if;
 def:=replace(def,'''research'',''server'')','''research'',''server'',''zfluid'')');
 execute def;
end $$;
