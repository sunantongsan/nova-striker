-- 428: five army/research buildings may appear in published layouts, one of each:
-- tech428 (อาคารเทคโนโลยี), forge428 (โรงตีอุปกรณ์), workshop428 (โรงประกอบยานบุก), dronehub428 (ศูนย์โดรนคู่หู), herohall428 (หอบัญชาการหุ่น).
do $mig$
declare src text; out text; a text:='"inferno":2,"skyguard":3}';
begin
 select pg_get_functiondef(p.oid) into src from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='nova_private' and p.proname='command_before_siege';
 if (length(src)-length(replace(src,a,'')))/length(a)<>1 then raise exception 'caps anchor'; end if;
 out:=replace(src,a,'"inferno":2,"skyguard":3,"tech428":1,"forge428":1,"workshop428":1,"dronehub428":1,"herohall428":1}');
 execute out;
end $mig$;
