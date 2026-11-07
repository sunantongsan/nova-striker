-- Absent timers mean no speed-up quote; debit paths remain strict.
begin;
do $migration$
declare fn text; body text; old text; col text;
begin
 for fn,col in select * from (values
 ('titan_state_before347','finishes_at'),
 ('titan_state_before355','recovery_until347'),
 ('titan_state_before370','upgrade_until355')) as states(fn,col)
 loop
  body:=pg_get_functiondef(('nova_private.'||fn||'(uuid)')::regprocedure);
  old:='nova_private.speed_price365(extract(epoch from('||col||'-now())))';
  if strpos(body,old)=0 then raise exception 'Timer quote drift: %',fn;end if;
  execute replace(body,old,'nova_private.speed_price365(greatest(0,extract(epoch from('||col||'-now()))))');
 end loop;
end $migration$;
commit;
