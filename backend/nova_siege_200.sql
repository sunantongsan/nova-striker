-- Cooperative battlefield v2. One host simulates one world; all deployments are server-queued.
create table nova_private.sieges(id uuid primary key,defender uuid not null references public.nova_war_players(user_id),host uuid not null,target jsonb not null,frame jsonb not null default '{}',seq int not null default 0,ack bigint not null default 0,epoch int not null default 1,heartbeat timestamptz not null default now(),started_at timestamptz not null default now(),ends_at timestamptz not null default now()+interval '3 minutes',finished_at timestamptz,defender_reported bool not null default false,result jsonb);
create unique index nova_one_siege on nova_private.sieges(defender) where finished_at is null;
create table nova_private.siege_members(room uuid references nova_private.sieges(id),owner uuid references public.nova_war_players(user_id),nonce uuid not null unique,roster jsonb not null,army jsonb not null,merc int not null default 0,withdrawn bool not null default false,reported bool not null default false,seen timestamptz not null default now(),primary key(room,owner));
create table nova_private.siege_orders(id bigserial primary key,room uuid references nova_private.sieges(id),owner uuid not null,nonce uuid not null unique,kind int not null,x numeric not null,y numeric not null,alien bool not null default false,level int not null default 1);
create table nova_private.mercenaries(owner uuid primary key references public.nova_war_players(user_id),total int not null default 0,produced_at timestamptz not null default now());
alter table nova_private.sieges enable row level security;
alter table nova_private.siege_members enable row level security;
alter table nova_private.siege_orders enable row level security;
alter table nova_private.mercenaries enable row level security;
revoke all on nova_private.sieges,nova_private.siege_members,nova_private.siege_orders,nova_private.mercenaries from public,anon,authenticated;
revoke all on sequence nova_private.siege_orders_id_seq from public,anon,authenticated;
create function nova_private.siege_locked(who uuid) returns boolean language sql stable set search_path='' as $$select exists(select 1 from nova_private.sieges where defender=who and finished_at is null and ends_at>now())$$;
create function nova_private.merc_settle(who uuid) returns jsonb language plpgsql set search_path='' as $$
declare lv int; m nova_private.mercenaries; gain int; cap int; until_time timestamptz;
begin
 select coalesce(max((v->>'lv')::int),0) into lv from public.nova_war_players p,jsonb_array_elements(p.layout) v where p.user_id=who and v->>'type'='mercenary';
 insert into nova_private.mercenaries(owner) values(who) on conflict do nothing;
 select * into m from nova_private.mercenaries where owner=who for update;
 select least(now(),coalesce(min(started_at),now())) into until_time from nova_private.sieges where defender=who and finished_at is null;
 cap:=case when lv>0 then 10+2*lv else 0 end;
 gain:=case when lv>0 then greatest(0,floor(extract(epoch from(until_time-m.produced_at))*lv/120)::int) else 0 end;
 update nova_private.mercenaries set total=least(cap,total+gain),produced_at=case when lv=0 or total+gain>=cap then now() else produced_at+gain*120.0/greatest(1,lv)*interval '1 second' end where owner=who returning * into m;
 return jsonb_build_object('level',lv,'total',m.total,'attack',m.total/2,'guard',m.total-m.total/2,'capacity',cap,'seconds',case when lv>0 then 120.0/lv else 0 end);
end $$;
-- Stop both server economies while a defender is locked.
alter function nova_private.settle(uuid) rename to settle_before_siege;
create function nova_private.settle(who uuid) returns public.nova_war_players language plpgsql set search_path='' as $$
declare p public.nova_war_players; t timestamptz;
begin
 select min(started_at) into t from nova_private.sieges where defender=who and finished_at is null;
 if t is null then return nova_private.settle_before_siege(who);end if;
 select * into p from public.nova_war_players where user_id=who;
 return p;
end $$;
alter function nova_private.resource_balance(public.nova_war_players,text) rename to resource_balance_before_siege;
create function nova_private.resource_balance(p public.nova_war_players,kind text) returns bigint language sql stable set search_path='' as $$
 select case when exists(select 1 from nova_private.sieges where defender=p.user_id and finished_at is null) then case when kind='gold' then p.resource_gold else p.resource_power end else nova_private.resource_balance_before_siege(p,kind) end
