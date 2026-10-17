-- Permanent account-owned builder slots and receipt-backed timer speedups.
create table nova_private.builders228(owner uuid primary key references auth.users(id) on delete cascade, amount int not null default 1 check(amount between 1 and 5));
create table nova_private.support_receipts228(owner uuid references auth.users(id) on delete cascade, request_id uuid not null, payload jsonb not null, primary key(owner,request_id));
alter table nova_private.builders228 enable row level security;
alter table nova_private.support_receipts228 enable row level security;
revoke all on nova_private.builders228,nova_private.support_receipts228 from public,anon,authenticated;
alter function nova_private.command(text,jsonb) rename to command_before_support228;
create function nova_private.command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); mode text:=payload->>'support228';op text;rid uuid;j nova_private.upgrade_jobs225;r jsonb;outcome jsonb;cnt int;cost int:=0;quote int;signature jsonb;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 perform pg_advisory_xact_lock(153014,1);
 cnt:=coalesce((select amount from nova_private.builders228 where owner=uid),1);
 if mode is not null then
  if payload ? 'owner' and payload->>'owner' is distinct from uid::text then raise exception 'ใช้บัญชีเดิมเพื่อตรวจรายการ';end if;
  if action<>'research' or mode not in ('buy','speed','cancel') then raise exception 'คำสั่งช่างไม่ถูกต้อง';end if;
  if not exists(select 1 from public.nova_war_players where user_id=uid) then raise exception 'เข้าร่วมฐานออนไลน์ก่อน';end if;
  rid:=(payload->>'request_id')::uuid;op:=case when mode='cancel' then payload->>'operation' else mode end;
  if rid is null or op is null or op not in ('buy','speed') then raise exception 'รหัสรายการช่างไม่ถูกต้อง';end if;
  signature:=jsonb_build_object('operation',op,'job_id',payload->>'job_id','expected',payload->>'expected');
  select q.payload into r from nova_private.support_receipts228 q where q.owner=uid and q.request_id=rid;
  if r is not null then
   if r->'signature' is distinct from signature then raise exception 'รหัสรายการช่างถูกใช้แล้ว';end if;
  else
   if mode<>'cancel' then
    if nova_private.siege_locked(uid) or exists(select 1 from nova_private.siege_members m join nova_private.sieges s on s.id=m.room where m.owner=uid and s.finished_at is null) or exists(select 1 from nova_private.live_battles where not finished and (attacker=uid or defender=uid)) then raise exception 'รอการรบสิ้นสุดก่อน';end if;
    quote:=(payload->>'quoted')::int;
    if quote is null or quote<0 or quote>100000 then raise exception 'ราคาไม่ถูกต้อง';end if;
    perform nova_private.settle(uid);
    if op='buy' then
     if cnt>=5 then raise exception 'มีโดรนครบ 5 ตัวแล้ว';end if;
     if (payload->>'expected')::int is distinct from cnt then raise exception 'จำนวนช่างเปลี่ยน กรุณาตรวจรายการ';end if;
     cost:=(array[25,100,500,1500])[cnt];
    else
     select * into j from nova_private.upgrade_jobs225 where owner=uid and request_id=(payload->>'job_id')::uuid for update;
     if j.request_id is null then raise exception 'ไม่พบงานอัปเกรดของบัญชีนี้';end if;
     cost:=case when j.completed_at is not null then 0 else greatest(0,ceil(extract(epoch from(j.finishes_at-now()))/30))::int end;
    end if;
    if cost>quote then raise exception 'ราคาเปลี่ยน กรุณาตรวจรายการ';end if;
    if cost>0 then
     -- Use the existing online gem ledger, as shield and crystal exchanges do.
     perform nova_private.test_command('test_claim','{}');
     if (select gems from nova_private.test_wallets where user_id=uid)<cost then raise exception 'เพชรออนไลน์ไม่พอ';end if;
     update nova_private.test_wallets set gems=gems-cost where user_id=uid;
    end if;
    if op='buy' then cnt:=cnt+1;insert into nova_private.builders228 values(uid,cnt) on conflict(owner) do update set amount=excluded.amount;
    elsif j.completed_at is null then update nova_private.upgrade_jobs225 set finishes_at=now() where owner=uid and request_id=j.request_id;perform nova_private.settle(uid);end if;
   end if;
   r:=jsonb_build_object('id',rid,'action','support228','operation',op,'cost',cost,'cancelled',mode='cancel','signature',signature,'builder_count',cnt);
   insert into nova_private.support_receipts228 values(uid,rid,r);
  end if;
  outcome:=nova_private.command_before_support228('status','{}')||jsonb_build_object('receipt',r);
 else
  if action='infrastructure' and not exists(select 1 from nova_private.receipts q where q.user_id=uid and q.request_id=(command.payload->>'request_id')::uuid) then
   perform nova_private.settle(uid);
   if (select count(*) from nova_private.upgrade_jobs225 where owner=uid and category='infrastructure' and completed_at is null)>=cnt then raise exception 'โดรนช่างกำลังทำงานครบทุกตัว';end if;
  end if;
  outcome:=nova_private.command_before_support228(action,payload);
 end if;
 return outcome||jsonb_build_object('builder_count',coalesce((select amount from nova_private.builders228 where owner=uid),1),'support228',true);
end $$;
revoke all on function nova_private.command(text,jsonb),nova_private.command_before_support228(text,jsonb) from public,anon,authenticated;
grant execute on function nova_private.command(text,jsonb) to authenticated;
-- Freeze defender builder count when the battle is created; clients cannot choose it.
create function nova_private.siege_builders228() returns trigger language plpgsql set search_path='' as $$
begin new.target:=new.target||jsonb_build_object('builder_count',coalesce((select amount from nova_private.builders228 where owner=new.defender),1));return new;end $$;
create trigger nova_siege_builders228 before insert on nova_private.sieges for each row execute function nova_private.siege_builders228();
revoke all on function nova_private.siege_builders228() from public,anon,authenticated;
alter function nova_private.siege_command(jsonb) rename to siege_command_before_builders228;
create function nova_private.siege_command(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r jsonb;begin
 if auth.uid() is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 r:=nova_private.siege_command_before_builders228(payload);
 if r ? 'target' then r:=jsonb_set(r,'{target,builder_count}',to_jsonb(coalesce((select amount from nova_private.builders228 where owner=(r->'target'->>'id')::uuid),1)));end if;
 return r;
end $$;
revoke all on function nova_private.siege_command(jsonb),nova_private.siege_command_before_builders228(jsonb) from public,anon,authenticated;
grant execute on function nova_private.siege_command(jsonb) to authenticated;
