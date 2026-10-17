-- Disabled until app/account approval. Signature verification is performed by the Edge Function.
create table nova_private.admob_settings230(id bool primary key default true check(id),enabled bool not null default false);
insert into nova_private.admob_settings230 values(true,false);
create table nova_private.admob_intents230(
 owner uuid not null references auth.users(id) on delete cascade,id uuid not null,
 kind text not null check(kind in ('gold','power','crystals','speed')),job uuid,amount bigint not null,
 created_at timestamptz not null default now(),expires_at timestamptz not null default(now()+interval '30 minutes'),
 transaction text unique,verified_at timestamptz,claimed_at timestamptz,granted bigint,cancelled bool not null default false,
 primary key(owner,id)
);
alter table nova_private.admob_settings230 enable row level security;
alter table nova_private.admob_intents230 enable row level security;
revoke all on nova_private.admob_settings230,nova_private.admob_intents230 from public,anon,authenticated;
create function public.nova_admob_verify230(who uuid,intent uuid,transaction text,earned_ms bigint) returns bool language plpgsql security definer set search_path='' as $$
declare r nova_private.admob_intents230;earned timestamptz;
begin
 perform pg_advisory_xact_lock(153014,1);
 select * into r from nova_private.admob_intents230 where owner=who and id=intent for update;
 if r.id is null or r.cancelled then return false;end if;
 if r.transaction is not null then return r.transaction=transaction;end if;
 earned:=to_timestamp(earned_ms/1000.0);
 if length(transaction) not between 1 and 256 or earned<r.created_at-interval '1 minute' or earned>r.expires_at or earned>now()+interval '5 minutes' then return false;end if;
 if exists(select 1 from nova_private.admob_intents230 a where a.transaction=nova_admob_verify230.transaction) then return false;end if;
 update nova_private.admob_intents230 set transaction=nova_admob_verify230.transaction,verified_at=now() where owner=who and id=intent;
 return true;
