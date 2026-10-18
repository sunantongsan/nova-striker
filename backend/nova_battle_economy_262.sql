-- Patch 62: immediate, idempotent surrender and proportional raid NOVA.
alter table nova_private.siege_orders add column cancelled262 boolean not null default false;
CREATE OR REPLACE FUNCTION nova_private.siege_settle262(rid uuid, retreat_owner uuid default null)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare s nova_private.sieges; m nova_private.siege_members; a public.nova_war_players;d public.nova_war_players; pct int;num int;den int;weight numeric;total_weight numeric;cl int;gl bigint;pl bigint;tc int:=0;tg bigint:=0;tp bigint:=0;budgetc int;budgetg bigint;budgetp bigint;results jsonb:='{}';res jsonb;lost int;returned int;deflost int;stop_at timestamptz;
begin
 select * into s from nova_private.sieges where id=rid for update;if s.finished_at is not null then return;end if;
 stop_at:=least(now(),s.ends_at);results:=coalesce(s.result,'{}');
 select count(*),count(*) filter(where coalesce((s.frame->'buildings'->(n::int-1)->>0)::numeric,1)<=0) into den,num from jsonb_array_elements(s.target->'layout') with ordinality z(v,n) where z.v->>'type'<>'wall';pct:=case when den=0 then 0 else floor(num*100.0/den) end;
 select * into d from public.nova_war_players where user_id=s.defender;
 budgetc:=floor(d.crystals*.5*pct/100);budgetg:=floor(d.resource_gold*.5*pct/100);budgetp:=floor(d.resource_power*.5*pct/100);
 select greatest(1,count(*)) into total_weight from nova_private.siege_orders where room=rid and id<=s.ack and not cancelled262;
 for m in select * from nova_private.siege_members where room=rid and not (results ? owner::text) and (retreat_owner is null or owner=retreat_owner) order by owner loop
  select count(*) into weight from nova_private.siege_orders where room=rid and owner=m.owner and id<=s.ack and not cancelled262;
  select * into a from nova_private.settle(m.owner);
  cl:=least(greatest(0,nova_private.capacity(a)-a.crystals),floor(budgetc*weight/total_weight)::int);
  gl:=least(greatest(0,a.gold_cap-nova_private.resource_balance(a,'gold')),floor(budgetg*weight/total_weight)::bigint);
  pl:=least(greatest(0,a.power_cap-nova_private.resource_balance(a,'power')),floor(budgetp*weight/total_weight)::bigint);
  update public.nova_war_players set crystals=crystals+cl,resource_gold=nova_private.resource_balance(a,'gold'),resource_power=nova_private.resource_balance(a,'power'),resource_at=now() where user_id=m.owner;
  -- Deployed normal troops follow the existing consumption rule. Unprocessed orders are returned.
  for res in select to_jsonb(o) from nova_private.siege_orders o where room=rid and owner=m.owner and id>s.ack and not alien loop m.army:=jsonb_set(m.army,array[res->>'kind'],to_jsonb((m.army->>(res->>'kind'))::int+1));end loop;
  select count(*) into returned from nova_private.siege_orders o where o.room=rid and o.owner=m.owner and o.alien and (o.id>s.ack or exists(select 1 from jsonb_array_elements(coalesce(s.frame->'troops','[]')) t where (t->>10)::bigint=o.id and (t->>3)::numeric>0));
  lost:=greatest(0,m.merc-returned);update nova_private.mercenaries set total=total+returned where owner=m.owner;
  res:=jsonb_build_object('surrendered',retreat_owner is not null,'destruction',pct,'loot',cl,'loot_gold',gl,'loot_power',pl,'army',m.army,'merc_lost',lost,'merc_returned',returned,'deployed',(select count(*) from nova_private.siege_orders where room=rid and owner=m.owner and not alien and id<=s.ack));
  results:=results||jsonb_build_object(m.owner::text,res);tc:=tc+cl;tg:=tg+gl;tp:=tp+pl;
  insert into public.nova_war_reports(attacker,defender,request_id,tactic,destruction,loot,loot_gold,loot_power) values(m.owner,s.defender,rid,'siege',pct,cl,gl,pl) on conflict(attacker,request_id) do nothing;
 end loop;
 if retreat_owner is not null then
  results:=jsonb_set(results,array[retreat_owner::text,'nova255'],to_jsonb(coalesce((select nova255 from public.nova_war_reports where attacker=retreat_owner and request_id=rid),0)));
  update nova_private.sieges set result=results where id=rid;return;
 end if;
 tc:=budgetc;tg:=budgetg;tp:=budgetp; select count(*) into deflost from jsonb_array_elements(coalesce(s.frame->'guards','[]')) t where coalesce((t->>12)::boolean,false) and (t->>3)::numeric<=0;
 update nova_private.mercenaries set total=greatest(0,total-deflost),produced_at=produced_at+(stop_at-s.started_at) where owner=s.defender;
 update public.nova_war_players set crystals=crystals-tc,resource_gold=resource_gold-tg,resource_power=resource_power-tp,gold_delta=gold_delta-tg,power_delta=power_delta-tp,produced_at=produced_at+(stop_at-s.started_at),resource_at=resource_at+(stop_at-s.started_at),shield_until=greatest(shield_until,now()+case when pct=100 then interval '4 hours' else interval '30 minutes' end) where user_id=s.defender;
 results:=results||jsonb_build_object(s.defender::text,jsonb_build_object('destruction',pct,'loot',tc,'loot_gold',tg,'loot_power',tp,'merc_lost',deflost));
 for m in select * from nova_private.siege_members where room=rid loop results:=jsonb_set(results,array[m.owner::text,'nova255'],to_jsonb(coalesce((select nova255 from public.nova_war_reports where attacker=m.owner and request_id=rid),0)));end loop; update nova_private.sieges set finished_at=stop_at,result=results where id=rid;
