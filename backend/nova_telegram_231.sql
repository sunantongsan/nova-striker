-- Telegram identities and Monetag receipts are separate from Android AdMob.
create table nova_private.telegram_accounts231(
 telegram_id bigint primary key check(telegram_id>0),
 email text not null unique default ('tg-'||replace(gen_random_uuid()::text,'-','')||'@telegram.nova.invalid'),
 user_id uuid unique references auth.users(id) on delete cascade
);
alter table nova_private.telegram_accounts231 enable row level security;
revoke all on nova_private.telegram_accounts231 from public,anon,authenticated;
create function public.nova_telegram_account231(tg bigint, bind_user uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare r nova_private.telegram_accounts231;
begin
 if tg is null or tg<=0 then raise exception 'invalid_telegram_id';end if;
 insert into nova_private.telegram_accounts231(telegram_id) values(tg) on conflict do nothing;
 select * into r from nova_private.telegram_accounts231 where telegram_id=tg for update;
 if bind_user is not null then
  if r.user_id is not null and r.user_id<>bind_user then raise exception 'identity_mismatch';end if;
  if not exists(select 1 from auth.users where id=bind_user and email=r.email) then raise exception 'email_mismatch';end if;
  update nova_private.telegram_accounts231 set user_id=bind_user where telegram_id=tg returning * into r;
 end if;
 return jsonb_build_object('email',r.email,'user_id',r.user_id);
end $$;
revoke all on function public.nova_telegram_account231(bigint,uuid) from public,anon,authenticated;
grant execute on function public.nova_telegram_account231(bigint,uuid) to service_role;
create table nova_private.monetag_settings231(id bool primary key default true check(id),enabled bool not null default false,secret_hash text);
insert into nova_private.monetag_settings231(id) values(true);
create table nova_private.monetag_intents231(
 owner uuid not null references auth.users(id) on delete cascade,id uuid not null unique,
 kind text not null check(kind in ('gold','power','crystals','speed')),job uuid,amount bigint not null,
 created_at timestamptz not null default now(),expires_at timestamptz not null default(now()+interval '30 minutes'),
 verified_at timestamptz,claimed_at timestamptz,granted bigint,cancelled bool not null default false,
 primary key(owner,id)
);
alter table nova_private.monetag_settings231 enable row level security;
alter table nova_private.monetag_intents231 enable row level security;
revoke all on nova_private.monetag_settings231,nova_private.monetag_intents231 from public,anon,authenticated;
create function public.nova_monetag_verify231(secret text,intent uuid,tg bigint,zone text,event text,reward text) returns bool language plpgsql security definer set search_path='' as $$
declare r nova_private.monetag_intents231;expected text;
begin
 select secret_hash into expected from nova_private.monetag_settings231 where id;
 if expected is null or secret is null or encode(sha256(convert_to(secret,'UTF8')),'hex')<>expected then raise exception 'invalid_secret';end if;
 if zone is distinct from '12052624' or event not in ('impression','click') or event is null or reward is distinct from 'valued' then return false;end if;
 perform pg_advisory_xact_lock(153014,1);
 select * into r from nova_private.monetag_intents231 where id=intent for update;
 if r.id is null or r.cancelled then return false;end if;
 if not exists(select 1 from nova_private.telegram_accounts231 where user_id=r.owner and telegram_id=tg) then return false;end if;
 if r.verified_at is not null then return true;end if;
 if now()>r.expires_at+interval '38 hours' then return false;end if;
 update nova_private.monetag_intents231 set verified_at=now() where id=intent;
 return true;
end $$;
revoke all on function public.nova_monetag_verify231(text,uuid,bigint,text,text,text) from public,anon,authenticated;
grant execute on function public.nova_monetag_verify231(text,uuid,bigint,text,text,text) to service_role;
create function public.nova_telegram_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
<<monetag231>>
declare uid uuid:=auth.uid();mode text:=payload->>'monetag231';r nova_private.monetag_intents231;p public.nova_war_players;result jsonb;rid uuid;kind text;job uuid;amount bigint;enabled bool;
begin
 if uid is null or not exists(select 1 from nova_private.telegram_accounts231 where user_id=uid) then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 perform pg_advisory_xact_lock(153014,1);
 select s.enabled into enabled from nova_private.monetag_settings231 s where id;
 if mode is null then return nova_private.command(action,payload)||jsonb_build_object('monetag231',enabled,'admob230',false);end if;
 if action<>'research' or mode not in ('prepare','claim','status','cancel') then raise exception 'คำสั่งรางวัลไม่ถูกต้อง';end if;
 if payload->>'owner' is distinct from uid::text then raise exception 'ใช้บัญชีเดิมเพื่อตรวจรางวัล';end if;
 rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'ไม่มีรหัสรางวัล';end if;
 result:=nova_private.command('status',payload-'monetag231');
 select * into p from public.nova_war_players where user_id=uid;
 if p.user_id is null then raise exception 'เชื่อมต่อฐานออนไลน์ก่อนรับรางวัล';end if;
 select * into r from nova_private.monetag_intents231 where owner=uid and id=rid for update;
 if mode='cancel' then
  if r.id is null then insert into nova_private.monetag_intents231(owner,id,kind,amount,cancelled) values(uid,rid,'gold',0,true) returning * into r;
  elsif r.verified_at is null then update nova_private.monetag_intents231 set cancelled=true where owner=uid and id=rid returning * into r;end if;
 end if;
 if mode='prepare' then
  kind:=payload->>'kind';job:=(payload->>'job')::uuid;
  if r.id is not null then
   if r.kind is distinct from kind or r.job is distinct from job then raise exception 'รหัสรางวัลถูกใช้แล้ว';end if;
  else
   if not enabled then raise exception 'โฆษณารางวัลยังไม่เปิดให้บริการ';end if;
   if kind is null or kind not in ('gold','power','crystals','speed') then raise exception 'เลือกรางวัลไม่ถูกต้อง';end if;
   if nova_private.siege_locked(uid) or exists(select 1 from nova_private.siege_members m join nova_private.sieges s on s.id=m.room where m.owner=uid and s.finished_at is null) or exists(select 1 from nova_private.live_battles where not finished and(attacker=uid or defender=uid)) then raise exception 'รอการรบสิ้นสุดก่อน';end if;
   if exists(select 1 from nova_private.monetag_intents231 where owner=uid and created_at>now()-interval '2 minutes') then raise exception 'รอ 2 นาทีก่อนดูครั้งต่อไป';end if;
   if kind='speed' then
    select least(1500,greatest(0,ceil(extract(epoch from(finishes_at-now())))))::bigint into amount from nova_private.upgrade_jobs225 where owner=uid and request_id=job and completed_at is null;
   elsif job is not null then raise exception 'ทรัพยากรไม่ใช้รหัสงาน';
   elsif kind='crystals' then amount:=least(nova_private.rate(p)/4,greatest(0,nova_private.capacity(p)-p.crystals));
   else
    select coalesce(sum((b->>'lv')::int*1080),0) into amount from jsonb_array_elements(p.layout) b where b->>'type'=case when kind='gold' then 'mine' else 'reactor' end;
    amount:=least(amount,greatest(0,case when kind='gold' then p.gold_cap else p.power_cap end-nova_private.resource_balance(p,kind)));
   end if;
   if amount is null or amount<=0 then raise exception 'ไม่มีรางวัลที่รับได้ คลังเต็มหรือไม่มีงาน';end if;
   insert into nova_private.monetag_intents231(owner,id,kind,job,amount) values(uid,rid,kind,job,amount) returning * into r;
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
  update nova_private.monetag_intents231 set claimed_at=now(),granted=monetag231.amount where owner=uid and id=rid returning * into r;
 end if;
 return nova_private.command('status','{}')||jsonb_build_object('monetag231',enabled,'admob230',false,'ad_reward',jsonb_build_object('id',r.id,'kind',r.kind,'job',r.job,'amount',r.amount,'expires_at',r.expires_at,'verified',r.verified_at is not null,'claimed',r.claimed_at is not null,'granted',r.granted,'cancelled',r.cancelled));
end $$;
revoke all on function public.nova_telegram_command(text,jsonb) from public,anon;
grant execute on function public.nova_telegram_command(text,jsonb) to authenticated;