end $$;
-- Function label for unambiguous parameter references uses the actual function name.
revoke all on function public.nova_admob_verify230(uuid,uuid,text,bigint) from public,anon,authenticated;
grant execute on function public.nova_admob_verify230(uuid,uuid,text,bigint) to service_role;
alter function nova_private.command(text,jsonb) rename to command_before_admob230;
do $$begin execute replace(pg_get_functiondef('nova_private.command_before_admob230(text,jsonb)'::regprocedure),'command.payload','command_before_admob230.payload');end$$;
create function nova_private.command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
<<admob230>>
declare uid uuid:=auth.uid();mode text:=payload->>'admob230';r nova_private.admob_intents230;p public.nova_war_players;result jsonb;rid uuid;kind text;job uuid;amount bigint;enabled bool;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 perform pg_advisory_xact_lock(153014,1);
 select s.enabled into enabled from nova_private.admob_settings230 s where id;
 if mode is null then return nova_private.command_before_admob230(action,payload)||jsonb_build_object('admob230',enabled);end if;
 if action<>'research' or mode not in ('prepare','claim','status','cancel') then raise exception 'คำสั่งรางวัลไม่ถูกต้อง';end if;
 if payload->>'owner' is distinct from uid::text then raise exception 'ใช้บัญชีเดิมเพื่อตรวจรางวัล';end if;
 rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'ไม่มีรหัสรางวัล';end if;
 result:=nova_private.command_before_admob230('status',payload-'admob230');
 select * into p from public.nova_war_players where user_id=uid;
 if p.user_id is null then raise exception 'เชื่อมต่อฐานออนไลน์ก่อนรับรางวัล';end if;
 select * into r from nova_private.admob_intents230 where owner=uid and id=rid for update;
 if mode='cancel' then
  if r.id is null then insert into nova_private.admob_intents230(owner,id,kind,amount,cancelled) values(uid,rid,'gold',0,true) returning * into r;
  elsif r.verified_at is null then update nova_private.admob_intents230 set cancelled=true where owner=uid and id=rid returning * into r;end if;
 end if;
 if mode='prepare' then
  kind:=payload->>'kind';job:=(payload->>'job')::uuid;
  if r.id is not null then
   if r.kind is distinct from kind or r.job is distinct from job then raise exception 'รหัสรางวัลถูกใช้แล้ว';end if;
  else
   if not enabled then raise exception 'โฆษณารางวัลยังไม่เปิดให้บริการ';end if;
   if kind is null or kind not in ('gold','power','crystals','speed') then raise exception 'เลือกรางวัลไม่ถูกต้อง';end if;
   if nova_private.siege_locked(uid) or exists(select 1 from nova_private.siege_members m join nova_private.sieges s on s.id=m.room where m.owner=uid and s.finished_at is null) or exists(select 1 from nova_private.live_battles where not finished and(attacker=uid or defender=uid)) then raise exception 'รอการรบสิ้นสุดก่อน';end if;
   if exists(select 1 from nova_private.admob_intents230 where owner=uid and created_at>now()-interval '2 minutes') then raise exception 'รอ 2 นาทีก่อนดูครั้งต่อไป';end if;
   if kind='speed' then
    select least(1500,greatest(0,ceil(extract(epoch from(finishes_at-now())))))::bigint into amount from nova_private.upgrade_jobs225 where owner=uid and request_id=job and completed_at is null;
   elsif job is not null then raise exception 'ทรัพยากรไม่ใช้รหัสงาน';
   elsif kind='crystals' then amount:=least(nova_private.rate(p)/4,greatest(0,nova_private.capacity(p)-p.crystals));
   else
    select coalesce(sum((b->>'lv')::int*1080),0) into amount from jsonb_array_elements(p.layout) b where b->>'type'=case when kind='gold' then 'mine' else 'reactor' end;
    amount:=least(amount,greatest(0,case when kind='gold' then p.gold_cap else p.power_cap end-nova_private.resource_balance(p,kind)));
   end if;
   if amount is null or amount<=0 then raise exception 'ไม่มีรางวัลที่รับได้ คลังเต็มหรือไม่มีงาน';end if;
   insert into nova_private.admob_intents230(owner,id,kind,job,amount) values(uid,rid,kind,job,amount) returning * into r;
  end if;
 end if;
 if r.id is null then raise exception 'ไม่พบรายการรางวัล';end if;
 if mode='claim' and not r.cancelled and r.verified_at is not null and r.claimed_at is null then
  if nova_private.siege_locked(uid) or exists(select 1 from nova_private.siege_members m join nova_private.sieges s on s.id=m.room where m.owner=uid and s.finished_at is null) or exists(select 1 from nova_private.live_battles where not finished and(attacker=uid or defender=uid)) then raise exception 'รอการรบสิ้นสุดก่อน รางวัลถูกเก็บไว้แล้ว';end if;
  amount:=0;
  if r.kind='speed' then
   select least(r.amount,greatest(0,ceil(extract(epoch from(finishes_at-now())))))::bigint into amount from nova_private.upgrade_jobs225 where owner=uid and request_id=r.job and completed_at is null;
   amount:=coalesce(amount,0);
   update nova_private.upgrade_jobs225 set finishes_at=greatest(now(),finishes_at-make_interval(secs=>amount::int)) where owner=uid and request_id=r.job and completed_at is null;
   perform nova_private.settle(uid);
  elsif r.kind='crystals' then
   amount:=least(r.amount,greatest(0,nova_private.capacity(p)-p.crystals));
   update public.nova_war_players set crystals=crystals+amount where user_id=uid;
  else
   amount:=least(r.amount,greatest(0,case when r.kind='gold' then p.gold_cap else p.power_cap end-nova_private.resource_balance(p,r.kind)));
   update public.nova_war_players set resource_gold=nova_private.resource_balance(p,'gold')+case when r.kind='gold' then amount else 0 end,resource_power=nova_private.resource_balance(p,'power')+case when r.kind='power' then amount else 0 end,gold_delta=gold_delta+case when r.kind='gold' then amount else 0 end,power_delta=power_delta+case when r.kind='power' then amount else 0 end,resource_at=now() where user_id=uid;
  end if;
  update nova_private.admob_intents230 set claimed_at=now(),granted=admob230.amount where owner=uid and id=rid returning * into r;
 end if;
 return nova_private.command_before_admob230('status','{}')||jsonb_build_object('admob230',enabled,'ad_reward',jsonb_build_object('id',r.id,'kind',r.kind,'job',r.job,'amount',r.amount,'expires_at',r.expires_at,'verified',r.verified_at is not null,'claimed',r.claimed_at is not null,'granted',r.granted,'cancelled',r.cancelled));
end $$;
revoke all on function nova_private.command(text,jsonb),nova_private.command_before_admob230(text,jsonb) from public,anon,authenticated;
grant execute on function nova_private.command(text,jsonb) to authenticated;
