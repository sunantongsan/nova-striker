-- 410: four red-fluid (Fluid Z) troops take army indices 11-14.
-- Armies sent by the client may now hold 11 entries (older app) or up to 15 (patch 410+).
-- Only length/index bounds change; every other rule (counts <=150, roster limits, placement) stays.
do $mig$
declare src text; out text;
 procedure_name text;
begin
 -- live battles (legacy live room)
 select pg_get_functiondef(p.oid) into src from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='nova_private' and p.proname='live_command_before_siege';
 out:=src;
 if (length(out)-length(replace(out,'jsonb_array_length(v)<>11','')))/length('jsonb_array_length(v)<>11')<>1 then raise exception 'live start anchor'; end if;
 out:=replace(out,'jsonb_array_length(v)<>11','jsonb_array_length(v) not between 11 and 15');
 if (length(out)-length(replace(out,'jsonb_array_length(f->''army'')<>11','')))/length('jsonb_array_length(f->''army'')<>11')<>1 then raise exception 'live frame anchor'; end if;
 out:=replace(out,'jsonb_array_length(f->''army'')<>11','jsonb_array_length(f->''army'')<>jsonb_array_length(b.roster)');
 if (length(out)-length(replace(out,'for n in 0..10 loop','')))/length('for n in 0..10 loop')<>1 then raise exception 'live loop anchor'; end if;
 out:=replace(out,'for n in 0..10 loop','for n in 0..jsonb_array_length(b.roster)-1 loop');
 execute out;

 -- siege rooms (current PvP)
 select pg_get_functiondef(p.oid) into src from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='nova_private' and p.proname='siege_command_before_enhance';
 out:=src;
 if (length(out)-length(replace(out,'jsonb_array_length(army)<>11','')))/length('jsonb_array_length(army)<>11')<>1 then raise exception 'siege start anchor'; end if;
 out:=replace(out,'jsonb_array_length(army)<>11','jsonb_array_length(army) not between 11 and 15');
 if (length(out)-length(replace(out,'k not between 0 and 10','')))/length('k not between 0 and 10')<>1 then raise exception 'siege deploy anchor'; end if;
 out:=replace(out,'k not between 0 and 10','k not between 0 and 14 or k>=jsonb_array_length(m.army)');
 execute out;
end $mig$;

-- 410b: NOVA enhancement accepts the red troops too (unit:11..unit:14).
do $mig$
declare src text; out text; a text:='^unit:([0-9]|10|alien|transport)$';
begin
 select pg_get_functiondef(p.oid) into src from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='nova_private' and p.proname='command_before_timers225';
 if (length(src)-length(replace(src,a,'')))/length(a)<>1 then raise exception 'enhance anchor'; end if;
 out:=replace(src,a,'^unit:([0-9]|1[0-4]|alien|transport)$');
 execute out;
end $mig$;