end $function$
;

create or replace function nova_private.siege_finish(rid uuid) returns void language plpgsql set search_path='' as $$
begin perform nova_private.siege_settle262(rid,null);end $$;
revoke all on function nova_private.siege_settle262(uuid,uuid) from public,anon,authenticated;
-- Existing paid reports stay unchanged. Fractional NOVA is rounded down.
do $$declare src text;begin
 src:=pg_get_functiondef('nova_private.raid_credit255()'::regprocedure);
 src:=replace(src,'if new.destruction=100 then','if new.destruction>0 then');
 src:=replace(src,'into reward from public.nova_war_players','*new.destruction/100.0 into reward from public.nova_war_players');
 -- Explicit floor before the integer assignment (Postgres integer casts otherwise round).
 src:=replace(src,'select nova_private.raid_rate255(nova_private.hq255(a.layout),nova_private.hq255(d.layout))*new.destruction/100.0',
 'select floor(nova_private.raid_rate255(nova_private.hq255(a.layout),nova_private.hq255(d.layout))*new.destruction/100.0)');
 src:=replace(src,'where room=new.request_id and id<=','where room=new.request_id and not cancelled262 and id<=');
 execute src;
 src:=pg_get_functiondef('nova_private.command_before_admob230(text,jsonb)'::regprocedure);
 if strpos(src,'ceil(extract(epoch from(j.finishes_at-now()))/120)')=0 then raise exception 'Unexpected speed price';end if;
 execute replace(src,'ceil(extract(epoch from(j.finishes_at-now()))/120)','ceil(extract(epoch from(j.finishes_at-now()))/10)');
end $$;
-- Withdrawn players may manage their base and start another attack. They remain in reports.
do $$declare r record;src text;begin
 for r in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='nova_private' and p.prokind='f' and p.proname not in ('siege_settle262') loop
  src:=pg_get_functiondef(r.oid);
  src:=replace(src,'m.owner=who and s.finished_at is null','m.owner=who and not m.withdrawn and s.finished_at is null');
  src:=replace(src,'m.owner=uid and s.finished_at is null','m.owner=uid and not m.withdrawn and s.finished_at is null');
  src:=replace(src,'y.owner=uid))','y.owner=uid and not y.withdrawn))');
  src:=replace(src,'y.owner=tid and x.finished_at is null','y.owner=tid and not y.withdrawn and x.finished_at is null');
  src:=replace(src,'y.owner=uid and (x.finished_at is null or not y.reported)','y.owner=uid and ((x.finished_at is null and not y.withdrawn) or not y.reported)');
  src:=replace(src,'where room=rid and seen>','where room=rid and not withdrawn and seen>');
  src:=replace(src,'where room=s.id and id>s.ack','where room=s.id and id>s.ack and not o.cancelled262');
  src:=replace(src,'''finished'',s.finished_at is not null,''result''','''finished'',s.finished_at is not null or (coalesce(m.withdrawn,false) and s.result ? uid::text),''result''');
  if src<>pg_get_functiondef(r.oid) then execute src;end if;
 end loop;
