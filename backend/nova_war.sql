-- Nova 1.5 asynchronous PvP. Offline resources are never imported into this ledger.
create schema if not exists nova_private;
revoke all on schema nova_private from public, anon;
grant usage on schema nova_private to authenticated;
create table if not exists public.nova_war_players (
 user_id uuid primary key references auth.users(id) on delete cascade,
 callsign text not null,
 tier integer not null default 1 check(tier between 1 and 5),
 crystals integer not null default 0 check(crystals between 0 and 1000),
 produced_at timestamptz not null default now(),
 shield_until timestamptz not null default now()+interval '15 minutes',
 raid_after timestamptz not null default now(),
 layout jsonb not null,
 joined_at timestamptz not null default now()
);
create table if not exists public.nova_war_reports (
 id uuid primary key default gen_random_uuid(),
 attacker uuid not null references public.nova_war_players(user_id) on delete cascade,
 defender uuid not null references public.nova_war_players(user_id) on delete cascade,
 request_id uuid not null,
 tactic text not null check(tactic in ('infantry','siege','air')),
 destruction integer not null check(destruction between 0 and 100),
 loot integer not null check(loot between 0 and 100),
 created_at timestamptz not null default now(),
 unique(attacker,request_id)
);
create index if not exists nova_war_reports_defender_time on public.nova_war_reports(defender,created_at desc);
create index if not exists nova_war_reports_attacker_time on public.nova_war_reports(attacker,created_at desc);
alter table public.nova_war_players enable row level security;
alter table public.nova_war_reports enable row level security;
revoke all on public.nova_war_players,public.nova_war_reports from public,anon,authenticated;
-- Access is only through the authenticated, ownership-checked command below.
create or replace function nova_private.resolve_raid(layout jsonb, attack_tier integer, defend_tier integer, tactic text)
returns integer language plpgsql immutable set search_path='' as $$
declare guns integer; teslas integer; walls integer; force numeric; defense numeric;
begin
 select count(*) filter(where b->>'type'='gun'),count(*) filter(where b->>'type'='tesla'),count(*) filter(where b->>'type'='wall') into guns,teslas,walls from jsonb_array_elements(layout) b;
 force:=200+attack_tier*85;
 defense:=100+defend_tier*65+guns*24+teslas*40+walls*4;
 if tactic='siege' then defense:=defense-walls*3-guns*7; force:=force-15; end if;
 if tactic='air' then defense:=defense-walls*4+teslas*28; force:=force-10; end if;
 if tactic='infantry' then defense:=defense+guns*10-teslas*8; end if;
 return greatest(0,least(100,round(65+(force-defense)*.28)::integer));
