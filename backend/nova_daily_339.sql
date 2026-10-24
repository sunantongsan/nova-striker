-- Restore daily rewards and retire new mining sessions; keep earned balances and receipts.
-- Existing 24-hour sessions may finish; no new sessions can be prepared or claimed.
create or replace function nova_private.checkin_ad234(action text,payload jsonb,provider text) returns jsonb language plpgsql security definer set search_path='' as $$
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

do $migration$ declare f record; body text; old text := $old$if payload ? 'checkin_test248' then raise exception 'เช็คอินเปลี่ยนเป็นระบบขุด กรุณาอัปเดตเกม';end if;$old$; changed integer:=0;
begin
 for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='nova_private' and p.prokind='f' and strpos(p.prosrc,old)>0 loop
  body:=pg_get_functiondef(f.oid);execute replace(body,old,'-- Daily check-in restored by release 339.');changed:=changed+1;
 end loop;
 if changed<>1 then raise exception 'Unexpected daily check-in routing: %',changed;end if;
 body:=pg_get_functiondef('nova_private.mining251(jsonb)'::regprocedure);
 if strpos(body,'purpose text')=0 or strpos(body,'-- Retired sessions 339')>0 then raise exception 'Unexpected mining version';end if;
 body:=replace(body,$old$ perform pg_advisory_xact_lock(153014,1);$old$,$new$ -- Retired sessions 339: check both requested purpose and the stored receipt.
 if mode in ('prepare','claim') and (purpose<>'wallet' or exists(select 1 from nova_private.mining_intents251 where id=(payload->>'request_id')::uuid and purpose255<>'wallet')) then raise exception 'ระบบขุดเปลี่ยนเป็นเช็คอินรายวัน กรุณาอัปเดตเกม';end if;
 perform pg_advisory_xact_lock(153014,1);$new$);
 -- Old unclaimed session intents cannot block recovery of earned NOVA.
 body:=replace(body,$old$where owner=uid and claimed_at is null and created_at>stamp-interval '30 minutes'$old$,$new$where owner=uid and purpose255=purpose and claimed_at is null and created_at>stamp-interval '30 minutes'$new$);
 execute body;
end $migration$;
