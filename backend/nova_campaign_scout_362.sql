-- First campaign victory only; server determines NOVA and deduplicates by account/stage.
create table nova_private.campaign_rewards362 (
 owner uuid not null references auth.users(id), stage int not null check(stage between 1 and 100),
 stars int not null check(stars between 1 and 3), amount int not null check(amount between 1 and 6),
 created_at timestamptz not null default now(), primary key(owner,stage)
);
alter table nova_private.campaign_rewards362 enable row level security;
revoke all on nova_private.campaign_rewards362 from public,anon,authenticated;
create table nova_private.scout_receipts362 (
 owner uuid not null references auth.users(id), id uuid not null, target uuid not null,
 cost int not null check(cost in(0,100)), primary key(owner,id)
);
alter table nova_private.scout_receipts362 enable row level security;
revoke all on nova_private.scout_receipts362 from public,anon,authenticated;

alter function nova_private.test_command(text,jsonb) rename to test_command_before362;
create function nova_private.test_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); stage_n int; stars_n int; prize int; total bigint; r jsonb;
begin
 if not(payload ? 'campaign362') then return nova_private.test_command_before362(action,payload);end if;
 if uid is null or payload->>'owner' is distinct from uid::text or action<>'test_claim' then raise exception 'Invalid campaign account';end if;
 stage_n:=(payload->>'stage')::int;stars_n:=(payload->>'stars')::int;
 if stage_n is null or stage_n not between 1 and 100 or stars_n is null or stars_n not between 1 and 3 then raise exception 'Invalid campaign result';end if;
 perform pg_advisory_xact_lock(153014,1);
 prize:=stars_n*case when stage_n>=50 then 2 else 1 end;
 insert into nova_private.campaign_rewards362(owner,stage,stars,amount) values(uid,stage_n,stars_n,prize) on conflict do nothing;
 if found then
  insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
  update nova_private.test_wallets set gems=gems+prize where user_id=uid;
 end if;
 select sum(amount) into total from nova_private.campaign_rewards362 where owner=uid;
 select jsonb_build_object('owner',uid,'stage',stage,'stars',stars,'amount',amount,'credited',total) into r from nova_private.campaign_rewards362 where owner=uid and stage=stage_n;
 return jsonb_build_object('campaign362',r);
end $$;
revoke all on function nova_private.test_command(text,jsonb) from public,anon;
grant execute on function nova_private.test_command(text,jsonb) to authenticated;

alter function nova_private.siege_command(jsonb) rename to siege_command_before362;
create function nova_private.siege_command(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'live';rid uuid;tid uuid;receipt nova_private.scout_receipts362;p public.nova_war_players;r jsonb;state jsonb;
begin
 if mode not in ('siege_scout_gold362','siege_scout_cancel362') or mode is null then return nova_private.siege_command_before362(payload);end if;
 rid:=(payload->>'request_id')::uuid;tid:=(payload->>'target')::uuid;
 if uid is null or rid is null or tid is null or uid=tid then raise exception 'Invalid scout request';end if;
 perform pg_advisory_xact_lock(153014,1);
 select * into receipt from nova_private.scout_receipts362 where owner=uid and id=rid;
 if receipt.id is not null and receipt.target<>tid then raise exception 'Scout target mismatch';end if;
 perform nova_private.command('status',payload);
 if receipt.id is null and mode='siege_scout_cancel362' then
  insert into nova_private.scout_receipts362 values(uid,rid,tid,0) returning * into receipt;
 end if;
 if receipt.id is null or receipt.cost=100 then
  -- Reuse target eligibility validation, bypassing the retired NOVA-price wrapper.
  r:=nova_private.siege_command_before262(jsonb_set(payload,'{live}','"siege_peek"'));
  state:=nova_private.titan_state342(tid);
  if state is not null and r ? 'target' then r:=jsonb_set(r,'{target,titan342}',state);end if;
 end if;
 if receipt.id is null then
  select * into p from public.nova_war_players where user_id=uid for update;
  if p.user_id is null or nova_private.resource_balance(p,'gold')<100 then raise exception 'ทองไม่พอ • ค้นหาฐานครั้งละ 100 ทอง';end if;
  update public.nova_war_players set resource_gold=nova_private.resource_balance(p,'gold')-100,resource_power=nova_private.resource_balance(p,'power'),resource_at=now(),gold_delta=gold_delta-100 where user_id=uid;
  insert into nova_private.scout_receipts362 values(uid,rid,tid,100) returning * into receipt;
 end if;
 return coalesce(r,jsonb_build_object('live',mode))||jsonb_build_object('online',nova_private.command('status','{}'),'scout362',jsonb_build_object('id',rid,'owner',uid,'cost',receipt.cost));
end $$;
revoke all on function nova_private.siege_command(jsonb) from public,anon;
grant execute on function nova_private.siege_command(jsonb) to authenticated;

-- Pay the additional gold only when a guardian is actually deployed, once per battle.
alter function nova_private.titan_combat342(jsonb) rename to titan_combat_before362;
create function nova_private.titan_combat342(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();roomid uuid;already bool;r jsonb;p public.nova_war_players;price int;lv int;
begin
 if uid is null then raise exception 'Login required';end if;
 if payload->>'titan342' is distinct from 'deploy' then return nova_private.titan_combat_before362(payload);end if;
 perform pg_advisory_xact_lock(153014,1);
 roomid:=(payload->>'room')::uuid;
 select exists(select 1 from nova_private.siege_orders where room=roomid and owner=uid and titan342 is not null) into already;
 perform nova_private.command('status',payload);
 r:=nova_private.titan_combat_before362(payload);
 if not already then
  lv:=(r->'state'->>'level')::int;price:=1000*lv;
  if lv is null or lv not between 1 and 3 then raise exception 'Invalid guardian level';end if;
  select * into p from public.nova_war_players where user_id=uid for update;
  if p.user_id is null or nova_private.resource_balance(p,'gold')<price then raise exception 'ทองไม่พอ • ส่งหุ่นต้องใช้ % ทอง',price;end if;
  update public.nova_war_players set resource_gold=nova_private.resource_balance(p,'gold')-price,resource_power=nova_private.resource_balance(p,'power'),resource_at=now(),gold_delta=gold_delta-price where user_id=uid;
 end if;
 return r||jsonb_build_object('online',nova_private.command('status','{}'),'deployment_gold362',coalesce(price,0));
end $$;
revoke all on function nova_private.titan_combat342(jsonb) from public,anon,authenticated;
