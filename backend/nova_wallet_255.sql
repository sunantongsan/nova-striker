-- Preserve existing credited balances; future accrual remains unclaimed until an ad-backed transfer.
alter table nova_private.mining_intents251 add column purpose255 text not null default 'session' check(purpose255 in ('session','wallet')),add column amount255 bigint not null default 0 check(amount255>=0);
create or replace function nova_private.mining251(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=coalesce(payload->>'mining251','status');p nova_private.miners251;s record;i nova_private.mining_intents251;rid uuid;inv uuid;c text;provider text;amount numeric;bonus numeric;finish timestamptz;stamp timestamptz:=now();active integer;members bigint;rate numeric;latest record;result jsonb;delta bigint;receipt jsonb;purpose text:=coalesce(payload->>'purpose','session');wanted bigint;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 if mode not in ('status','prepare','claim','code','refer') then raise exception 'คำสั่งขุดไม่ถูกต้อง';end if;
 if payload ? 'owner' and payload->>'owner' is distinct from uid::text then raise exception 'ใช้บัญชีเดิมเพื่อตรวจรางวัล';end if;
 perform pg_advisory_xact_lock(153014,1);
 if not exists(select 1 from nova_private.mining_settings251 where enabled) then raise exception 'ระบบขุดกำลังปรับปรุง';end if;
 insert into nova_private.miners251(owner,code,code_key) values(uid,replace(uid::text,'-',''),replace(uid::text,'-','')) on conflict(owner) do nothing;
 insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
 select * into p from nova_private.miners251 where owner=uid for update;
 provider:=case when exists(select 1 from nova_private.telegram_accounts231 where user_id=uid) then 'monetag' else 'test' end;
 if mode='code' then
  c:=btrim(payload->>'code');
  if c is null or char_length(c)<3 or char_length(c)>32 or c ~ '[[:cntrl:]<>/\\?&#%[:space:]]' then raise exception 'รหัสต้องมี 3–32 ตัวอักษร ไม่มีช่องว่างหรือสัญลักษณ์ลิงก์';end if;
  if c ~* '^[a-f0-9]{32}$' and lower(c)<>replace(uid::text,'-','') then raise exception 'รหัสนี้สงวนไว้สำหรับลิงก์บัญชี';end if;
  if exists(select 1 from nova_private.miners251 where code_key=lower(c) and owner<>uid) then raise exception 'รหัสนี้มีผู้ใช้แล้ว';end if;
  update nova_private.miners251 set code=c,code_key=lower(c) where owner=uid;
 elsif mode='refer' then
  if p.inviter is not null or p.first_started is not null then raise exception 'ใส่รหัสได้ครั้งเดียว ก่อนเริ่มขุดครั้งแรก';end if;
  if not exists(select 1 from auth.users u,nova_private.mining_settings251 cfg where u.id=uid and u.created_at>=cfg.launched_at) then raise exception 'รหัสแนะนำสำหรับผู้เล่นใหม่หลังเปิดระบบ';end if;
  select owner into inv from nova_private.miners251 where code_key=lower(btrim(payload->>'code')) or replace(owner::text,'-','')=lower(btrim(payload->>'code'));
  if inv is null or inv=uid then raise exception 'รหัสแนะนำไม่ถูกต้อง';end if;
  if exists(with recursive ancestors as (select owner,inviter from nova_private.miners251 where owner=inv union select m.owner,m.inviter from nova_private.miners251 m join ancestors a on m.owner=a.inviter) select 1 from ancestors where owner=uid) then raise exception 'ไม่สามารถแนะนำวนกลับกันได้';end if;
  update nova_private.miners251 set inviter=inv where owner=uid;
 end if;
 -- Integrate concurrent direct referrals over each unsettled interval, capped at 20 at every instant.
 for s in select * from nova_private.mining_sessions251 where owner=uid and settled_at<least(ends_at,stamp) order by started_at loop
  finish:=least(s.ends_at,stamp);
  with spans as (
   select greatest(rs.started_at,s.settled_at) a,least(rs.ends_at,finish) b
   from nova_private.miners251 m join nova_private.mining_sessions251 rs on rs.owner=m.owner
   where m.inviter=uid and rs.started_at<finish and rs.ends_at>s.settled_at
  ),events as (select a t,1 d from spans union all select b,-1 from spans),totals as (select t,sum(d) d from events group by t),steps as (select t,lead(t) over(order by t) nxt,sum(d) over(order by t) n from totals)
  select coalesce(sum(extract(epoch from(nxt-t))*least(20,n)),0) into bonus from steps where nxt is not null;
  amount:=(extract(epoch from(finish-s.settled_at))+bonus*.15)*s.base_rate/3600;
  update nova_private.miners251 set earned=earned+amount where owner=uid;
  insert into nova_private.mining_ledger251(owner,kind,amount,source) values(uid,'mining',amount,s.id);
  update nova_private.mining_sessions251 set settled_at=finish where id=s.id;
 end loop;
 if mode in ('prepare','claim') then
  rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'ไม่มีรหัสรายการ';end if;
  select * into i from nova_private.mining_intents251 where id=rid;
  if i.id is not null and (i.owner<>uid or i.provider<>provider) then raise exception 'รายการไม่ตรงบัญชี';end if;
  if purpose not in ('session','wallet') then raise exception 'รายการไม่ถูกต้อง';end if;
  if mode='prepare' and i.id is null then
   if purpose='session' and exists(select 1 from nova_private.mining_sessions251 where owner=uid and ends_at>stamp) then raise exception 'รอบขุดยังไม่หมด';end if;
   if purpose='wallet' then
    if coalesce(payload->>'amount','') !~ '^[0-9]{1,12}$' then raise exception 'ระบุจำนวน NOVA เป็นจำนวนเต็ม';end if;
    wanted:=(payload->>'amount')::bigint;
    if wanted<1 or wanted>(select floor(earned)-credited from nova_private.miners251 where owner=uid) then raise exception 'ยอด NOVA ยังไม่พอ';end if;
   end if;
   if provider='monetag' and not coalesce((select enabled from nova_private.monetag_settings231 where id),false) then raise exception 'โฆษณายังไม่พร้อม';end if;
   if provider='test' and not exists(select 1 from nova_private.test_checkin_settings248 where enabled) then raise exception 'โฆษณาทดสอบยังไม่พร้อม';end if;
   select * into i from nova_private.mining_intents251 where owner=uid and claimed_at is null and created_at>stamp-interval '30 minutes' order by created_at desc limit 1;
   if i.id is not null and i.purpose255<>purpose then raise exception 'ทำรายการที่ค้างให้เสร็จก่อน';end if;
   if i.id is null then
    insert into nova_private.mining_intents251(id,owner,provider,purpose255,amount255) values(rid,uid,provider,purpose,coalesce(wanted,0)) returning * into i;
    if provider='monetag' then insert into nova_private.monetag_intents231(owner,id,kind,amount) values(uid,rid,'mining',0);end if;
   end if;
  end if;
  if i.id is null then raise exception 'ไม่พบรายการ';end if;
  if mode='claim' and i.claimed_at is null then
   if payload->>'completed' is distinct from 'true' then raise exception 'ดูโฆษณาให้ครบก่อน';end if;
   if stamp>i.created_at+interval '38 hours' then raise exception 'รายการหมดอายุ กรุณาเริ่มใหม่';end if;
   if provider='test' and not exists(select 1 from nova_private.test_checkin_settings248 where enabled) then raise exception 'โหมดทดสอบหมดอายุ';end if;
   if provider='test' or exists(select 1 from nova_private.monetag_intents231 where id=i.id and owner=uid and kind='mining' and verified_at is not null and not cancelled) then
    if i.purpose255='wallet' then
     select * into p from nova_private.miners251 where owner=uid;
     if i.amount255<1 or i.amount255>floor(p.earned)-p.credited then raise exception 'ยอด NOVA ยังไม่พอ';end if;
     update nova_private.test_wallets set gems=gems+i.amount255 where user_id=uid;
     update nova_private.miners251 set credited=credited+i.amount255 where owner=uid;
     insert into nova_private.mining_ledger251(owner,kind,amount,source) values(uid,'wallet_claim',i.amount255,i.id);
    else
    if exists(select 1 from nova_private.mining_sessions251 where owner=uid and ends_at>stamp) then raise exception 'มีรอบขุดที่ทำงานอยู่แล้ว';end if;
    update nova_private.miners251 set first_started=coalesce(first_started,stamp) where owner=uid;
    select count(*) into members from nova_private.miners251 where first_started is not null;
    rate:=nova_private.mining_rate251(members);
    insert into nova_private.mining_sessions251 values(i.id,uid,stamp,stamp+interval '24 hours',stamp,rate,provider);
    end if;
    update nova_private.mining_intents251 set claimed_at=stamp where id=i.id returning * into i;
    if provider='monetag' then update nova_private.monetag_intents231 set claimed_at=stamp,granted=i.amount255 where id=i.id;end if;
   end if;
  end if;
  receipt:=jsonb_build_object('id',i.id,'claimed',i.claimed_at is not null,'provider',i.provider,'purpose',i.purpose255,'amount',i.amount255,'expires_at',i.created_at+interval '38 hours');
 end if;
 -- A named new base with its first ad-backed session qualifies once; no client-supplied amount.
 for s in select m.owner,m.inviter from nova_private.miners251 m where m.inviter is not null and not m.referral_paid and m.first_started is not null and (m.owner=uid or m.inviter=uid) and exists(select 1 from nova_private.base_names224 b where b.user_id=m.owner) loop
  update nova_private.miners251 set referral_paid=true where owner=s.owner;
  update nova_private.miners251 set earned=earned+500 where owner=s.inviter;
  insert into nova_private.mining_ledger251(owner,kind,amount,source) values(s.inviter,'referral',500,s.owner);
 end loop;
 select * into p from nova_private.miners251 where owner=uid;
 select * into latest from nova_private.mining_sessions251 where owner=uid order by started_at desc limit 1;
 select count(*) into members from nova_private.miners251 where first_started is not null;
 select least(20,count(*))::int into active from nova_private.miners251 m where m.inviter=uid and exists(select 1 from nova_private.mining_sessions251 ss where ss.owner=m.owner and ss.ends_at>stamp and ss.started_at<=stamp);
 result:=jsonb_build_object('owner',uid,'test_gems',(select gems from nova_private.test_wallets where user_id=uid),'mining251',jsonb_build_object('server_time',stamp,'code',p.code,'invited',p.inviter is not null,'started',p.first_started is not null,'referral_eligible',exists(select 1 from auth.users u,nova_private.mining_settings251 cfg where u.id=uid and u.created_at>=cfg.launched_at),'members',members,'base_rate',case when latest.ends_at>stamp then latest.base_rate else nova_private.mining_rate251(members+case when p.first_started is null then 1 else 0 end) end,'active_team',active,'team_total',(select count(*) from nova_private.miners251 where inviter=uid),'credited',p.credited,'earned',p.earned,'unclaimed',greatest(0,p.earned-p.credited),'wallet255',true,'prediction_until',least(latest.ends_at,stamp+interval '60 seconds',(select min(ss.ends_at) from nova_private.miners251 m join nova_private.mining_sessions251 ss on ss.owner=m.owner where m.inviter=uid and ss.ends_at>stamp)),'ends_at',latest.ends_at,'provider',provider,'receipt',receipt));
 return nova_private.test_command_before_mining251('test_status','{}')||result;
end $$;
revoke all on function nova_private.mining251(jsonb) from public,anon,authenticated;