$$;
-- Preserve the old API while rejecting mutations and snapshots on a defended base.
alter function nova_private.command(text,jsonb) rename to command_before_siege;
create function nova_private.command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();locked bool;outcome jsonb;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 perform pg_advisory_xact_lock(153014,1);
 locked:=exists(select 1 from nova_private.sieges where defender=uid and finished_at is null);
 if locked then
  if action not in ('status','targets','history','cancel') then raise exception 'ฐานกำลังถูกโจมตี รอการรบสิ้นสุด';end if;
  payload:=payload-'layout'-'resourceSnapshot';
 end if;
 if action='attack' and exists(select 1 from nova_private.sieges where finished_at is null and defender=(payload->>'target')::uuid) then raise exception 'เข้าร่วมสนามรบด้วยเวอร์ชันล่าสุด';end if;
 outcome:=nova_private.command_before_siege(action,payload);
 return outcome;
end $$;
-- Include mercenary in the existing layout validator, without changing other economy rules.
do $$ declare src text;begin select pg_get_functiondef('nova_private.command_before_siege(text,jsonb)'::regprocedure) into src;src:=replace(src,'"shield":1}','"shield":1,"mercenary":1}');execute src;end $$;
create function nova_private.siege_finish(rid uuid) returns void language plpgsql set search_path='' as $$
declare s nova_private.sieges; m nova_private.siege_members; a public.nova_war_players;d public.nova_war_players; pct int;num int;den int;weight numeric;total_weight numeric;cl int;gl bigint;pl bigint;tc int:=0;tg bigint:=0;tp bigint:=0;budgetc int;budgetg bigint;budgetp bigint;results jsonb:='{}';res jsonb;lost int;returned int;deflost int;stop_at timestamptz;
begin
 select * into s from nova_private.sieges where id=rid for update;if s.finished_at is not null then return;end if;
 stop_at:=least(now(),s.ends_at);
 select count(*),count(*) filter(where coalesce((s.frame->'buildings'->(n::int-1)->>0)::numeric,1)<=0) into den,num from jsonb_array_elements(s.target->'layout') with ordinality z(v,n) where z.v->>'type'<>'wall';pct:=case when den=0 then 0 else floor(num*100.0/den) end;
 select * into d from public.nova_war_players where user_id=s.defender;
 budgetc:=floor(d.crystals*.6*pct/100);budgetg:=floor(d.resource_gold*.6*pct/100);budgetp:=floor(d.resource_power*.6*pct/100);
 select greatest(1,count(*)) into total_weight from nova_private.siege_orders where room=rid and id<=s.ack;
 for m in select * from nova_private.siege_members where room=rid order by owner loop
  select count(*) into weight from nova_private.siege_orders where room=rid and owner=m.owner and id<=s.ack;
  select * into a from nova_private.settle(m.owner);
  cl:=least(greatest(0,nova_private.capacity(a)-a.crystals),floor(budgetc*weight/total_weight)::int);
  gl:=least(greatest(0,a.gold_cap-nova_private.resource_balance(a,'gold')),floor(budgetg*weight/total_weight)::bigint);
  pl:=least(greatest(0,a.power_cap-nova_private.resource_balance(a,'power')),floor(budgetp*weight/total_weight)::bigint);
  update public.nova_war_players set crystals=crystals+cl,resource_gold=nova_private.resource_balance(a,'gold')+gl,resource_power=nova_private.resource_balance(a,'power')+pl,gold_delta=gold_delta+gl,power_delta=power_delta+pl,resource_at=now() where user_id=m.owner;
  -- Deployed normal troops follow the existing consumption rule. Unprocessed orders are returned.
  for res in select to_jsonb(o) from nova_private.siege_orders o where room=rid and owner=m.owner and id>s.ack and not alien loop m.army:=jsonb_set(m.army,array[res->>'kind'],to_jsonb((m.army->>(res->>'kind'))::int+1));end loop;
  select count(*) into returned from nova_private.siege_orders o where o.room=rid and o.owner=m.owner and o.alien and (o.id>s.ack or exists(select 1 from jsonb_array_elements(coalesce(s.frame->'troops','[]')) t where (t->>10)::bigint=o.id and (t->>3)::numeric>0));
  lost:=greatest(0,m.merc-returned);update nova_private.mercenaries set total=total+returned where owner=m.owner;
  res:=jsonb_build_object('destruction',pct,'loot',cl,'loot_gold',gl,'loot_power',pl,'army',m.army,'merc_lost',lost,'merc_returned',returned,'deployed',(select count(*) from nova_private.siege_orders where room=rid and owner=m.owner and not alien and id<=s.ack));
  results:=results||jsonb_build_object(m.owner::text,res);tc:=tc+cl;tg:=tg+gl;tp:=tp+pl;
  insert into public.nova_war_reports(attacker,defender,request_id,tactic,destruction,loot,loot_gold,loot_power) values(m.owner,s.defender,rid,'siege',pct,cl,gl,pl) on conflict(attacker,request_id) do nothing;
 end loop;
 select count(*) into deflost from jsonb_array_elements(coalesce(s.frame->'guards','[]')) t where coalesce((t->>12)::boolean,false) and (t->>3)::numeric<=0;
 update nova_private.mercenaries set total=greatest(0,total-deflost),produced_at=produced_at+(stop_at-s.started_at) where owner=s.defender;
 update public.nova_war_players set crystals=crystals-tc,resource_gold=resource_gold-tg,resource_power=resource_power-tp,gold_delta=gold_delta-tg,power_delta=power_delta-tp,produced_at=produced_at+(stop_at-s.started_at),resource_at=resource_at+(stop_at-s.started_at),shield_until=now()+interval '30 minutes' where user_id=s.defender;
 results:=results||jsonb_build_object(s.defender::text,jsonb_build_object('destruction',pct,'loot',tc,'loot_gold',tg,'loot_power',tp,'merc_lost',deflost));
 update nova_private.sieges set finished_at=stop_at,result=results where id=rid;
