-- Independent personal outpost and two-material mech equipment; no premium minting.
begin;
create table nova_private.outposts370(
 owner uuid primary key references auth.users(id) on delete cascade,
 gold bigint not null default 2500 check(gold>=0),power bigint not null default 2500 check(power>=0),
 alloy bigint not null default 0 check(alloy>=0),core bigint not null default 0 check(core>=0),
 levels jsonb not null default '{"hq":1,"mine":1,"reactor":1,"goldstore":1,"powerstore":1,"forge":1}',
 equipment jsonb not null default '{"weapon":0,"armor":0}',
 produced_at timestamptz not null default now(),upgrade_kind text,upgrade_until timestamptz,
 craft_kind text,craft_until timestamptz);
create table nova_private.outpost_receipts370(owner uuid not null references auth.users(id) on delete cascade,id uuid not null,signature jsonb not null,primary key(owner,id));
alter table nova_private.outposts370 enable row level security;
alter table nova_private.outpost_receipts370 enable row level security;
revoke all on nova_private.outposts370,nova_private.outpost_receipts370 from public,anon,authenticated;
create function nova_private.outpost_quote370(kind text,lv int) returns jsonb language sql immutable set search_path='' as $$
 select case when kind in('hq','mine','reactor','goldstore','powerstore','forge') and lv between 1 and 9 then jsonb_build_object('gold',(case kind when 'hq' then 1800 else 900 end)*power(2,lv-1)::bigint,'power',900*power(2,lv-1)::bigint,'seconds',270*lv*lv) end;
$$;
create function nova_private.outpost_state370(who uuid) returns jsonb language sql stable set search_path='' as $$
 select to_jsonb(s)-'owner'||jsonb_build_object('gold_cap',10000*power((levels->>'goldstore')::int,2),'power_cap',10000*power((levels->>'powerstore')::int,2),'gold_rate',600*(levels->>'mine')::int,'power_rate',600*(levels->>'reactor')::int,'quotes',(select jsonb_object_agg(k,nova_private.outpost_quote370(k,v::int)) from jsonb_each_text(s.levels) as j(k,v))) from nova_private.outposts370 s where owner=who;
$$;
create function nova_private.outpost_settle370(who uuid) returns void language plpgsql set search_path='' as $$
declare s nova_private.outposts370;elapsed numeric;boundary timestamptz;
begin
 select * into s from nova_private.outposts370 where owner=who for update;
 if not found then return;end if;
 -- Settle old production first at the upgrade boundary, then the new production rate.
 boundary:=case when s.upgrade_until<=now() then s.upgrade_until else now() end;
 elapsed:=greatest(0,extract(epoch from(boundary-s.produced_at)));
 update nova_private.outposts370 set gold=least(10000*power((s.levels->>'goldstore')::int,2)::bigint,gold+(floor(elapsed/6)*(s.levels->>'mine')::int)::bigint),power=least(10000*power((s.levels->>'powerstore')::int,2)::bigint,power+(floor(elapsed/6)*(s.levels->>'reactor')::int)::bigint),produced_at=s.produced_at+make_interval(secs=>floor(elapsed/6)*6) where owner=who;
 if s.upgrade_until<=now() then
  update nova_private.outposts370 set levels=jsonb_set(levels,array[s.upgrade_kind],to_jsonb((levels->>s.upgrade_kind)::int+1)),upgrade_kind=null,upgrade_until=null where owner=who;
  perform nova_private.outpost_settle370(who);
 end if;
 if s.craft_until<=now() then
  update nova_private.outposts370 set alloy=alloy+case when craft_kind='alloy' then 20 else 0 end,core=core+case when craft_kind='core' then 5 else 0 end,craft_kind=null,craft_until=null where owner=who;
 end if;