end $$;
-- Persist each charged search; retries and cancellation never charge twice.
create table nova_private.scout_receipts262(owner uuid not null references auth.users(id),id uuid not null,target uuid not null,cost int not null check(cost in(0,2)),primary key(owner,id));
alter table nova_private.scout_receipts262 enable row level security;
revoke all on nova_private.scout_receipts262 from public,anon,authenticated;
alter function nova_private.siege_command(jsonb) rename to siege_command_before262;
create function nova_private.siege_command(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'live';s nova_private.sieges;m nova_private.siege_members;r jsonb;rid uuid;target_id uuid;receipt nova_private.scout_receipts262;next_host uuid;begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 if mode in ('siege_peek','siege_scout_cancel262','siege_retreat') then
  perform pg_advisory_xact_lock(153014,1);
  if mode in ('siege_peek','siege_scout_cancel262') then
   rid:=(payload->>'request_id')::uuid;target_id:=(payload->>'target')::uuid;
   if rid is null or target_id is null or target_id=uid then raise exception 'อัปเดตเกมเพื่อค้นหาฐาน • ครั้งละ 2 NOVA';end if;
   select * into receipt from nova_private.scout_receipts262 where owner=uid and id=rid;
   if receipt.id is not null and receipt.target<>target_id then raise exception 'รายการไม่ตรงเป้าหมาย';end if;
   if receipt.id is null then
    if mode='siege_peek' then
     if not exists(select 1 from public.nova_war_players where user_id=target_id) then raise exception 'ไม่พบฐานผู้เล่น';end if;
     update nova_private.test_wallets set gems=gems-2 where user_id=uid and gems>=2;
     if not found then raise exception 'NOVA ไม่พอ • ค้นหาฐานครั้งละ 2 NOVA';end if;
    end if;
    insert into nova_private.scout_receipts262 values(uid,rid,target_id,case when mode='siege_peek' then 2 else 0 end) returning * into receipt;
   end if;
   if receipt.cost=2 then r:=nova_private.siege_command_before262(jsonb_set(payload,'{live}','"siege_peek"'));else r:=jsonb_build_object('live',mode);end if;
   return r||jsonb_build_object('scout262',jsonb_build_object('id',rid,'owner',uid,'cost',receipt.cost));
  end if;
  rid:=(payload->>'id')::uuid;
  select * into s from nova_private.sieges where id=rid for update;
  select * into m from nova_private.siege_members where room=rid and owner=uid;
  if s.id is null or m.owner is null then raise exception 'ไม่พบห้องรบ';end if;
  if s.finished_at is null and not (coalesce(s.result,'{}') ? uid::text) then
   -- Route the final host snapshot through the established frame validator.
   if s.host=uid and payload ? 'frame' and (payload->>'epoch')::int=s.epoch then
    perform nova_private.siege_command_before262(jsonb_set(payload-'transport','{live}','"siege_frame"'));
    select * into s from nova_private.sieges where id=rid;
   end if;
   if s.finished_at is null then
    perform nova_private.siege_settle262(rid,uid);
    update nova_private.siege_members set withdrawn=true where room=rid and owner=uid;
    update nova_private.siege_orders set cancelled262=true where room=rid and owner=uid and id>s.ack;
    select owner into next_host from nova_private.siege_members where room=rid and not withdrawn order by seen desc limit 1;
    update nova_private.sieges set frame=jsonb_set(coalesce(frame,'{}'),'{troops}',coalesce((select jsonb_agg(t) from jsonb_array_elements(coalesce(frame->'troops','[]')) t where not exists(select 1 from nova_private.siege_orders o where o.room=rid and o.owner=uid and o.id=(t->>10)::bigint)),'[]')),host=coalesce(next_host,host),epoch=epoch+1,seq=seq+1,heartbeat=now() where id=rid;
    if next_host is null then perform nova_private.siege_finish(rid);end if;
   end if;
  end if;
  -- Replay the member's frozen result, even after other attackers continue.
  select * into s from nova_private.sieges where id=rid;
  return jsonb_build_object('live',mode,'online',nova_private.command('status','{}'),'battle',jsonb_build_object('v',2,'id',s.id,'role','attacker','host',false,'epoch',s.epoch,'target',s.target,'roster',m.roster,'army',m.army,'frame',s.frame,'seq',s.seq,'ack',s.ack,'orders','[]'::jsonb,'members','[]'::jsonb,'finished',true,'result',s.result->uid::text,'remaining',0,'withdrawn',true));
 end if;
 return nova_private.siege_command_before262(payload);
end $$;
revoke all on function nova_private.siege_command_before262(jsonb) from public,anon,authenticated;
revoke all on function nova_private.siege_command(jsonb) from public,anon;
grant execute on function nova_private.siege_command(jsonb) to authenticated;
