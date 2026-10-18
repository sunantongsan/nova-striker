-- NOVA-only enhancements. Existing crystal receipts and jobs retain their original charges.
create or replace function nova_private.command_before_timers225(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();p public.nova_war_players;r jsonb;outcome jsonb;k text;lev int;cost int;rid uuid;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;perform pg_advisory_xact_lock(153014,1);
 if action='research' and payload ? 'enhance' then
  rid:=(payload->>'request_id')::uuid;k:=payload->>'enhance';if rid is null then raise exception 'ต้องมีรหัสรายการ';end if;
  select q.payload into r from nova_private.receipts q where q.user_id=uid and q.request_id=rid;
  if r is not null and r->>'action'<>'enhance' then raise exception 'รหัสรายการไม่ถูกต้อง';end if;
  if r is null then
   if exists(select 1 from nova_private.sieges s where s.finished_at is null and (s.defender=uid or exists(select 1 from nova_private.siege_members m where m.room=s.id and m.owner=uid))) or exists(select 1 from nova_private.live_battles where not finished and (attacker=uid or defender=uid)) then raise exception 'รอการรบสิ้นสุดก่อนตีบวก';end if;
   select * into p from nova_private.settle(uid);if p.user_id is null then return jsonb_build_object('enrolled',false);end if;
   if k is null or not(k ~ '^unit:([0-9]|10|alien)$' or k ~ '^building:[a-z]+$' and exists(select 1 from jsonb_array_elements(p.layout) b where 'building:'||(b->>'type')=k)) then raise exception 'ไม่พบเป้าหมายตีบวก';end if;
   if k='unit:alien' and not exists(select 1 from jsonb_array_elements(p.layout) b where b->>'type'='mercenary') then raise exception 'สร้างฐานทหารรับจ้างก่อน';end if;
   lev:=coalesce((p.enhancements->>k)::int,0);if lev>=10 then raise exception 'ตีบวกสูงสุดแล้ว';end if;
   cost:=100*(lev+1)*(lev+1);
   if payload->>'enhance_currency257' is distinct from 'NOVA' then raise exception 'กรุณาอัปเดตเกมเพื่อใช้ NOVA ตีบวก';end if;
   if (payload->>'quoted_cost257')::int is distinct from cost or (payload->>'quoted_level257')::int is distinct from lev then raise exception 'ราคาตีบวกเปลี่ยน กรุณาเลือกใหม่';end if;
   insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
   perform 1 from nova_private.test_wallets where user_id=uid for update;
   if (select gems from nova_private.test_wallets where user_id=uid)<cost then raise exception 'NOVA ไม่พอ';end if;
   update nova_private.test_wallets set gems=gems-cost where user_id=uid;
   update public.nova_war_players set enhancements=jsonb_set(enhancements,array[k],to_jsonb(lev+1)) where user_id=uid;
   r:=jsonb_build_object('id',rid,'action','enhance','key',k,'level',lev+1,'cost',cost,'currency','NOVA');insert into nova_private.receipts values(uid,rid,r);
  end if;
  outcome:=nova_private.command_before_enhance('status','{}')||jsonb_build_object('receipt',r);
 else outcome:=nova_private.command_before_enhance(action,payload);end if;
 return outcome||jsonb_build_object('enhance_nova257',true,'wallet_gems',(select gems from nova_private.test_wallets where user_id=uid),'enhancements',coalesce((select enhancements from public.nova_war_players where user_id=uid),'{}'));
end $$;
revoke all on function nova_private.command_before_timers225(text,jsonb) from public,anon,authenticated;
-- Enhancement purchases complete in the same transaction; other upgrade queues are unchanged.
alter function nova_private.command(text,jsonb) rename to command_before_nova257;
create function nova_private.command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();r jsonb;receipt jsonb;rid uuid;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 perform pg_advisory_xact_lock(153014,1);
 r:=nova_private.command_before_nova257(action,payload);
 if action='research' and payload ? 'enhance' and r ? 'receipt' then
  rid:=(payload->>'request_id')::uuid;
  update nova_private.upgrade_jobs225 set finishes_at=least(finishes_at,now()) where owner=uid and request_id=rid and category='enhance' and completed_at is null;
  perform nova_private.settle(uid);
  select q.payload into receipt from nova_private.receipts q where q.user_id=uid and q.request_id=rid;
  r:=nova_private.command_before_nova257('status','{}')||jsonb_build_object('receipt',receipt);
 end if;
 return r;
end $$;
revoke all on function nova_private.command_before_nova257(text,jsonb),nova_private.command(text,jsonb) from public,anon,authenticated;
grant execute on function nova_private.command(text,jsonb) to authenticated;
-- Honor already-paid enhancement jobs without any new charge. Battle snapshots remain frozen.
do $$ declare who uuid;begin
 update nova_private.upgrade_jobs225 set finishes_at=least(finishes_at,now()) where category='enhance' and completed_at is null;
 for who in select distinct owner from nova_private.upgrade_jobs225 where category='enhance' and completed_at is null loop perform nova_private.settle(who);end loop;
end $$;
