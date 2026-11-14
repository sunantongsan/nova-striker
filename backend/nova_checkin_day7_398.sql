-- 398: day 7 of an unbroken streak: normal check-in 15 NOVA, video check-in 45 NOVA (x3).
-- Days 1-6 stay 5 / 15. Still one check-in per Thai day; a missed day restarts at day 1.
begin;
do $migration$ declare body text; original text; f record; changed integer:=0;
begin
 body:=pg_get_functiondef('nova_private.checkin_ad234(text,jsonb,text)'::regprocedure);
 if strpos(body,'end;amount:=15;')=0 then raise exception 'checkin_ad234 drift';end if;
 execute replace(body,'end;amount:=15;','end;amount:=case when (streak-1)%7=6 then 45 else 15 end;');

 body:=pg_get_functiondef('nova_private.test_command_before_mining251(text,jsonb)'::regprocedure);
 if strpos(body,'grant_amount:=15;')=0 then raise exception 'test-video drift';end if;
 execute replace(body,'grant_amount:=15;','grant_amount:=case when (streak340-1)%7=6 then 45 else 15 end;');

 original:=$o$'next_reward',5,'free395',5,'video395',15,'ad_bonus395',case when w.claimed_day>=today then 0 else 15 end$o$;
 for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='nova_private' and p.prokind='f' and strpos(p.prosrc,original)>0 loop
  body:=replace(pg_get_functiondef(f.oid),original,$n$'next_reward',case when (case when w.claimed_day>=today-1 then w.checkin_streak233 else 0 end)%7=6 then 15 else 5 end,'free395',case when (case when w.claimed_day>=today-1 then w.checkin_streak233 else 0 end)%7=6 then 15 else 5 end,'video395',case when (case when w.claimed_day>=today-1 then w.checkin_streak233 else 0 end)%7=6 then 45 else 15 end,'ad_bonus395',case when w.claimed_day>=today then 0 when (case when w.claimed_day>=today-1 then w.checkin_streak233 else 0 end)%7=6 then 45 else 15 end,'day7_398',true$n$);
  execute body;changed:=changed+1;
 end loop;
 if changed<>1 then raise exception 'Unexpected status builders: %',changed;end if;
end $migration$;

create or replace function nova_private.test_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();w nova_private.test_wallets;today date:=(now() at time zone 'Asia/Bangkok')::date;streak integer;amount integer;
begin
 if not(payload ? 'checkin395') then return nova_private.test_command_before395(action,payload);end if;
 if action not in('test_status','test_claim') or payload->>'checkin395' is distinct from 'free' then raise exception 'คำสั่งเช็คอินไม่ถูกต้อง';end if;
 if uid is null or not exists(select 1 from auth.users u where u.id=uid and not coalesce(u.is_anonymous,false)) then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 perform pg_advisory_xact_lock(153014,1);
 insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
 select * into w from nova_private.test_wallets where user_id=uid for update;
 if w.claimed_day is null or w.claimed_day<today then
  streak:=case when w.claimed_day=today-1 then coalesce(w.checkin_streak233,0)+1 else 1 end;
  amount:=case when (streak-1)%7=6 then 15 else 5 end;
  update nova_private.test_wallets set gems=gems+amount,claimed_day=today,checkin_streak233=streak,checkin_reward233=amount where user_id=uid;
 end if;
 return nova_private.test_command_before395('test_status',(payload-'checkin395')||'{"checkin233":true}')||jsonb_build_object('free395',true);
end $$;
commit;
