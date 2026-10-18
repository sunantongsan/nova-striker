-- Future player-raid loot is escrowed until a completed rewarded ad. Existing rewards stay paid.
create table nova_private.raid_rewards260(
 owner uuid not null references auth.users(id),battle uuid not null,report uuid not null unique,
 gold bigint not null check(gold>=0),power bigint not null check(power>=0),nova int not null check(nova>=0),
 created_at timestamptz not null default now(),claimed_at timestamptz,primary key(owner,battle)
);
create table nova_private.raid_intents260(
 id uuid primary key,owner uuid not null,battle uuid not null,provider text not null check(provider in ('test','admob','monetag')),
 created_at timestamptz not null default now(),foreign key(owner,battle) references nova_private.raid_rewards260(owner,battle)
);
alter table nova_private.raid_rewards260 enable row level security;
alter table nova_private.raid_intents260 enable row level security;
revoke all on nova_private.raid_rewards260,nova_private.raid_intents260 from public,anon,authenticated;
alter table nova_private.admob_intents230 drop constraint admob_intents230_kind_check;
alter table nova_private.admob_intents230 add check(kind in ('gold','power','crystals','speed','checkin','production','raid'));
alter table nova_private.monetag_intents231 drop constraint monetag_intents231_kind_check;
alter table nova_private.monetag_intents231 add check(kind in ('gold','power','crystals','speed','checkin','production','mining','raid'));
-- Remove only attacker credits in all three settlement engines; defender loss/shields stay unchanged.
do $$declare src text;name text;before text;begin
 foreach name in array array['command_before_siege(text,jsonb)','siege_finish(uuid)','live_finish(uuid)'] loop
  select pg_get_functiondef(('nova_private.'||name)::regprocedure) into src;before:=src;
  if name like 'command%' then
   src:=replace(src,$rep$nova_private.resource_balance(me,'gold')+gold_loot$rep$,$rep$nova_private.resource_balance(me,'gold')$rep$);
   src:=replace(src,$rep$nova_private.resource_balance(me,'power')+power_loot$rep$,$rep$nova_private.resource_balance(me,'power')$rep$);
   src:=replace(src,'gold_delta=gold_delta+gold_loot,power_delta=power_delta+power_loot,','');
  else
   src:=replace(src,$rep$nova_private.resource_balance(a,'gold')+gl$rep$,$rep$nova_private.resource_balance(a,'gold')$rep$);
   src:=replace(src,$rep$nova_private.resource_balance(a,'power')+pl$rep$,$rep$nova_private.resource_balance(a,'power')$rep$);
   src:=replace(src,'gold_delta=gold_delta+gl,power_delta=power_delta+pl,','');
  end if;
  if src=before then raise exception 'Unknown settlement engine %',name;end if;execute src;
 end loop;
end $$;
create or replace function nova_private.raid_credit255() returns trigger language plpgsql security definer set search_path='' as $$
declare reward int:=0;weight numeric;total numeric;begin
 if new.destruction=100 then
  select nova_private.raid_rate255(nova_private.hq255(a.layout),nova_private.hq255(d.layout)) into reward from public.nova_war_players a,public.nova_war_players d where a.user_id=new.attacker and d.user_id=new.defender;
  if exists(select 1 from nova_private.sieges where id=new.request_id) then
   select count(*),count(*) filter(where owner=new.attacker) into total,weight from nova_private.siege_orders where room=new.request_id and id<=(select ack from nova_private.sieges where id=new.request_id);
   reward:=case when total>0 then floor(reward*weight/total) else 0 end;
  end if;
 end if;
 insert into nova_private.raid_rewards260(owner,battle,report,gold,power,nova) values(new.attacker,new.request_id,new.id,new.loot_gold,new.loot_power,coalesce(reward,0));
 update public.nova_war_reports set nova255=coalesce(reward,0) where id=new.id;return new;