end $$;
create function nova_private.siege_command(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'live';s nova_private.sieges;m nova_private.siege_members;p public.nova_war_players;rid uuid;tid uuid;v_nonce uuid;army jsonb;v jsonb;f jsonb;online jsonb;merc jsonb;targetmerc jsonb;clock jsonb;orders jsonb;members jsonb;result jsonb;countn int;lev int;k int;i int;xx numeric;yy numeric;ackn bigint;hostid uuid;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;perform pg_advisory_xact_lock(153014,1);
 for s in select * from nova_private.sieges where finished_at is null and ends_at<=now() loop perform nova_private.siege_finish(s.id);end loop;s:=null;
 if mode='siege_start' and exists(select 1 from nova_private.live_battles where id=(payload->>'request_id')::uuid and attacker=uid) then return nova_private.live_command_before_siege(jsonb_set(payload,'{live}','"start"'));end if;
 if mode='siege_status' and exists(select 1 from nova_private.live_battles where (attacker=uid or defender=uid) and (not finished or ends_at>now()-interval '5 minutes') and not coalesce(payload->'seen','[]') ? id::text) then return nova_private.live_command_before_siege(jsonb_set(payload,'{live}','"status"'));end if;
 if payload ? 'layout' and not nova_private.siege_locked(uid) then online:=nova_private.command('publish',payload);else online:=nova_private.command('status',payload-'layout');end if;
 if not coalesce((online->>'enrolled')::bool,false) then return jsonb_build_object('live',mode,'online',online);end if;
 merc:=nova_private.merc_settle(uid);
 update nova_private.sieges set defender_reported=true where defender=uid and finished_at is not null and coalesce(payload->'seen','[]') ? id::text;
 update nova_private.siege_members set reported=true where owner=uid and coalesce(payload->'seen','[]') ? room::text;
 if mode='siege_peek' then
  select * into p from public.nova_war_players where user_id=(payload->>'target')::uuid and user_id<>uid;if p.user_id is null then raise exception 'ไม่พบฐานผู้เล่น';end if;
  targetmerc:=nova_private.merc_settle(p.user_id);
  result:=jsonb_build_object('target',jsonb_build_object('id',p.user_id,'callsign',p.callsign,'tier',p.tier,'layout',p.layout,'garrison',p.garrison,'research',p.research,'merc_guard',targetmerc->'guard','can_attack',p.shield_until<=now()));
 elsif mode='siege_start' then
  v_nonce:=(payload->>'request_id')::uuid;tid:=(payload->>'target')::uuid;
  if v_nonce is null or tid is null or tid=uid then raise exception 'เป้าหมายไม่ถูกต้อง';end if;
  select * into m from nova_private.siege_members where siege_members.nonce=v_nonce;
  if m.owner is not null and m.owner<>uid then raise exception 'ไม่มีสิทธิ์เข้าห้องรบ';end if;
  if m.owner is null then
   if exists(select 1 from nova_private.sieges x left join nova_private.siege_members y on y.room=x.id where x.finished_at is null and (x.defender=uid or y.owner=uid)) or exists(select 1 from nova_private.live_battles where not finished and (attacker=uid or defender=uid or attacker=tid or defender=tid)) then raise exception 'ฐานนี้กำลังอยู่ในการรบ';end if;
   select * into p from public.nova_war_players where user_id=tid;if p.user_id is null then raise exception 'ไม่พบฐานผู้เล่น';end if;
   if p.shield_until>now() then raise exception 'ฐานนี้มีโล่ป้องกัน';end if;
   if exists(select 1 from nova_private.siege_members y join nova_private.sieges x on x.id=y.room where y.owner=tid and x.finished_at is null) then raise exception 'ฐานนี้กำลังอยู่ในการรบ';end if;
   army:=payload->'army';if jsonb_typeof(army) is distinct from 'array' or jsonb_array_length(army)<>11 then raise exception 'กองทัพไม่ถูกต้อง';end if;
   for v in select value from jsonb_array_elements(army) loop if v::text !~ '^[0-9]+$' or v::int>150 then raise exception 'กองทัพไม่ถูกต้อง';end if;end loop;
   select sum(value::int) into countn from jsonb_array_elements_text(army);if countn>150 or countn+coalesce((merc->>'attack')::int,0)<1 then raise exception 'กองทัพไม่พร้อม';end if;
   select * into s from nova_private.sieges where defender=tid and finished_at is null;
   if s.id is null then
    select * into p from nova_private.settle(tid);targetmerc:=nova_private.merc_settle(tid);
    update public.nova_war_players set resource_gold=nova_private.resource_balance(p,'gold'),resource_power=nova_private.resource_balance(p,'power'),resource_at=now(),produced_at=now() where user_id=tid;
    insert into nova_private.sieges(id,defender,host,target) values(v_nonce,tid,uid,jsonb_build_object('id',p.user_id,'callsign',p.callsign,'tier',p.tier,'layout',p.layout,'garrison',p.garrison,'research',p.research,'merc_guard',targetmerc->'guard')) returning * into s;
   end if;
   if (select count(*) from nova_private.siege_members where room=s.id)>=4 then raise exception 'สนามรบเต็ม 4 กองทัพ';end if;
   countn:=(merc->>'attack')::int;lev:=(merc->>'level')::int;
   insert into nova_private.siege_members(room,owner,nonce,roster,army,merc) values(s.id,uid,v_nonce,army,army,countn) returning * into m;
   update nova_private.mercenaries set total=total-countn where owner=uid;
   for i in 1..countn loop insert into nova_private.siege_orders(room,owner,nonce,kind,x,y,alien,level) values(s.id,uid,gen_random_uuid(),2,0,2+i%18,true,lev);end loop;
   update public.nova_war_players set shield_until=now() where user_id=uid;
  else select * into s from nova_private.sieges where id=m.room;end if;
 elsif mode in ('siege_frame','siege_finish','siege_deploy','siege_retreat') then
  rid:=(payload->>'id')::uuid;select * into s from nova_private.sieges where id=rid;
  select * into m from nova_private.siege_members where room=rid and owner=uid;
  if s.id is null or (m.owner is null and s.defender<>uid) then raise exception 'ไม่พบห้องรบ';end if;
  if mode in ('siege_frame','siege_finish') and s.finished_at is null then
   if s.host<>uid or (payload->>'epoch')::int is distinct from s.epoch then raise exception 'ผู้ควบคุมสนามเปลี่ยนแล้ว';end if;
   f:=payload->'frame';ackn:=(payload->>'ack')::bigint;
   if (payload->>'seq')::int>s.seq then
    if f is null or length(f::text)>180000 or jsonb_typeof(f->'buildings') is distinct from 'array' or jsonb_array_length(f->'buildings')<>jsonb_array_length(s.target->'layout') or jsonb_array_length(f->'troops')>800 or jsonb_array_length(f->'guards')>80 or ackn is null or ackn<s.ack or ackn>coalesce((select max(id) from nova_private.siege_orders where room=rid),0) then raise exception 'ข้อมูลสนามไม่ถูกต้อง';end if;
    -- Every attacking unit must come from an accepted deployment order, with unique ids.
    if exists(select 1 from jsonb_array_elements(f->'troops') t where not exists(select 1 from nova_private.siege_orders o where o.room=rid and o.id=(t->>10)::bigint and o.kind=(t->>0)::int)) or (select count(*) from jsonb_array_elements(f->'troops'))<>(select count(distinct t->>10) from jsonb_array_elements(f->'troops') t) then raise exception 'ข้อมูลกองทัพไม่ถูกต้อง';end if;
    update nova_private.sieges set frame=f,seq=(payload->>'seq')::int,ack=ackn,heartbeat=now() where id=rid returning * into s;
   end if;
   if mode='siege_finish' then
    if s.ends_at>now() and exists(select 1 from jsonb_array_elements(s.target->'layout') with ordinality z(v,n) where z.v->>'type'<>'wall' and coalesce((s.frame->'buildings'->(n::int-1)->>0)::numeric,1)>0) then raise exception 'การรบยังไม่สิ้นสุด';end if;
    perform nova_private.siege_finish(rid);select * into s from nova_private.sieges where id=rid;
   end if;
  elsif mode='siege_deploy' and s.finished_at is null then
   if m.owner is null or m.withdrawn then raise exception 'ไม่มีสิทธิ์ส่งกำลัง';end if;
   v_nonce:=(payload->>'request_id')::uuid;k:=(payload->>'kind')::int;xx:=(payload->>'x')::numeric;yy:=(payload->>'y')::numeric;
   if v_nonce is null or k is null or k not between 0 and 10 or xx is null or yy is null or xx not between 0 and 21 or yy not between 0 and 21 or not(xx<2 or yy<2 or xx>19 or yy>19) then raise exception 'ปล่อยทหารในขอบสีฟ้าเท่านั้น';end if;
   if not exists(select 1 from nova_private.siege_orders o where o.nonce=v_nonce) then
    if (m.army->>k)::int<1 then raise exception 'ไม่มีหน่วยนี้';end if;
    if (select count(*) from nova_private.siege_orders where room=rid and owner=uid and not alien)>=40 then raise exception 'ส่งทหารได้สูงสุด 40 หน่วยต่อกองทัพ';end if;
    insert into nova_private.siege_orders(room,owner,nonce,kind,x,y) values(rid,uid,v_nonce,k,xx,yy);
    update nova_private.siege_members set army=jsonb_set(m.army,array[k::text],to_jsonb((m.army->>k)::int-1)) where room=rid and owner=uid;
   elsif not exists(select 1 from nova_private.siege_orders o where o.nonce=v_nonce and o.room=rid and o.owner=uid) then raise exception 'รหัสคำสั่งซ้ำ';end if;
   result:=jsonb_build_object('receipt',jsonb_build_object('id',v_nonce));
  elsif mode='siege_retreat' and m.owner is not null then update nova_private.siege_members set withdrawn=true where room=rid and owner=uid;
  end if;
 elsif mode='siege_status' then
  select x.* into s from nova_private.sieges x where (x.defender=uid or exists(select 1 from nova_private.siege_members y where y.room=x.id and y.owner=uid)) and (x.finished_at is null or (x.defender=uid and not x.defender_reported) or exists(select 1 from nova_private.siege_members y where y.room=x.id and y.owner=uid and not y.reported)) order by (x.finished_at is null) desc,x.started_at limit 1;
 else raise exception 'คำสั่งไม่ถูกต้อง';end if;
 if s.id is not null then
  if coalesce((payload->>'awake')::bool,true) then update nova_private.siege_members set seen=now() where room=s.id and owner=uid;end if;
  if s.finished_at is null and s.heartbeat<now()-interval '10 seconds' then
   select owner into hostid from nova_private.siege_members where room=s.id and seen>now()-interval '8 seconds' order by seen desc limit 1;
   if hostid is null and uid=s.defender and coalesce((payload->>'awake')::bool,true) then hostid:=uid;end if;
   if hostid is not null then update nova_private.sieges set host=hostid,epoch=epoch+1,heartbeat=now() where id=s.id returning * into s;end if;
  end if;
  select * into m from nova_private.siege_members where room=s.id and owner=uid;
  select coalesce(jsonb_agg(to_jsonb(o) order by o.id),'[]') into orders from nova_private.siege_orders o where room=s.id and id>s.ack;
  select jsonb_agg(jsonb_build_object('id',y.owner,'name',player.callsign,'withdrawn',y.withdrawn)) into members from nova_private.siege_members y join public.nova_war_players player on player.user_id=y.owner where y.room=s.id;
  result:=coalesce(result,'{}')||jsonb_build_object('battle',jsonb_build_object('v',2,'id',s.id,'role',case when uid=s.defender then 'defender' else 'attacker' end,'host',s.host=uid,'epoch',s.epoch,'target',s.target,'roster',coalesce(m.roster,'[]'),'army',coalesce(m.army,'[]'),'frame',s.frame,'seq',s.seq,'ack',s.ack,'orders',orders,'members',members,'finished',s.finished_at is not null,'result',s.result->uid::text,'remaining',greatest(0,extract(epoch from(s.ends_at-now()))),'withdrawn',coalesce(m.withdrawn,false)));
 end if;
 select jsonb_build_object('now',now(),'locked',nova_private.siege_locked(uid),'intervals',coalesce(jsonb_agg(jsonb_build_array(started_at,least(now(),coalesce(finished_at,ends_at)))),'[]')) into clock from nova_private.sieges where defender=uid and coalesce(finished_at,ends_at)>coalesce(nullif(payload->>'clock_from','')::timestamptz,now()-interval '30 days');
 return coalesce(result,'{}')||jsonb_build_object('live',mode,'online',nova_private.command('status','{}'),'merc',nova_private.merc_settle(uid),'clock',clock);
end $$;
-- Authenticate externally, retain all internal implementation functions as private.
revoke all on all functions in schema nova_private from public,anon;
revoke all on function nova_private.siege_locked(uuid),nova_private.merc_settle(uuid),nova_private.siege_finish(uuid),nova_private.settle(uuid),nova_private.resource_balance(public.nova_war_players,text),nova_private.command_before_siege(text,jsonb),nova_private.settle_before_siege(uuid),nova_private.resource_balance_before_siege(public.nova_war_players,text) from authenticated;
grant execute on function nova_private.siege_command(jsonb),nova_private.command(text,jsonb) to authenticated;
create or replace function public.nova_war_command(action text,payload jsonb default '{}') returns jsonb language plpgsql security invoker set search_path='' as $$
begin
 if payload->>'live' like 'siege_%' then return nova_private.siege_command(payload);end if;
 if payload ? 'live' then return nova_private.live_command(payload);end if;
 return nova_private.command(action,payload);
end $$;

alter function nova_private.live_command(jsonb) rename to live_command_before_siege;
create function nova_private.live_command(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 perform pg_advisory_xact_lock(153014,1);
 if payload->>'live' in ('shield','start') and exists(select 1 from nova_private.sieges x where x.finished_at is null and (x.defender=auth.uid() or x.defender=nullif(payload->>'target','')::uuid or exists(select 1 from nova_private.siege_members y where y.room=x.id and y.owner=auth.uid()))) then raise exception 'ซื้อโล่ไม่ได้หรือฐานกำลังอยู่ในการรบ';end if;
 if payload->>'live'='start' and exists(select 1 from public.nova_war_players p,jsonb_array_elements(p.layout) v where p.user_id=(payload->>'target')::uuid and v->>'type'='mercenary') then raise exception 'เป้าหมายไม่ถูกต้อง กรุณาปิดเปิดเกมเพื่อรับรุ่นล่าสุด';end if;
 return nova_private.live_command_before_siege(payload);
end $$;
revoke all on function nova_private.live_command_before_siege(jsonb),nova_private.live_command(jsonb) from public,anon,authenticated;
grant execute on function nova_private.live_command(jsonb) to authenticated;
