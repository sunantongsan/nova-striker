-- 396: while AdMob approval is pending, check-in videos use Google's demo rewarded ad (248 adapter).
-- Same daily values as 395: video = 15 NOVA, or +10 after a free 5 NOVA claim; 15 NOVA max per Thai day.
-- The window still closes by itself as soon as nova_private.admob_settings230 is enabled.
begin;
alter table nova_private.test_checkin_receipts248 drop constraint test_checkin_receipts248_amount_check, add constraint test_checkin_receipts248_amount_check check(amount>0);
do $migration$ declare body text;
begin
 body:=pg_get_functiondef('nova_private.test_command_before_mining251(text,jsonb)'::regprocedure);
 if strpos(body,$o$if w.claimed_day>=today then raise exception 'รับเช็กอินวันนี้แล้ว';end if;$o$)=0 or strpos(body,'grant_amount:=15;')=0
  or strpos(body,'checkin_reward233=grant_amount,checkin_ad395=today where user_id=uid;')=0 or strpos(body,'streak340:=case when w.claimed_day=today-1 then')=0 then raise exception 'test-video drift';end if;
 body:=replace(body,$o$if w.claimed_day>=today then raise exception 'รับเช็กอินวันนี้แล้ว';end if;$o$,
  $n$if w.claimed_day>=today and (w.checkin_ad395 is not distinct from today or coalesce(w.checkin_reward233,0)>=15) then raise exception 'รับเช็กอินวันนี้แล้ว';end if;$n$);
 body:=replace(body,'streak340:=case when w.claimed_day=today-1 then','streak340:=case when w.claimed_day>=today then w.checkin_streak233 when w.claimed_day=today-1 then');
 body:=replace(body,'grant_amount:=15;','grant_amount:=case when w.claimed_day>=today then 15-coalesce(w.checkin_reward233,0) else 15 end;');
 body:=replace(body,'checkin_reward233=grant_amount,checkin_ad395=today where user_id=uid;',
  $n$checkin_reward233=grant_amount,checkin_ad395=today where user_id=uid;
   elsif enabled and r.day=today and w.claimed_day=today and w.checkin_ad395 is distinct from today and coalesce(w.checkin_reward233,0)<15 then
    grant_amount:=15-coalesce(w.checkin_reward233,0);
    update nova_private.test_wallets set gems=gems+grant_amount,checkin_reward233=15,checkin_ad395=today where user_id=uid;$n$);
 execute body;
end $migration$;
update nova_private.test_checkin_settings248 set enabled=true,expires_at='2027-12-31 17:00:00+00';
commit;