end $$;
create function nova_private.raid260(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'raid260';rid uuid;i nova_private.raid_intents260;r nova_private.raid_rewards260;p public.nova_war_players;provider text;verified bool:=false;g bigint;pw bigint;receipt jsonb;begin
 if uid is null or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 if mode not in ('status','prepare','claim') or mode is null then raise exception 'คำสั่งไม่ถูกต้อง';end if;
 if payload ? 'owner' and payload->>'owner' is distinct from uid::text then raise exception 'รายการไม่ตรงบัญชี';end if;
 perform pg_advisory_xact_lock(153014,1);
 if mode<>'status' then
  select * into r from nova_private.raid_rewards260 where owner=uid and battle=(payload->>'battle')::uuid for update;
  if r.owner is null then raise exception 'ไม่พบรางวัล';end if;
  rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'ไม่มีรหัสรายการ';end if;
  select * into i from nova_private.raid_intents260 where id=rid;
  if i.id is not null and (i.owner<>uid or i.battle<>r.battle) then raise exception 'รายการไม่ตรงบัญชี';end if;
  if mode='prepare' and i.id is null and r.claimed_at is null then
   provider:=case when exists(select 1 from nova_private.telegram_accounts231 where user_id=uid) then 'monetag' when exists(select 1 from nova_private.admob_settings230 where enabled) then 'admob' else 'test' end;
   if provider='test' and not exists(select 1 from nova_private.test_checkin_settings248 where enabled) then raise exception 'โฆษณายังไม่พร้อม';end if;
   if provider='monetag' and not exists(select 1 from nova_private.monetag_settings231 where enabled) then raise exception 'โฆษณายังไม่พร้อม';end if;
   insert into nova_private.raid_intents260(id,owner,battle,provider) values(rid,uid,r.battle,provider) returning * into i;
   if provider='admob' then insert into nova_private.admob_intents230(owner,id,kind,amount) values(uid,rid,'raid',0);
   elsif provider='monetag' then insert into nova_private.monetag_intents231(owner,id,kind,amount) values(uid,rid,'raid',0);end if;
  end if;
  if r.claimed_at is null and i.id is null then raise exception 'ไม่พบรายการ';end if;
  if mode='claim' and r.claimed_at is null then
   if payload->>'completed' is distinct from 'true' then raise exception 'ดูโฆษณาให้ครบก่อน';end if;
   verified:=case i.provider when 'test' then now()<i.created_at+interval '30 minutes' and exists(select 1 from nova_private.test_checkin_settings248 where enabled)
    when 'admob' then exists(select 1 from nova_private.admob_intents230 where owner=uid and id=i.id and kind='raid' and verified_at is not null and not cancelled)
    else exists(select 1 from nova_private.monetag_intents231 where owner=uid and id=i.id and kind='raid' and verified_at is not null and not cancelled) end;
   if verified then
    select * into p from nova_private.settle(uid);
    g:=least(r.gold,greatest(0,p.gold_cap-nova_private.resource_balance(p,'gold')));pw:=least(r.power,greatest(0,p.power_cap-nova_private.resource_balance(p,'power')));
    update public.nova_war_players set resource_gold=nova_private.resource_balance(p,'gold')+g,resource_power=nova_private.resource_balance(p,'power')+pw,gold_delta=gold_delta+g,power_delta=power_delta+pw,resource_at=now() where user_id=uid;
    insert into nova_private.miners251(owner,code,code_key) values(uid,replace(uid::text,'-',''),replace(uid::text,'-','')) on conflict(owner) do nothing;
    insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
    update nova_private.miners251 set earned=earned+r.nova,credited=credited+r.nova where owner=uid;
    update nova_private.test_wallets set gems=gems+r.nova where user_id=uid;
    insert into nova_private.mining_ledger251(owner,kind,amount,source) values(uid,'raid',r.nova,r.report);
    update nova_private.raid_rewards260 set claimed_at=now() where owner=uid and battle=r.battle returning * into r;
    if i.provider='admob' then update nova_private.admob_intents230 set claimed_at=now(),granted=0 where owner=uid and id=i.id;
    elsif i.provider='monetag' then update nova_private.monetag_intents231 set claimed_at=now(),granted=0 where owner=uid and id=i.id;end if;
   end if;
  end if;
  receipt:=jsonb_build_object('id',rid,'battle',r.battle,'provider',i.provider,'claimed',r.claimed_at is not null,'expires_at',i.created_at+interval '30 minutes');
 end if;
 return nova_private.command('status','{}')||jsonb_build_object('owner',uid,'raid260',true,'receipt',receipt,'pending',coalesce((select jsonb_agg(jsonb_build_object('battle',battle,'gold',gold,'power',power,'nova',nova) order by created_at) from nova_private.raid_rewards260 where owner=uid and claimed_at is null and gold+power+nova>0),'[]'::jsonb));
end $$;
alter function nova_private.test_command(text,jsonb) rename to test_command_before_raid260;
create function nova_private.test_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$begin
 if payload ? 'raid260' then
  if action not in ('test_status','test_claim') then raise exception 'คำสั่งไม่ถูกต้อง';end if;
  return nova_private.raid260(payload);
 end if;return nova_private.test_command_before_raid260(action,payload);
end $$;
revoke all on function nova_private.raid260(jsonb),nova_private.test_command_before_raid260(text,jsonb) from public,anon,authenticated;
revoke all on function nova_private.test_command(text,jsonb) from public,anon;
grant execute on function nova_private.test_command(text,jsonb) to authenticated;
