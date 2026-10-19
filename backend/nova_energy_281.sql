-- Preserve the existing authenticated validator and ACL; only change energy tower caps.
do $migration$
declare src text;anchor text:='   -- rocket_caps227';
begin
 select pg_get_functiondef('nova_private.command_before_siege(text,jsonb)'::regprocedure) into src;
 if position('-- energy_caps281' in src)>0 then return;end if;
 if position(anchor in src)=0 then raise exception 'Unexpected formation validator';end if;
 src:=replace(src,anchor,$body$   -- energy_caps281: HQ 8 / 12 / 16 unlock 1 / 2 / 3 energy cannons.
   caps:=jsonb_set(caps,'{cannonturret}',to_jsonb((select case when coalesce(max((b->>'lv')::integer),1)>=16 then 3 when coalesce(max((b->>'lv')::integer),1)>=12 then 2 when coalesce(max((b->>'lv')::integer),1)>=8 then 1 else 0 end from jsonb_array_elements(v_layout) b where b->>'type'='hq')));
$body$||anchor);
 execute src;
end $migration$;