end $$;
create function nova_private.outpost_command370(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'outpost370';kind text:=payload->>'kind';rid uuid;sig jsonb;old jsonb;s nova_private.outposts370;q jsonb;lv int;hq int;g bigint;e bigint;
begin
 if uid is null or payload->>'owner' is distinct from uid::text or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'Sign in to your account';end if;
 if mode is null or mode not in('status','upgrade','craft','equipment','cancel') then raise exception 'Invalid outpost command';end if;
 perform pg_advisory_xact_lock(153014,1);
 select coalesce(max((b->>'lv')::int),0) into hq from public.nova_war_players p cross join lateral jsonb_array_elements(p.layout) b where p.user_id=uid and b->>'type'='hq';
 if hq<5 then raise exception 'Main HQ level 5 required';end if;
 insert into nova_private.outposts370(owner) values(uid) on conflict do nothing;
 perform nova_private.outpost_settle370(uid);
 select * into s from nova_private.outposts370 where owner=uid for update;
 if mode<>'status' then
  rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'Request ID required';end if;
  sig:=jsonb_build_object('mode',case when mode='cancel' then payload->>'operation' else mode end,'kind',kind,'level',payload->>'level');
  if mode='cancel' and (payload->>'operation' is null or payload->>'operation' not in('upgrade','craft','equipment')) then raise exception 'Invalid cancellation';end if;
  select signature into old from nova_private.outpost_receipts370 where owner=uid and id=rid;
  if old is not null and old is distinct from sig then raise exception 'Receipt does not match';end if;
  if old is null then
   if mode<>'cancel' and nova_private.siege_locked(uid) then raise exception 'Finish the battle first';end if;
   if mode='upgrade' then
    if s.upgrade_until is not null then raise exception 'Outpost builder busy';end if;
    lv:=(s.levels->>kind)::int;q:=nova_private.outpost_quote370(kind,lv);
    if q is null or (payload->>'level')::int is distinct from lv then raise exception 'Upgrade unavailable or quote changed';end if;
    if kind<>'hq' and lv>=(s.levels->>'hq')::int then raise exception 'Upgrade outpost HQ first';end if;
    g:=(q->>'gold')::bigint;e:=(q->>'power')::bigint;
    if s.gold<g or s.power<e then raise exception 'Not enough outpost resources';end if;
    update nova_private.outposts370 set gold=gold-g,power=power-e,upgrade_kind=kind,upgrade_until=now()+make_interval(secs=>(q->>'seconds')::int) where owner=uid;
   elsif mode='craft' then
    if kind is null or kind not in('alloy','core') or s.craft_until is not null then raise exception 'Choose a material or wait for production';end if;
    g:=case kind when 'alloy' then 500 else 1000 end;e:=g;
    if s.gold<g or s.power<e then raise exception 'Not enough outpost resources';end if;
    update nova_private.outposts370 set gold=gold-g,power=power-e,craft_kind=kind,craft_until=now()+make_interval(secs=>case kind when 'alloy' then 1800 else 3600 end) where owner=uid;
   elsif mode='equipment' then
    if kind is null or kind not in('weapon','armor') then raise exception 'Invalid equipment';end if;
    lv:=(s.equipment->>kind)::int;
    if lv>=10 or (payload->>'level')::int is distinct from lv then raise exception 'Equipment level changed or maximum';end if;
    if lv>=(s.levels->>'forge')::int then raise exception 'Upgrade outpost forge first';end if;
    if not exists(select 1 from nova_private.titans342 where owner=uid and level>0) then raise exception 'Build your NOVA mech first';end if;
    g:=30*(lv+1);e:=5*(lv+1);
    if s.alloy<g or s.core<e then raise exception 'Not enough alloy or energy cores';end if;
    update nova_private.outposts370 set alloy=alloy-g,core=core-e,equipment=jsonb_set(equipment,array[kind],to_jsonb(lv+1)) where owner=uid;
   end if;
   insert into nova_private.outpost_receipts370 values(uid,rid,sig);
  end if;
 end if;
 return jsonb_build_object('outpost370',true,'owner',uid,'state',nova_private.outpost_state370(uid),'server_time',now(),'receipt',rid);
end $$;
alter function nova_private.test_command(text,jsonb) rename to test_command_before370;
create function nova_private.test_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if payload ? 'outpost370' then
  if action<>'test_status' then raise exception 'Invalid outpost action';end if;
  return nova_private.outpost_command370(payload);
 end if;
 return nova_private.test_command_before370(action,payload);
end $$;
alter function nova_private.titan_state342(uuid) rename to titan_state_before370;
create function nova_private.titan_state342(who uuid) returns jsonb language sql stable set search_path='' as $$
 select nova_private.titan_state_before370(who)||jsonb_build_object('equipment370',coalesce((select equipment from nova_private.outposts370 where owner=who),'{"weapon":0,"armor":0}'::jsonb));
$$;
revoke all on function nova_private.outpost_quote370(text,int),nova_private.outpost_state370(uuid),nova_private.outpost_settle370(uuid),nova_private.outpost_command370(jsonb),nova_private.test_command(text,jsonb),nova_private.test_command_before370(text,jsonb),nova_private.titan_state342(uuid),nova_private.titan_state_before370(uuid) from public,anon,authenticated;
-- Keep the authenticated command entry point callable after replacing its wrappers.
grant execute on function nova_private.test_command(text,jsonb) to authenticated;
commit;
