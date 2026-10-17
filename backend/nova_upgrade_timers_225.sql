-- Deferred crystal upgrades. Existing validation and debit rules remain authoritative.
create table nova_private.upgrade_jobs225 (
 owner uuid not null references public.nova_war_players(user_id) on delete cascade,
 request_id uuid not null, job_key text not null, category text not null,
 item text not null, target_level int not null, started_at timestamptz not null default now(),
 finishes_at timestamptz not null, completed_at timestamptz,
 primary key(owner,request_id)
);
create unique index nova_upgrade_active225 on nova_private.upgrade_jobs225(owner,job_key) where completed_at is null;
alter table nova_private.upgrade_jobs225 enable row level security;
revoke all on nova_private.upgrade_jobs225 from public,anon,authenticated;
alter function nova_private.settle(uuid) rename to settle_before_timers225;
create function nova_private.settle(who uuid) returns public.nova_war_players language plpgsql set search_path='' as $$
declare p public.nova_war_players;j nova_private.upgrade_jobs225;
begin
 p:=nova_private.settle_before_timers225(who);
 if p.user_id is null or (nova_private.siege_locked(who) or exists(select 1 from nova_private.siege_members m join nova_private.sieges s on s.id=m.room where m.owner=who and s.finished_at is null) or exists(select 1 from nova_private.live_battles where not finished and (attacker=who or defender=who))) then return p;end if;
 for j in select * from nova_private.upgrade_jobs225 where owner=who and completed_at is null and finishes_at<=now() order by finishes_at for update loop
  if j.category='enhance' then update public.nova_war_players set enhancements=jsonb_set(enhancements,array[j.item],to_jsonb(j.target_level)) where user_id=who;
  elsif j.category='infrastructure' then
   update public.nova_war_players set infra=jsonb_set(infra,array[j.item],to_jsonb(j.target_level)),layout=(select jsonb_agg(case when b->>'type'=j.item then b||jsonb_build_object('lv',j.target_level) else b end) from jsonb_array_elements(layout) b) where user_id=who;
  elsif j.category='research' then update public.nova_war_players set research=jsonb_set(research,array[j.item],to_jsonb(j.target_level)) where user_id=who;
  elsif j.category='upgrade' then update public.nova_war_players set tier=j.target_level where user_id=who;end if;
  update nova_private.upgrade_jobs225 set completed_at=now() where owner=who and request_id=j.request_id;
  update nova_private.receipts set payload=payload||jsonb_build_object('pending',false,'completed',true) where user_id=who and request_id=j.request_id;
 end loop;
 select * into p from public.nova_war_players where user_id=who;return p;
end $$;
revoke all on function nova_private.settle(uuid),nova_private.settle_before_timers225(uuid) from public,anon,authenticated;
alter function nova_private.command(text,jsonb) rename to command_before_timers225;
create function nova_private.command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();p public.nova_war_players;a public.nova_war_players;r jsonb;outcome jsonb;category text;k text;item text;rid uuid;lev int;seconds int;finish timestamptz;j nova_private.upgrade_jobs225;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 perform pg_advisory_xact_lock(153014,1);
 p:=nova_private.settle(uid);
 if action in ('publish','enroll') and p.user_id is not null and jsonb_typeof(payload->'layout')='array' then
  payload:=jsonb_set(payload,'{layout}',(select jsonb_agg(case when exists(select 1 from nova_private.upgrade_jobs225 u where u.owner=uid and u.category='infrastructure' and u.item=b->>'type') then b||jsonb_build_object('lv',(p.infra->>(b->>'type'))::int) else b end) from jsonb_array_elements(payload->'layout') b));
 end if;
 if action in ('infrastructure','research','upgrade') then
  category:=case when action='research' and payload ? 'enhance' then 'enhance' else action end;
  item:=case when category='enhance' then payload->>'enhance' when category='upgrade' then 'tier' else payload->>'kind' end;
  k:=category||':'||item;rid:=coalesce((payload->>'request_id')::uuid,case when category='upgrade' then gen_random_uuid() end);
  if rid is null then raise exception 'ต้องมีรหัสรายการ';end if;
  select q.payload into r from nova_private.receipts q where q.user_id=uid and q.request_id=rid;
  if r is not null then
   if r->>'action' is distinct from category then raise exception 'รหัสรายการไม่ถูกต้อง';end if;
   select * into j from nova_private.upgrade_jobs225 where owner=uid and request_id=rid;
   if j.request_id is not null and j.job_key is distinct from k then raise exception 'รหัสรายการไม่ถูกต้อง';end if;
   outcome:=nova_private.command_before_timers225('status','{}')||jsonb_build_object('receipt',r);
  else
   if exists(select 1 from nova_private.upgrade_jobs225 where owner=uid and job_key=k and completed_at is null) then raise exception 'รายการนี้กำลังอัปเกรด รอเวลาให้ครบ';end if;
   if p.user_id is not null and nova_private.siege_locked(uid) then raise exception 'รอการรบสิ้นสุดก่อนอัปเกรด';end if;
   outcome:=nova_private.command_before_timers225(action,payload||jsonb_build_object('request_id',rid));
   if coalesce((outcome->>'enrolled')::bool,false) then
    select * into a from public.nova_war_players where user_id=uid;
    if category='enhance' then
     lev:=(a.enhancements->>item)::int;update public.nova_war_players set enhancements=p.enhancements where user_id=uid;
    elsif category='infrastructure' then
     lev:=(a.infra->>item)::int;update public.nova_war_players set infra=p.infra where user_id=uid;
    elsif category='research' then
     lev:=(a.research->>item)::int;update public.nova_war_players set research=p.research where user_id=uid;
    else lev:=a.tier;update public.nova_war_players set tier=p.tier where user_id=uid;end if;
    seconds:=case when category='infrastructure' then case when lev-1<3 then 15*(lev-1) else 60*(lev-1)*(lev-2) end else 60*lev*lev end;
    finish:=now()+make_interval(secs=>seconds);
    insert into nova_private.upgrade_jobs225(owner,request_id,job_key,category,item,target_level,finishes_at) values(uid,rid,k,category,item,lev,finish);
    r:=coalesce(outcome->'receipt',jsonb_build_object('id',rid,'action',category))||jsonb_build_object('pending',true,'level',lev,'seconds',seconds,'finishes_at',finish);
    insert into nova_private.receipts(user_id,request_id,payload) values(uid,rid,r) on conflict(user_id,request_id) do update set payload=excluded.payload;
    outcome:=nova_private.command_before_timers225('status','{}')||jsonb_build_object('receipt',r);
   end if;
  end if;
 else
  if action='leave' and exists(select 1 from nova_private.upgrade_jobs225 where owner=uid and completed_at is null) then raise exception 'รออัปเกรดให้เสร็จก่อนถอนฐาน';end if;
  outcome:=nova_private.command_before_timers225(action,payload);
 end if;
 return outcome||jsonb_build_object('server_time',now(),'active_upgrades',coalesce((select jsonb_agg(jsonb_build_object('id',u.request_id,'key',u.job_key,'category',u.category,'item',u.item,'level',u.target_level,'started_at',u.started_at,'finishes_at',u.finishes_at) order by u.finishes_at) from nova_private.upgrade_jobs225 u where u.owner=uid and u.completed_at is null),'[]'::jsonb));
end $$;
revoke all on function nova_private.command(text,jsonb),nova_private.command_before_timers225(text,jsonb) from public,anon,authenticated;
grant execute on function nova_private.command(text,jsonb) to authenticated;
