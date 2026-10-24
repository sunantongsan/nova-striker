-- Seven-day rewarded check-in. Existing balances and already-prepared receipts remain intact.
alter table nova_private.admob_intents230 add column checkin_streak340 integer;
alter table nova_private.monetag_intents231 add column checkin_streak340 integer;
alter table nova_private.test_checkin_receipts248 add column checkin_streak340 integer;

do $migration$ declare body text; original text; f record; changed integer:=0;
begin
 body:=pg_get_functiondef('nova_private.checkin_ad234(text,jsonb,text)'::regprocedure);
 if strpos(body,'amount:=20+5*(streak-1)')=0 then raise exception 'Unexpected check-in reward handler';end if;
 body:=replace(body,'amount:=20+5*(streak-1)','amount:=case when (streak-1)%7=6 then 200 else 50 end');
 body:=replace(body,$old$if exists(select 1 from nova_private.admob_intents230 where owner=uid and created_at>now()-interval '2 minutes') or exists(select 1 from nova_private.monetag_intents231 where owner=uid and created_at>now()-interval '2 minutes') then raise exception 'รอ 2 นาทีก่อนดูครั้งต่อไป';end if;$old$,'-- Daily cap and verified receipts protect check-in; no unrelated ad cooldown.');
 body:=replace(body,$old$nova_private.%I(owner,id,kind,amount) values($1,$2,''checkin'',$3) returning *$old$,$new$nova_private.%I(owner,id,kind,amount,checkin_streak340) values($1,$2,''checkin'',$3,$4) returning *$new$);
 body:=replace(body,'into r using uid,rid,amount;','into r using uid,rid,amount,streak;');
 body:=replace(body,'checkin_streak233=((amount-20)/5+1)::int','checkin_streak233=coalesce(r.checkin_streak340,((amount-20)/5+1)::int)');
 execute body;

 -- The test-video adapter uses the same schedule and once-per-day wallet cap.
 body:=pg_get_functiondef('nova_private.test_command_before_mining251(text,jsonb)'::regprocedure);
 if strpos(body,'grant_amount:=20+5*')=0 then raise exception 'Unexpected test-video handler';end if;
 body:=replace(body,'grant_amount integer;','grant_amount integer;streak340 integer;');
 body:=replace(body,'grant_amount:=20+5*(case when w.claimed_day=today-1 then w.checkin_streak233 else 0 end);','streak340:=case when w.claimed_day=today-1 then w.checkin_streak233+1 else 1 end;grant_amount:=case when (streak340-1)%7=6 then 200 else 50 end;');
 body:=replace(body,'test_checkin_receipts248(owner,day,id,amount) values(uid,today,rid,grant_amount)','test_checkin_receipts248(owner,day,id,amount,checkin_streak340) values(uid,today,rid,grant_amount,streak340)');
 body:=replace(body,'checkin_streak233=(grant_amount-20)/5+1','checkin_streak233=coalesce(r.checkin_streak340,(grant_amount-20)/5+1)');
 execute body;

 -- Locate the original status builder in the installed wrapper chain.
 original:=$old$'next_reward',20+5*(case when w.claimed_day>=today-1 then w.checkin_streak233 else 0 end)$old$;
 for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='nova_private' and p.prokind='f' and strpos(p.prosrc,original)>0 loop
  body:=pg_get_functiondef(f.oid);
  body:=replace(body,original,$new$'next_reward',case when (case when w.claimed_day>=today-1 then w.checkin_streak233 else 0 end)%7=6 then 200 else 50 end,'server_time',now(),'next_reset',((today+1)::timestamp at time zone 'Asia/Bangkok'),'schedule340',true$new$);
  execute body;changed:=changed+1;
 end loop;
 if changed<>1 then raise exception 'Unexpected status builders: %',changed;end if;
end $migration$;
-- No new execution grants: internal functions stay private; public commands enforce auth.uid().
