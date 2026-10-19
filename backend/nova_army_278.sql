-- Add concealed defenses to the existing authenticated layout validator.
do $$ declare d text;begin
 select pg_get_functiondef('nova_private.command_before_siege(text,jsonb)'::regprocedure) into d;
 d:=replace(d,'"mercenary":1}', '"mercenary":1,"landmine":5,"silo":5}');
 d:=replace(d,'if (select count(*) from jsonb_array_elements(v_layout) b where b->>''type''=''hq'')<>1', 'caps:=jsonb_set(caps,''{silo}'',to_jsonb((select least(5,1+greatest(0,max((b->>''lv'')::int)-3)/3) from jsonb_array_elements(v_layout) b where b->>''type''=''hq'')));caps:=jsonb_set(caps,''{landmine}'',caps->''silo''); if (select count(*) from jsonb_array_elements(v_layout) b where b->>''type''=''hq'')<>1');
 execute d;
 select pg_get_functiondef('nova_private.command_before_timers225(text,jsonb)'::regprocedure) into d;
 d:=replace(d,'^unit:([0-9]|10|alien)$','^unit:([0-9]|10|alien|transport)$');
 d:=replace(d,'if k=''unit:alien''', 'if k=''unit:transport'' and not exists(select 1 from jsonb_array_elements(p.layout) b where b->>''type''=''airbase'') then raise exception ''สร้างฐานบินก่อน'';end if; if k=''unit:alien''');execute d;
end $$;
-- Validate landing, then reserve cargo through the same authenticated order path.
do $$ declare d text;begin
 select pg_get_functiondef('nova_private.siege_command(jsonb)'::regprocedure) into d;
 d:=replace(d,'>=least(5,1+floor(greatest(0,tier-1)/3.0))','>=5');
 d:=replace(d,'or not(xx<2 or yy<2 or xx>19 or yy>19) ','');
 d:=replace(d,'where sqrt(power((b->>''x'')::numeric-xx,2)', 'where b->>''type'' not in (''silo'',''landmine'') and sqrt(power((b->>''x'')::numeric-xx,2)');
 d:=replace(d,'''kind'',k,''x'',xx,''y'',yy','''kind'',k,''x'',0,''y'',0');
 d:=replace(d,'set logistics277=jsonb_build_object(''ship'',ship,''lv'',lv)', 'set x=xx,y=yy,logistics277=jsonb_build_object(''ship'',ship,''lv'',lv,''armor278'',coalesce((select (wp.enhancements->>''unit:transport'')::int from public.nova_war_players wp where wp.user_id=uid),0))');
 d:=replace(d,'''action'',act,''ship'',payload->''ship''','''retarget'',coalesce(payload->''retarget'',''false''::jsonb),''action'',act,''ship'',payload->''ship''');
 d:=replace(d,'where n-1=(payload','where b.n-1=(payload');
 d:=replace(d,'qty:=(payload->>''count'')::int;', 'qty:=(payload->>''count'')::int;k:=(payload->>''kind'')::int;');
 d:=replace(d,'(payload->>''kind'')::int is distinct from 7','(k is null or k not in (3,5,7))');
 d:=replace(d,'for i in 1..least(qty,coalesce((m.army->>7)::int,0)) loop','for i in 1..case when coalesce((payload->>''retarget'')::boolean,false) then 0 else least(qty,coalesce((m.army->>7)::int,0)) end loop');d:=replace(d,'m.army->>7','m.army->>k');d:=replace(d,'''kind'',7,''x'',0','''kind'',k,''x'',0');
 d:=replace(d,'jsonb_build_object(''target'',(payload->>''target'')::int)', 'jsonb_build_object(''target'',(payload->>''target'')::int,''x'',greatest(0,least(21,(payload->>''x'')::numeric)))');execute d;
end $$;
-- Concealed traps do not block 100% destruction or the terminal settlement.
do $$ declare p record;d text;begin
 for p in select oid from pg_proc where pronamespace='nova_private'::regnamespace and prokind='f' and prosrc like '%<>''wall''%' loop
 d:=pg_get_functiondef(p.oid);d:=replace(d,'z.v->>''type''<>''wall''','z.v->>''type'' not in (''wall'',''landmine'',''silo'')');d:=replace(d,'b->>''type''<>''wall''','b->>''type'' not in (''wall'',''landmine'',''silo'')');execute d;
 end loop;
end $$;
