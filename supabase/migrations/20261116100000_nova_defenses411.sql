-- 411: two new defenses may appear in published layouts: inferno (หอเพลิงอนุภาค, up to 2) and skyguard (ปืนต่อต้านอากาศยาน, up to 3).
do $mig$
declare src text; out text; a text:='"landmine":5,"silo":5}';
begin
 select pg_get_functiondef(p.oid) into src from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='nova_private' and p.proname='command_before_siege';
 if (length(src)-length(replace(src,a,'')))/length(a)<>1 then raise exception 'caps anchor'; end if;
 out:=replace(src,a,'"landmine":5,"silo":5,"inferno":2,"skyguard":3}');
 execute out;
end $mig$;
