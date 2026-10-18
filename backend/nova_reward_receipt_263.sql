-- Store the actual capacity-limited grant, so confirmation and replay show exact amounts.
alter table nova_private.raid_rewards260 add column granted_gold263 bigint,add column granted_power263 bigint;
do $$declare src text;begin
 src:=pg_get_functiondef('nova_private.raid260(jsonb)'::regprocedure);
 if strpos(src,'set claimed_at=now() where owner=uid and battle=r.battle')=0 then raise exception 'Unexpected raid claim function';end if;
 src:=replace(src,'set claimed_at=now() where owner=uid and battle=r.battle','set claimed_at=now(),granted_gold263=g,granted_power263=pw where owner=uid and battle=r.battle');
 src:=replace(src,'''claimed'',r.claimed_at is not null,','''claimed'',r.claimed_at is not null,''granted'',case when r.granted_gold263 is not null then jsonb_build_object(''gold'',r.granted_gold263,''power'',r.granted_power263,''nova'',r.nova) else null end,');
 execute src;
end $$;
