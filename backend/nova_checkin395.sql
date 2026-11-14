-- 395: daily check-in = 5 NOVA free, or 15 NOVA (x3) by finishing a rewarded video.
-- A free claim can be topped up once to 15 by a video the same Thai day (+10).
-- Existing balances, streaks and receipts are untouched; the 7-day 50/200 schedule is retired.
begin;
alter table nova_private.test_wallets add column if not exists checkin_ad395 date;

do $migration$ declare body text; original text; f record; changed integer:=0;
begin
 -- Rewarded-video check-in (AdMob / Monetag): 15 NOVA, or the remainder up to 15 after a free claim.
 body:=pg_get_functiondef('nova_private.checkin_ad234(text,jsonb,text)'::regprocedure);
 if strpos(body,'amount:=case when (streak-1)%7=6 then 200 else 50 end')=0 then raise exception 'checkin_ad234 drift (amount)';end if;
 if strpos(body,$o$if w.claimed_day>=day then raise exception 'รับเช็กอินวันนี้แล้ว';end if;$o$)=0 then raise exception 'checkin_ad234 drift (cap)';end if;
 if strpos(body,'checkin_streak233=coalesce(r.checkin_streak340,((amount-20)/5+1)::int),checkin_reward233=amount::int where user_id=uid;')=0 then raise exception 'checkin_ad234 drift (claim)';end if;
 body:=replace(body,$o$if w.claimed_day>=day then raise exception 'รับเช็กอินวันนี้แล้ว';end if;$o$,
  $n$if w.claimed_day>=day and (w.checkin_ad395 is not distinct from day or coalesce(w.checkin_reward233,0)>=15) then raise exception 'รับเช็กอินวันนี้แล้ว';end if;$n$);
 body:=replace(body,'streak:=case when w.claimed_day=day-1 then','streak:=case when w.claimed_day>=day then w.checkin_streak233 when w.claimed_day=day-1 then');
 body:=replace(body,'amount:=case when (streak-1)%7=6 then 200 else 50 end','amount:=case when w.claimed_day>=day then 15-coalesce(w.checkin_reward233,0) else 15 end');
 body:=replace(body,'checkin_streak233=coalesce(r.checkin_streak340,((amount-20)/5+1)::int),checkin_reward233=amount::int where user_id=uid;',
  $n$checkin_streak233=coalesce(r.checkin_streak340,1),checkin_reward233=amount::int,checkin_ad395=reward_day where user_id=uid;
  elsif w.claimed_day=reward_day and w.checkin_ad395 is distinct from reward_day and coalesce(w.checkin_reward233,0)<15 then
   amount:=15-coalesce(w.checkin_reward233,0);
   update nova_private.test_wallets set gems=gems+amount,checkin_reward233=15,checkin_ad395=reward_day where user_id=uid;$n$);
 execute body;

 -- Retired test-video adapter keeps the same daily value if it is ever re-enabled.
 body:=pg_get_functiondef('nova_private.test_command_before_mining251(text,jsonb)'::regprocedure);
 if strpos(body,'grant_amount:=case when (streak340-1)%7=6 then 200 else 50 end;')=0 then raise exception 'test-video drift';end if;
 body:=replace(body,'grant_amount:=case when (streak340-1)%7=6 then 200 else 50 end;','grant_amount:=15;');
 body:=replace(body,'checkin_reward233=grant_amount where user_id=uid;','checkin_reward233=grant_amount,checkin_ad395=today where user_id=uid;');
 execute body;

 -- Status: next free reward, video reward and the top-up still available today.
 original:=$o$'next_reward',case when (case when w.claimed_day>=today-1 then w.checkin_streak233 else 0 end)%7=6 then 200 else 50 end,$o$;
 for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='nova_private' and p.prokind='f' and strpos(p.prosrc,original)>0 loop
  body:=pg_get_functiondef(f.oid);
  body:=replace(body,original,$n$'next_reward',5,'free395',5,'video395',15,'ad_bonus395',case when w.checkin_ad395 is not distinct from today then 0 when w.claimed_day>=today then greatest(0,15-coalesce(w.checkin_reward233,0)) else 15 end,'schedule395',true,$n$);
  execute body;changed:=changed+1;
 end loop;
 if changed<>1 then raise exception 'Unexpected status builders: %',changed;end if;
end $migration$;

-- Free claim transport: test_status/test_claim with {"checkin395":"free"}. Signed-in accounts only, once per Thai day.
alter function nova_private.test_command(text,jsonb) rename to test_command_before395;
create function nova_private.test_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();w nova_private.test_wallets;today date:=(now() at time zone 'Asia/Bangkok')::date;streak integer;
begin
 if not(payload ? 'checkin395') then return nova_private.test_command_before395(action,payload);end if;
 if action not in('test_status','test_claim') or payload->>'checkin395' is distinct from 'free' then raise exception 'คำสั่งเช็คอินไม่ถูกต้อง';end if;
 if uid is null or not exists(select 1 from auth.users u where u.id=uid and not coalesce(u.is_anonymous,false)) then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 perform pg_advisory_xact_lock(153014,1);
 insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
 select * into w from nova_private.test_wallets where user_id=uid for update;
 if w.claimed_day is null or w.claimed_day<today then
  streak:=case when w.claimed_day=today-1 then coalesce(w.checkin_streak233,0)+1 else 1 end;
  update nova_private.test_wallets set gems=gems+5,claimed_day=today,checkin_streak233=streak,checkin_reward233=5 where user_id=uid;
 end if;
 return nova_private.test_command_before395('test_status',(payload-'checkin395')||'{"checkin233":true}')||jsonb_build_object('free395',true);
end $$;
revoke all on function nova_private.test_command(text,jsonb) from public,anon;
grant execute on function nova_private.test_command(text,jsonb) to authenticated;
revoke all on function nova_private.test_command_before395(text,jsonb) from public,anon,authenticated;
commit;