end $$;
revoke all on function nova_private.resolve_raid(jsonb,integer,integer,text) from public,anon,authenticated;
create or replace function nova_private.command(action text, payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); me public.nova_war_players; enemy public.nova_war_players; report public.nova_war_reports;
 target uuid; nonce uuid; tactic text; v_layout jsonb; v_item jsonb; kind text; caps jsonb:='{"hq":1,"barracks":2,"factory":1,"mine":3,"reactor":3,"gun":4,"tesla":2,"camp":2,"wall":30,"airbase":1,"tech":1,"storage":2}';
 result jsonb; available integer; gain integer; pct integer; amount integer;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ'; end if;
 if action not in ('status','enroll','publish','targets','attack','upgrade','history','leave') then raise exception 'คำสั่งไม่ถูกต้อง'; end if;
 -- Small initial population: one short transaction lock prevents double spending and crossed raids.
 perform pg_advisory_xact_lock(153014,1);
 select * into me from public.nova_war_players where user_id=uid;
 if action in ('enroll','publish') then
   v_layout:=payload->'layout';
   if v_layout is null or jsonb_typeof(v_layout)<>'array' or jsonb_array_length(v_layout)<1 or jsonb_array_length(v_layout)>53 then raise exception 'ผังฐานไม่ถูกต้อง'; end if;
   for v_item in select value from jsonb_array_elements(v_layout) loop
     kind:=v_item->>'type';
     if kind is null or not(caps ? kind) or coalesce(v_item->>'x','') !~ '^[1-9]$|^10$' or coalesce(v_item->>'y','') !~ '^[1-9]$|^10$' then raise exception 'ช่องฐานไม่ถูกต้อง'; end if;
   end loop;
   if (select count(*) from jsonb_array_elements(v_layout) b where b->>'type'='hq')<>1
   or exists(select 1 from jsonb_array_elements(v_layout) b group by b->>'x',b->>'y' having count(*)>1)
   or exists(select 1 from jsonb_array_elements(v_layout) b group by b->>'type' having count(*)>(caps->>(b->>'type'))::integer) then raise exception 'จำนวนอาคารหรือผังฐานไม่ถูกต้อง'; end if;
   -- Only the formation is imported. Tier and balances are owned by the server.
   select jsonb_agg(jsonb_build_object('type',b->>'type','x',(b->>'x')::integer,'y',(b->>'y')::integer)) into v_layout from jsonb_array_elements(v_layout) b;
   if me.user_id is null then
     insert into public.nova_war_players(user_id,callsign,layout) values(uid,'NOVA-'||upper(left(uid::text,8)),v_layout) returning * into me;
   else
     update public.nova_war_players p set layout=v_layout where p.user_id=uid returning * into me;
   end if;
 end if;
 if me.user_id is null then return jsonb_build_object('enrolled',false); end if;
 gain:=greatest(0,floor(extract(epoch from(now()-me.produced_at))/180)::integer);
 update public.nova_war_players set crystals=least(1000,crystals+gain),produced_at=case when crystals+gain>=1000 then now() else produced_at+gain*interval '180 seconds' end where user_id=uid returning * into me;
 if action='leave' then delete from public.nova_war_players where user_id=uid; return jsonb_build_object('enrolled',false); end if;
 if action='upgrade' then
   if me.tier>=5 then raise exception 'ระดับสูงสุดแล้ว'; end if;
   if me.crystals<me.tier*150 then raise exception 'ผลึกไม่พอ'; end if;
   update public.nova_war_players set crystals=crystals-tier*150,tier=tier+1 where user_id=uid returning * into me;
 end if;
 result:=jsonb_build_object('enrolled',true,'callsign',me.callsign,'tier',me.tier,'crystals',me.crystals,'capacity',1000,'vault',80,'shield_until',me.shield_until,'raid_after',me.raid_after,'server_time',now());
 if action='targets' then
   select coalesce(jsonb_agg(t),'[]'::jsonb) into v_layout from (
     select p.user_id as id,p.callsign,p.tier,
       least(100,greatest(0,floor((least(1000,p.crystals+greatest(0,floor(extract(epoch from(now()-p.produced_at))/180)::integer))-80)*.25)::integer)) as loot,
       p.layout
     from public.nova_war_players p where p.user_id<>uid and p.shield_until<=now() and abs(p.tier-me.tier)<=1
       and not exists(select 1 from public.nova_war_reports r where r.attacker=uid and r.defender=p.user_id and r.created_at>now()-interval '6 hours')
     order by p.crystals desc,p.user_id limit 20
   )t;
   result:=result||jsonb_build_object('targets',v_layout);
 end if;
 if action='history' then
   select coalesce(jsonb_agg(t),'[]'::jsonb) into v_layout from (
     select r.id,r.attacker=uid as attacking,r.tactic,r.destruction,r.loot,r.created_at,p.callsign as opponent
     from public.nova_war_reports r join public.nova_war_players p on p.user_id=case when r.attacker=uid then r.defender else r.attacker end
     where r.attacker=uid or r.defender=uid order by r.created_at desc limit 20
   )t;
   result:=result||jsonb_build_object('history',v_layout);
 end if;
 if action='attack' then
   target:=(payload->>'target')::uuid;nonce:=(payload->>'request_id')::uuid;tactic:=payload->>'tactic';
   if target is null or nonce is null or target=uid or tactic is null or tactic not in ('infantry','siege','air') then raise exception 'เป้าหมายไม่ถูกต้อง'; end if;
   select * into report from public.nova_war_reports where attacker=uid and request_id=nonce;
   if report.id is not null then return result||jsonb_build_object('report',jsonb_build_object('id',report.id,'destruction',report.destruction,'loot',report.loot,'tactic',report.tactic)); end if;
   if me.raid_after>now() then raise exception 'หน่วยจู่โจมยังไม่พร้อม รอครบ 3 นาที'; end if;
   select * into enemy from public.nova_war_players where user_id=target;
   if enemy.user_id is null or abs(enemy.tier-me.tier)>1 then raise exception 'ไม่พบฐานระดับใกล้เคียง'; end if;
   if enemy.shield_until>now() then raise exception 'ฐานนี้มีโล่คุ้มครองแล้ว'; end if;
   if exists(select 1 from public.nova_war_reports where attacker=uid and defender=target and created_at>now()-interval '6 hours') then raise exception 'ต้องรอ 6 ชั่วโมงก่อนบุกคนเดิม'; end if;
   gain:=greatest(0,floor(extract(epoch from(now()-enemy.produced_at))/180)::integer);
   available:=least(1000,enemy.crystals+gain);
   pct:=nova_private.resolve_raid(enemy.layout,me.tier,enemy.tier,tactic);
   amount:=least(100,floor(greatest(0,available-80)*.25)::integer);
   amount:=least(1000-me.crystals,floor(amount*pct/100.0)::integer);
   update public.nova_war_players set crystals=available-amount,produced_at=case when available=1000 then now() else produced_at+gain*interval '180 seconds' end,shield_until=now()+interval '30 minutes' where user_id=target;
   update public.nova_war_players set crystals=crystals+amount,raid_after=now()+interval '3 minutes',shield_until=now() where user_id=uid returning * into me;
   insert into public.nova_war_reports(attacker,defender,request_id,tactic,destruction,loot) values(uid,target,nonce,tactic,pct,amount) returning * into report;
   result:=result||jsonb_build_object('crystals',me.crystals,'shield_until',me.shield_until,'raid_after',me.raid_after,'report',jsonb_build_object('id',report.id,'destruction',pct,'loot',amount,'tactic',tactic));
 end if;
 return result;
end $$;
revoke all on function nova_private.command(text,jsonb) from public,anon;
grant execute on function nova_private.command(text,jsonb) to authenticated;
create or replace function public.nova_war_command(action text,payload jsonb default '{}'::jsonb)
returns jsonb language sql security invoker set search_path='' as $$ select nova_private.command(action,payload); $$;
revoke all on function public.nova_war_command(text,jsonb) from public,anon;
grant execute on function public.nova_war_command(text,jsonb) to authenticated;
