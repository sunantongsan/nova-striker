-- Temporary test event. Private account wallet; no client-supplied balances.
create table if not exists nova_private.test_settings(singleton boolean primary key default true check(singleton), enabled boolean not null default true);
insert into nova_private.test_settings values(true,true) on conflict do nothing;
create table if not exists nova_private.test_wallets(user_id uuid primary key references auth.users(id) on delete cascade, gems integer not null default 0 check(gems>=0), claimed_day date);
create table if not exists nova_private.test_receipts(user_id uuid references auth.users(id) on delete cascade, request_id uuid, receipt jsonb not null, primary key(user_id,request_id));
alter table nova_private.test_settings enable row level security;
alter table nova_private.test_wallets enable row level security;
alter table nova_private.test_receipts enable row level security;
revoke all on nova_private.test_settings,nova_private.test_wallets,nova_private.test_receipts from public,anon,authenticated;
create or replace function nova_private.test_command(action text,payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); w nova_private.test_wallets; today date:=(now() at time zone 'Asia/Bangkok')::date; result jsonb; r jsonb; target jsonb; nonce uuid; kind text; qty integer; amount integer; price integer; me public.nova_war_players;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ'; end if;
 if action not in ('test_status','test_claim','test_exchange','test_targets','test_cancel') then raise exception 'คำสั่งไม่ถูกต้อง'; end if;
 if not coalesce((select enabled from nova_private.test_settings where singleton),false) then raise exception 'กิจกรรมทดสอบสิ้นสุดแล้ว'; end if;
 perform pg_advisory_xact_lock(153014,1);
 insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
 select * into w from nova_private.test_wallets where user_id=uid for update;
 if action='test_claim' and (w.claimed_day is null or w.claimed_day<today) then
  update nova_private.test_wallets set gems=gems+10000,claimed_day=today where user_id=uid returning * into w;
 end if;
 if action in ('test_exchange','test_cancel') then
  nonce:=(payload->>'request_id')::uuid;
  if nonce is null then raise exception 'ไม่พบรหัสรายการ'; end if;
  select receipt into r from nova_private.test_receipts where user_id=uid and request_id=nonce;
  if r is null and action='test_cancel' then
   r:=jsonb_build_object('id',nonce,'cancelled',true);
   insert into nova_private.test_receipts values(uid,nonce,r);
  end if;
  if r is null then
   kind:=payload->>'kind';
   if kind is null or kind not in ('gold','power','crystals') then raise exception 'เลือกทรัพยากรไม่ถูกต้อง'; end if;
   qty:=(payload->>'quantity')::integer;
   if qty is null or qty<1 or qty>1000 then raise exception 'จำนวนไม่ถูกต้อง'; end if;
   price:=qty*10; amount:=qty*case when kind='crystals' then 10 else 500 end;
   if w.gems<price then raise exception 'เพชรทดสอบไม่พอ'; end if;
   if kind='crystals' then
    select * into me from public.nova_war_players where user_id=uid;
    if me.user_id is null then raise exception 'เข้าร่วมและส่งผังฐานออนไลน์ก่อนแลกผลึก'; end if;
    select * into me from nova_private.settle(uid);
    if me.crystals+amount>nova_private.capacity(me) then raise exception 'คลังผลึกเต็ม อัปเกรดคลังก่อน'; end if;
    update public.nova_war_players set crystals=crystals+amount where user_id=uid;
   end if;
   update nova_private.test_wallets set gems=gems-price where user_id=uid returning * into w;
   r:=jsonb_build_object('id',nonce,'kind',kind,'amount',amount,'cost',price);
   insert into nova_private.test_receipts values(uid,nonce,r);
  end if;
 end if;
 result:=jsonb_build_object('owner',uid,'test_gems',w.gems,'can_claim',w.claimed_day is null or w.claimed_day<today,'server_day',today,'receipt',r);
 if action in ('test_exchange','test_cancel') then
  select * into me from public.nova_war_players where user_id=uid;
  if me.user_id is not null then result:=result||jsonb_build_object('online',nova_private.command('status','{}')); end if;
 end if;
 if action='test_targets' then
  select jsonb_build_object('id',p.user_id,'callsign',p.callsign,'tier',p.tier,'layout',p.layout,'garrison',p.garrison,'research',p.research,'practice',true,'bot',false) into target
   from public.nova_war_players p where p.user_id<>uid
   order by (p.user_id::text=coalesce(payload->>'previous','')),random() limit 1;
  if target is null then
   target:=jsonb_build_object('id','test-bot','callsign','ฐานทดสอบ NOVA','tier',1,'practice',true,'bot',true,'layout','[{"type":"hq","x":10,"y":10},{"type":"gun","x":8,"y":10},{"type":"tesla","x":12,"y":10},{"type":"mine","x":10,"y":8},{"type":"reactor","x":10,"y":12},{"type":"wall","x":8,"y":12},{"type":"wall","x":9,"y":12}]'::jsonb);
  end if;
  result:=result||jsonb_build_object('target',target);
 end if;
 return result;
end $$;
revoke all on function nova_private.test_command(text,jsonb) from public,anon;
grant execute on function nova_private.test_command(text,jsonb) to authenticated;
create or replace function public.nova_test_command(action text,payload jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select nova_private.test_command(action,payload)$$;
revoke all on function public.nova_test_command(text,jsonb) from public,anon;
grant execute on function public.nova_test_command(text,jsonb) to authenticated;
