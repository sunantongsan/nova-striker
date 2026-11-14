-- 397: check-in is a choice, once per Thai day: normal check-in = 5 NOVA, or video check-in = 15 NOVA.
-- Removes the 395/396 same-day +10 top-up. A video prepared before a normal check-in grants nothing.
begin;
do $migration$ declare body text; original text; f record; changed integer:=0;
begin
 body:=pg_get_functiondef('nova_private.checkin_ad234(text,jsonb,text)'::regprocedure);
 if strpos(body,$o$if w.claimed_day>=day and (w.checkin_ad395 is not distinct from day or coalesce(w.checkin_reward233,0)>=15) then raise$o$)=0
  or strpos(body,'amount:=case when w.claimed_day>=day then 15-coalesce(w.checkin_reward233,0) else 15 end')=0
  or strpos(body,'elsif w.claimed_day=reward_day and w.checkin_ad395 is distinct from reward_day and coalesce(w.checkin_reward233,0)<15 then')=0 then raise exception 'checkin_ad234 drift';end if;
 body:=replace(body,$o$if w.claimed_day>=day and (w.checkin_ad395 is not distinct from day or coalesce(w.checkin_reward233,0)>=15) then raise$o$,'if w.claimed_day>=day then raise');
 body:=replace(body,'amount:=case when w.claimed_day>=day then 15-coalesce(w.checkin_reward233,0) else 15 end','amount:=15');
 body:=replace(body,'elsif w.claimed_day=reward_day and w.checkin_ad395 is distinct from reward_day and coalesce(w.checkin_reward233,0)<15 then','elsif false then');
 execute body;

 body:=pg_get_functiondef('nova_private.test_command_before_mining251(text,jsonb)'::regprocedure);
 if strpos(body,$o$if w.claimed_day>=today and (w.checkin_ad395 is not distinct from today or coalesce(w.checkin_reward233,0)>=15) then raise$o$)=0
  or strpos(body,'grant_amount:=case when w.claimed_day>=today then 15-coalesce(w.checkin_reward233,0) else 15 end;')=0
  or strpos(body,'elsif enabled and r.day=today and w.claimed_day=today and w.checkin_ad395 is distinct from today and coalesce(w.checkin_reward233,0)<15 then')=0 then raise exception 'test-video drift';end if;
 body:=replace(body,$o$if w.claimed_day>=today and (w.checkin_ad395 is not distinct from today or coalesce(w.checkin_reward233,0)>=15) then raise$o$,'if w.claimed_day>=today then raise');
 body:=replace(body,'grant_amount:=case when w.claimed_day>=today then 15-coalesce(w.checkin_reward233,0) else 15 end;','grant_amount:=15;');
 body:=replace(body,'elsif enabled and r.day=today and w.claimed_day=today and w.checkin_ad395 is distinct from today and coalesce(w.checkin_reward233,0)<15 then','elsif false then');
 execute body;

 original:=$o$'ad_bonus395',case when w.checkin_ad395 is not distinct from today then 0 when w.claimed_day>=today then greatest(0,15-coalesce(w.checkin_reward233,0)) else 15 end$o$;
 for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='nova_private' and p.prokind='f' and strpos(p.prosrc,original)>0 loop
  body:=replace(pg_get_functiondef(f.oid),original,$n$'ad_bonus395',case when w.claimed_day>=today then 0 else 15 end,'choice397',true$n$);
  execute body;changed:=changed+1;
 end loop;
 if changed<>1 then raise exception 'Unexpected status builders: %',changed;end if;
end $migration$;
commit;
