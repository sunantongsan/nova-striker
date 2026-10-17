-- Check-in is earned only through a completed, provider-verified rewarded ad.
alter table nova_private.admob_intents230 drop constraint admob_intents230_kind_check;
alter table nova_private.admob_intents230 add check(kind in ('gold','power','crystals','speed','checkin'));
alter table nova_private.monetag_intents231 drop constraint monetag_intents231_kind_check;
alter table nova_private.monetag_intents231 add check(kind in ('gold','power','crystals','speed','checkin'));
-- Block direct claims, including older clients. Status and existing balances survive.
do $$declare body text;begin
 body:=pg_get_functiondef('nova_private.test_command(text,jsonb)'::regprocedure);
 if strpos(body,$x$if action='test_claim' and payload->>'checkin233'='true'$x$)=0 then raise exception 'Unexpected checkin implementation';end if;
 body:=replace(body,$x$if action='test_claim' and payload->>'checkin233'='true'$x$,$x$if false and action='test_claim' and payload->>'checkin233'='true'$x$);
 body:=replace(body,'return result||', 'return result||jsonb_build_object(''admob230'',coalesce((select enabled from nova_private.admob_settings230 where id),false),''monetag231'',exists(select 1 from nova_private.telegram_accounts231 where user_id=uid) and coalesce((select enabled from nova_private.monetag_settings231 where id),false))||');
 execute body;
end $$;
create function nova_private.checkin_ad234(action text,payload jsonb,provider text) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text;tbl text;enabled bool;rid uuid;r record;w nova_private.test_wallets;day date:=(now() at time zone 'Asia/Bangkok')::date;reward_day date;amount bigint;streak integer;result jsonb;
begin
 if uid is null or payload->>'owner' is distinct from uid::text then raise exception 'ใช้บัญชีเดิมเพื่อตรวจรางวัล';end if;
 if provider='monetag' then
  if not exists(select 1 from nova_private.telegram_accounts231 where user_id=uid) then raise exception 'กรุณาเข้าสู่ระบบ';end if;
  tbl:='monetag_intents231';mode:=payload->>'monetag231';select s.enabled into enabled from nova_private.monetag_settings231 s where id;
 elsif provider='admob' then tbl:='admob_intents230';mode:=payload->>'admob230';select s.enabled into enabled from nova_private.admob_settings230 s where id;
 else raise exception 'Invalid provider';end if;
 if action<>'research' or mode is null or mode not in ('prepare','claim','status','cancel') then raise exception 'คำสั่งรางวัลไม่ถูกต้อง';end if;
 rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'ไม่มีรหัสรางวัล';end if;
 perform pg_advisory_xact_lock(153014,1);
 insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
 select * into w from nova_private.test_wallets where user_id=uid for update;
 execute format('select * from nova_private.%I where owner=$1 and id=$2 for update',tbl) into r using uid,rid;
 if r.id is not null and r.kind<>'checkin' then raise exception 'รหัสรางวัลถูกใช้แล้ว';end if;
 if mode='cancel' and r.id is null then
  execute format('insert into nova_private.%I(owner,id,kind,amount,cancelled) values($1,$2,''checkin'',0,true) returning *',tbl) into r using uid,rid;
 elsif mode='cancel' and r.verified_at is null then
  execute format('update nova_private.%I set cancelled=true where owner=$1 and id=$2 returning *',tbl) into r using uid,rid;
 elsif mode='prepare' and r.id is null then
  if not coalesce(enabled,false) then raise exception 'โฆษณารางวัลยังไม่เปิดให้บริการ';end if;
  if w.claimed_day>=day then raise exception 'รับเช็กอินวันนี้แล้ว';end if;
  if payload->>'job' is not null then raise exception 'Invalid checkin job';end if;
  if exists(select 1 from nova_private.admob_intents230 where owner=uid and created_at>now()-interval '2 minutes') or exists(select 1 from nova_private.monetag_intents231 where owner=uid and created_at>now()-interval '2 minutes') then raise exception 'รอ 2 นาทีก่อนดูครั้งต่อไป';end if;
  streak:=case when w.claimed_day=day-1 then w.checkin_streak233+1 else 1 end;amount:=20+5*(streak-1);
  execute format('insert into nova_private.%I(owner,id,kind,amount) values($1,$2,''checkin'',$3) returning *',tbl) into r using uid,rid,amount;
 end if;
 if r.id is null then raise exception 'ไม่พบรายการรางวัล';end if;
 reward_day:=(r.created_at at time zone 'Asia/Bangkok')::date;
 -- SDK completion alone never grants. A provider postback alone also cannot trigger this claim.
 if mode='claim' and payload->>'completed234'='true' and r.verified_at is not null and r.claimed_at is null and not r.cancelled then
  amount:=0;
  if w.claimed_day is null or w.claimed_day<reward_day then
   amount:=r.amount;
   update nova_private.test_wallets set gems=gems+amount,claimed_day=reward_day,checkin_streak233=((amount-20)/5+1)::int,checkin_reward233=amount::int where user_id=uid;
  end if;
  execute format('update nova_private.%I set claimed_at=now(),granted=$3 where owner=$1 and id=$2 returning *',tbl) into r using uid,rid,amount;
 end if;
 result:=nova_private.test_command('test_status','{}');
 return result||jsonb_build_object('admob230',provider='admob' and enabled,'monetag231',provider='monetag' and enabled,'ad_reward',jsonb_build_object('id',r.id,'kind',r.kind,'amount',r.amount,'day',reward_day,'expires_at',r.expires_at,'verified',r.verified_at is not null,'claimed',r.claimed_at is not null,'granted',r.granted,'cancelled',r.cancelled));
end $$;
revoke all on function nova_private.checkin_ad234(text,jsonb,text) from public,anon,authenticated;
-- Route check-in receipts before the resource-ad handler (no PvP enrollment required).
do $migration$declare body text;begin
 body:=pg_get_functiondef('nova_private.command_before_resources233(text,jsonb)'::regprocedure);
 body:=replace(body,' perform pg_advisory_xact_lock(153014,1);',$route$ if payload->>'admob230' is not null and (payload->>'kind'='checkin' or exists(select 1 from nova_private.admob_intents230 i where i.owner=uid and i.id=(payload->>'request_id')::uuid and i.kind='checkin')) then return nova_private.checkin_ad234(action,payload,'admob');end if;
 perform pg_advisory_xact_lock(153014,1);$route$);
 execute body;
end $migration$;
do $migration$declare body text;begin
 body:=pg_get_functiondef('public.nova_telegram_command(text,jsonb)'::regprocedure);
 body:=replace(body,' perform pg_advisory_xact_lock(153014,1);',$route$ if payload->>'monetag231' is not null and (payload->>'kind'='checkin' or exists(select 1 from nova_private.monetag_intents231 i where i.owner=uid and i.id=(payload->>'request_id')::uuid and i.kind='checkin')) then return nova_private.checkin_ad234(action,payload,'monetag');end if;
 perform pg_advisory_xact_lock(153014,1);$route$);
 execute body;
end $migration$;
