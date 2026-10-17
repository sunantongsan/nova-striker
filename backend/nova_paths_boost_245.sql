-- Preserve legacy levels; each new level adds one explicit specialization point.
alter table public.nova_war_players add column enhancement_paths245 jsonb not null default '{}',add column boost_day245 date,add column boost_seconds245 numeric not null default 0;
alter table nova_private.upgrade_jobs225 add column enhance_path245 text;
alter table nova_private.siege_orders add column enhance_paths245 jsonb not null default '{}';
create function nova_private.production_factor245(p public.nova_war_players,kind text) returns numeric language sql immutable set search_path='' as $$
 select 1+0.1*least(10,greatest(0,coalesce((p.enhancement_paths245->('building:'||case kind when 'gold' then 'mine' when 'power' then 'reactor' else 'crystalplant' end)->>'production')::int,0)))
$$;
create or replace function nova_private.rate(p public.nova_war_players) returns integer language sql immutable set search_path='' as $$
 select case when exists(select 1 from jsonb_array_elements(p.layout) b where b->>'type'='crystalplant') then floor((p.infra->>'crystalplant')::integer*1200*nova_private.production_factor245(p,'crystals'))::int else 0 end
$$;
create or replace function nova_private.resource_balance_before_siege(p public.nova_war_players,kind text) returns bigint language sql stable set search_path='' as $$
 select least(case when kind='gold' then p.gold_cap else p.power_cap end,case when kind='gold' then p.resource_gold else p.resource_power end+greatest(0,floor(extract(epoch from(now()-p.resource_at))*case when kind='gold' then p.gold_rate else p.power_rate end*nova_private.production_factor245(p,kind)/3600)::bigint))
$$;
create function nova_private.finish_path245() returns trigger language plpgsql set search_path='' as $$
declare p public.nova_war_players;paths jsonb;n int;
begin
 if old.completed_at is null and new.completed_at is not null and new.category='enhance' and new.enhance_path245 is not null then
  select * into p from public.nova_war_players where user_id=new.owner for update;
  paths:=coalesce(p.enhancement_paths245->new.item,'{}');n:=coalesce((paths->>new.enhance_path245)::int,0)+1;
  update public.nova_war_players set resource_gold=nova_private.resource_balance(p,'gold'),resource_power=nova_private.resource_balance(p,'power'),resource_at=now(),enhancement_paths245=jsonb_set(enhancement_paths245,array[new.item],jsonb_set(paths,array[new.enhance_path245],to_jsonb(n))) where user_id=new.owner;
 end if;return new;
end $$;
create trigger nova_finish_path245 after update of completed_at on nova_private.upgrade_jobs225 for each row execute function nova_private.finish_path245();
create function nova_private.order_path245() returns trigger language plpgsql set search_path='' as $$
begin select coalesce(enhancement_paths245->(case when new.alien then 'unit:alien' else 'unit:'||new.kind end),'{}') into new.enhance_paths245 from public.nova_war_players where user_id=new.owner;return new;end $$;
create trigger nova_order_path245 before insert on nova_private.siege_orders for each row execute function nova_private.order_path245();
create function nova_private.target_path245() returns trigger language plpgsql set search_path='' as $$
begin new.target:=new.target||jsonb_build_object('enhancement_paths245',(select enhancement_paths245 from public.nova_war_players where user_id=new.defender));return new;end $$;
create trigger nova_target_path245 before insert on nova_private.sieges for each row execute function nova_private.target_path245();
create function nova_private.boost_price245(seconds numeric,used_seconds numeric,crystal boolean) returns integer language sql immutable set search_path='' as $$
 select case when seconds<=0 then 0 when not crystal then ceil(seconds/120)::int else ceil((least(21600,used_seconds+seconds)-least(21600,used_seconds))/120+(greatest(0,used_seconds+seconds-21600)-greatest(0,used_seconds-21600))/60)::int end
$$;
create or replace function nova_private.resource_quote233(p public.nova_war_players,kind text,wanted bigint default null) returns jsonb language plpgsql stable set search_path='' as $$
declare rate numeric;room bigint;balance bigint;amount bigint;seconds numeric;used numeric;
begin
 if kind is null or kind not in ('gold','power','crystals') or wanted is not null and (wanted<=0 or wanted>100000000) then raise exception 'เลือกทรัพยากรไม่ถูกต้อง';end if;
 if kind='crystals' then rate:=nova_private.rate(p);balance:=p.crystals;room:=greatest(0,nova_private.capacity(p)-balance);
 else select coalesce(sum((b->>'lv')::int*2160),0)*nova_private.production_factor245(p,kind) into rate from jsonb_array_elements(p.layout) b where b->>'type'=case kind when 'gold' then 'mine' else 'reactor' end;
 balance:=nova_private.resource_balance(p,kind);room:=greatest(0,case kind when 'gold' then p.gold_cap else p.power_cap end-balance);end if;
 amount:=case when rate>0 then least(room,coalesce(wanted,floor(rate/2)::bigint)) else 0 end;seconds:=case when rate>0 then amount*3600/rate else 0 end;
 used:=case when p.boost_day245=(now() at time zone 'Asia/Bangkok')::date then p.boost_seconds245 else 0 end;
 return jsonb_build_object('production245',true,'production240',nova_private.production_quote240(p),'kind',kind,'hourly_rate',rate,'seconds',seconds,'ad_amount',least(floor(rate/2),room),'ad_base',floor(rate/2),'paid_base',floor(rate/2),'amount',amount,'cost',nova_private.boost_price245(seconds,used,kind='crystals'),'balance',balance,'room',room,'boost_seconds_today',used);
end $$;
-- Accept a lower actual fill/price as natural production advances after quotation.
do $$declare body text;begin
 body:=pg_get_functiondef('nova_private.command_before_bundle238(text,jsonb)'::regprocedure);
 body:=replace(body, '(q->>''amount'')::bigint is distinct from (payload->>''quoted_amount'')::bigint or (q->>''cost'')::int is distinct from (payload->>''quoted_cost'')::int',
 '(payload->>''quoted_amount'') is null or (payload->>''quoted_cost'') is null or (q->>''amount'')::bigint > (payload->>''quoted_amount'')::bigint or (q->>''cost'')::int > (payload->>''quoted_cost'')::int');
 execute body;
end $$;
-- Bundles use exactly the same server quotation, including the daily crystal tiers.
do $$declare body text;begin
 body:=pg_get_functiondef('nova_private.bundle_quote238(public.nova_war_players,jsonb)'::regprocedure);
 body:=replace(body,'ceil(15.0*n/(q->>''paid_base'')::bigint)::int','(q->>''cost'')::int');execute body;
 body:=pg_get_functiondef('nova_private.production_quote240(public.nova_war_players)'::regprocedure);
 body:=replace(body,'least(g,greatest','least(floor(g*nova_private.production_factor245(p,''gold''))::bigint,greatest');
 body:=replace(body,'least(e,greatest','least(floor(e*nova_private.production_factor245(p,''power''))::bigint,greatest');execute body;
end $$;
alter function nova_private.command(text,jsonb) rename to command_before_paths245;
create function nova_private.command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();result jsonb;path text:=payload->>'enhance_path245';key text:=payload->>'enhance';j nova_private.upgrade_jobs225;rid uuid;p public.nova_war_players;previous boolean;seconds numeric:=0;amount bigint;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;perform pg_advisory_xact_lock(153014,1);
 if key is not null then
  if path is not null and not ((key like 'unit:%' and path in ('armor','attack')) or (key like 'building:%' and path='strength') or (key in ('building:mine','building:reactor','building:crystalplant') and path='production')) then raise exception 'ไม่พบเป้าหมายสายตีบวก';end if;
  rid:=(payload->>'request_id')::uuid;select * into j from nova_private.upgrade_jobs225 where owner=uid and request_id=rid;
  if path is null then path:=case when j.request_id is not null then j.enhance_path245 when key like 'unit:%' then 'armor' else 'strength' end;end if;
  if j.request_id is not null and j.enhance_path245 is distinct from path then raise exception 'รหัสรายการสายตีบวกไม่ตรง';end if;
 end if;
 if payload->>'resource233'='buy' then
  rid:=(payload->>'request_id')::uuid;select exists(select 1 from nova_private.resource_receipts233 where owner=uid and id=rid) into previous;
  select * into p from public.nova_war_players where user_id=uid;
  if not previous and nova_private.rate(p)>0 then
   amount:=case when payload->>'kind'='crystals' then (payload->>'quoted_amount')::bigint when payload->>'kind'='bundle' then coalesce((payload->'needs'->>'crystals')::bigint,0) else 0 end;
   seconds:=greatest(0,amount)*3600.0/nova_private.rate(p);
  end if;
 end if;
 result:=nova_private.command_before_paths245(action,payload);
 if key is not null and j.request_id is null and result->'receipt'->>'id'=rid::text then
  update nova_private.upgrade_jobs225 set enhance_path245=path where owner=uid and request_id=rid and completed_at is null;
 end if;
 if seconds>0 and payload->>'kind'='crystals' and result->'resource_receipt'->>'amount' is not null then seconds:=(result->'resource_receipt'->>'amount')::numeric*3600/nova_private.rate(p);end if;
 if seconds>0 and exists(select 1 from nova_private.resource_receipts233 where owner=uid and id=rid and not cancelled) then
  update public.nova_war_players set boost_seconds245=case when boost_day245=(now() at time zone 'Asia/Bangkok')::date then boost_seconds245 else 0 end+seconds,boost_day245=(now() at time zone 'Asia/Bangkok')::date where user_id=uid;
 end if;
 return result||jsonb_build_object('paths245',true,'enhancement_paths245',coalesce((select enhancement_paths245 from public.nova_war_players where user_id=uid),'{}'));
end $$;
alter function nova_private.siege_command(jsonb) rename to siege_command_before_paths245;
create function nova_private.siege_command(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r jsonb;orders jsonb;begin
 if auth.uid() is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 r:=nova_private.siege_command_before_paths245(payload);
 if r ? 'target' then r:=jsonb_set(r,'{target,enhancement_paths245}',coalesce((select enhancement_paths245 from public.nova_war_players where user_id=(r->'target'->>'id')::uuid),'{}'));end if;
 if jsonb_typeof(r->'battle'->'orders')='array' then
 select coalesce(jsonb_agg(o||jsonb_build_object('enhance_paths245',coalesce((select enhance_paths245 from nova_private.siege_orders s where s.room=(r->'battle'->>'id')::uuid and s.id=(o->>'id')::bigint),'{}'))),'[]') into orders from jsonb_array_elements(r->'battle'->'orders') o;
 r:=jsonb_set(r,'{battle,orders}',orders);end if;return r;
end $$;
revoke all on function nova_private.production_factor245(public.nova_war_players,text),nova_private.finish_path245(),nova_private.order_path245(),nova_private.target_path245(),nova_private.boost_price245(numeric,numeric,boolean),nova_private.command_before_paths245(text,jsonb),nova_private.siege_command_before_paths245(jsonb) from public,anon,authenticated;
revoke all on function nova_private.command(text,jsonb),nova_private.siege_command(jsonb) from public,anon;
grant execute on function nova_private.command(text,jsonb),nova_private.siege_command(jsonb) to authenticated;
