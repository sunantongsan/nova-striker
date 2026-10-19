-- Authoritative cargo orders and idempotent control events; retains existing siege security.
alter table nova_private.siege_orders add column if not exists logistics277 jsonb;
create table if not exists nova_private.logistics_orders277(id bigserial primary key,room uuid not null references nova_private.sieges(id),owner uuid not null,nonce uuid not null unique,payload jsonb not null);
alter table nova_private.logistics_orders277 enable row level security;
create index if not exists logistics_room277 on nova_private.logistics_orders277(room,id);
revoke all on nova_private.logistics_orders277 from public,anon,authenticated;
alter function nova_private.siege_command(jsonb) rename to siege_command_before277;
create function nova_private.siege_command(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();r jsonb;s nova_private.sieges;m nova_private.siege_members;rid uuid;v_nonce uuid;act text;cargo jsonb;meta jsonb;p jsonb;orders jsonb;ev nova_private.logistics_orders277;k int;n int;i int;used int:=0;lv int;ship int;xx numeric;yy numeric;tier int;qty int;begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 if payload->>'live'='siege_logistics277' then
  perform pg_advisory_xact_lock(153014,1);rid:=(payload->>'id')::uuid;v_nonce:=(payload->>'request_id')::uuid;act:=payload->>'action';meta:=jsonb_build_object('action',act,'ship',payload->'ship','lv',payload->'lv','cargo',payload->'cargo','kind',payload->'kind','count',payload->'count','target',payload->'target','x',payload->'x','y',payload->'y');
  select * into s from nova_private.sieges where id=rid;select * into m from nova_private.siege_members where room=rid and owner=uid;
  if s.id is null or m.owner is null or m.withdrawn then raise exception 'ไม่มีสิทธิ์ส่งกำลัง';end if;
  if v_nonce is null then raise exception 'รหัสคำสั่งไม่ถูกต้อง';end if;
  select * into ev from nova_private.logistics_orders277 where logistics_orders277.nonce=v_nonce;
  if ev.id is not null and (ev.owner<>uid or ev.room<>rid or ev.payload<>meta) then raise exception 'รหัสคำสั่งซ้ำ';end if;
  if ev.id is null then
   if s.finished_at is not null or s.ends_at<=now() then raise exception 'การรบจบแล้ว';end if;
   select coalesce(max((b->>'lv')::int),1) into tier from public.nova_war_players p1 cross join lateral jsonb_array_elements(p1.layout) b where p1.user_id=uid and b->>'type'='hq';
   if act='launch' then
    ship:=(payload->>'ship')::int;lv:=(payload->>'lv')::int;cargo:=payload->'cargo';xx:=(payload->>'x')::numeric;yy:=(payload->>'y')::numeric;
    if ship is null or ship<1 or lv is null or lv not between 1 and 5 or lv>1+floor(greatest(0,coalesce((select max((b->>'lv')::int) from public.nova_war_players wp cross join lateral jsonb_array_elements(wp.layout) b where wp.user_id=uid and b->>'type'='airbase'),0))/3.0) or jsonb_typeof(cargo) is distinct from 'array' or jsonb_array_length(cargo)<>11 then raise exception 'ข้อมูลยานไม่ถูกต้อง';end if;
    if exists(select 1 from nova_private.logistics_orders277 lo where lo.room=rid and lo.owner=uid and lo.payload->>'action'='launch' and (lo.payload->>'ship')::int=ship) then raise exception 'ยานออกเดินทางแล้ว';end if;
    if (select count(*) from nova_private.logistics_orders277 lo where lo.room=rid and lo.owner=uid and lo.payload->>'action'='launch')>=least(5,1+floor(greatest(0,tier-1)/3.0)) then raise exception 'จำนวนยานเต็ม';end if;
    if xx is null or yy is null or xx not between 0 and 21 or yy not between 0 and 21 or not(xx<2 or yy<2 or xx>19 or yy>19) or exists(select 1 from jsonb_array_elements(s.target->'layout') b where sqrt(power((b->>'x')::numeric-xx,2)+power((b->>'y')::numeric-yy,2))<1.3) then raise exception 'พื้นที่ลงจอดไม่ว่าง';end if;
    for k in 0..10 loop
     if (cargo->k)::text !~ '^[0-9]+$' then raise exception 'จำนวนทหารไม่ถูกต้อง';end if;n:=(cargo->>k)::int;
     if n>150 or n>coalesce((m.army->>k)::int,0) or k in (3,5,7) and n>0 then raise exception 'กำลังพลไม่พอหรือเป็นหน่วยบิน';end if;
     used:=used+n*(array[1,4,3,2,2,4,5,6,3,6,8])[k+1];
    end loop;
    if used<1 or used>(array[12,18,24,32,40])[lv] then raise exception 'พื้นที่ยานไม่พอ';end if;
    if (select count(*) from nova_private.siege_orders where room=rid)+(select sum(value::int) from jsonb_array_elements_text(cargo))>150 then raise exception 'กำลังในสนามเต็ม 150 หน่วย';end if;
    for k in 0..10 loop for i in 1..(cargo->>k)::int loop
     p:=jsonb_build_object('live','siege_deploy','id',rid,'request_id',gen_random_uuid(),'kind',k,'x',xx,'y',yy);
     r:=nova_private.siege_command_before277(p);
     update nova_private.siege_orders set logistics277=jsonb_build_object('ship',ship,'lv',lv) where siege_orders.nonce=(p->>'request_id')::uuid;
    end loop;end loop;
   elsif act='unload' then
    ship:=(payload->>'ship')::int;
    if not exists(select 1 from nova_private.logistics_orders277 lo where lo.room=rid and lo.owner=uid and lo.payload->>'action'='launch' and (lo.payload->>'ship')::int=ship) then raise exception 'ไม่พบยาน';end if;
   elsif act='air' then
    qty:=(payload->>'count')::int;
    if qty is null or qty not between 1 and 150 or (payload->>'kind')::int is distinct from 7 or not exists(select 1 from jsonb_array_elements(s.target->'layout') with ordinality b(v,n) where n-1=(payload->>'target')::int) then raise exception 'เป้าหมายไม่ถูกต้อง';end if;
    for i in 1..least(qty,coalesce((m.army->>7)::int,0)) loop
     p:=jsonb_build_object('live','siege_deploy','id',rid,'request_id',gen_random_uuid(),'kind',7,'x',0,'y',greatest(0,least(21,(payload->>'y')::numeric)));
     r:=nova_private.siege_command_before277(p);
     update nova_private.siege_orders set logistics277=jsonb_build_object('target',(payload->>'target')::int) where siege_orders.nonce=(p->>'request_id')::uuid;
    end loop;
   else raise exception 'คำสั่งไม่ถูกต้อง';end if;
   insert into nova_private.logistics_orders277(room,owner,nonce,payload) values(rid,uid,v_nonce,meta);
  end if;
  r:=nova_private.siege_command_before277(jsonb_build_object('live','siege_status','awake',true));r:=r||jsonb_build_object('logisticsReceipt277',v_nonce);
 else r:=nova_private.siege_command_before277(payload);end if;
 if r ? 'battle' then
  rid:=(r->'battle'->>'id')::uuid;
  if coalesce((r->'battle'->>'host')::boolean,false) then
   select coalesce(jsonb_agg(jsonb_build_object('id',o.id,'owner',o.owner,'payload',o.payload) order by o.id),'[]') into orders from nova_private.logistics_orders277 o where room=rid and id>coalesce((r->'battle'->'frame'->>'commandAck277')::bigint,0);
   r:=jsonb_set(r,'{battle,logisticsOrders277}',orders);
  end if;
  if jsonb_typeof(r->'battle'->'orders')='array' then
   select coalesce(jsonb_agg(o||jsonb_build_object('logistics277',(select so.logistics277 from nova_private.siege_orders so where so.id=(o->>'id')::bigint and so.room=rid))),'[]') into orders from jsonb_array_elements(r->'battle'->'orders') o;
   r:=jsonb_set(r,'{battle,orders}',orders);
  end if;
 end if;return r;
end $$;
revoke all on function nova_private.siege_command(jsonb) from public,anon;
grant execute on function nova_private.siege_command(jsonb) to authenticated;
revoke all on function nova_private.siege_command_before277(jsonb) from public,anon,authenticated;
CREATE OR REPLACE FUNCTION nova_private.siege_settle262(rid uuid, retreat_owner uuid DEFAULT NULL::uuid)
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
  -- Logistics clients return surviving deployed units and surviving cargo once at settlement.
  for res in select to_jsonb(o) from nova_private.siege_orders o where room=rid and owner=m.owner and not alien and (id>s.ack or coalesce((s.frame->>'logistics277')::boolean,false) and (exists(select 1 from jsonb_array_elements(coalesce(s.frame->'troops','[]')) t where (t->>10)::bigint=o.id and (t->>3)::numeric>0) or exists(select 1 from jsonb_array_elements(coalesce(s.frame->'transports277','[]')) ship cross join lateral jsonb_array_elements(coalesce(ship->'cargo','[]')) c where (ship->>'hp')::numeric>0 and (c->>'order')::bigint=o.id))) loop m.army:=jsonb_set(m.army,array[res->>'kind'],to_jsonb((m.army->>((res->>'kind')::int))::int+1));end loop;
  select count(*) into returned from nova_private.siege_orders o where o.room=rid and o.owner=m.owner and o.alien and (o.id>s.ack or exists(select 1 from jsonb_array_elements(coalesce(s.frame->'troops','[]')) t where (t->>10)::bigint=o.id and (t->>3)::numeric>0));
  lost:=greatest(0,m.merc-returned);update nova_private.mercenaries set total=total+returned where owner=m.owner;
  res:=jsonb_build_object('surrendered',retreat_owner is not null,'destruction',pct,'loot',cl,'loot_gold',gl,'loot_power',pl,'army',m.army,'merc_lost',lost,'merc_returned',returned,'deployed',(select count(*) from nova_private.siege_orders where room=rid and owner=m.owner and not alien and id<=s.ack));
  res:=res||jsonb_build_object('lost_transports277',coalesce((select jsonb_agg((ship->>'id')::int) from jsonb_array_elements(coalesce(s.frame->'transports277','[]')) ship where ship->>'owner'=m.owner::text and (ship->>'hp')::numeric<=0),'[]'::jsonb));
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
end $function$;

-- Keep the existing unit-order validator, raising its per-army ceiling to the roster limit.
do $$ declare f record;def text;begin
 for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='nova_private' and p.prokind='f' and p.prosrc like '%ส่งทหารได้สูงสุด 40 หน่วยต่อกองทัพ%' loop
  def:=pg_get_functiondef(f.oid);def:=replace(def,'where room=rid and owner=uid and not alien)>=40','where room=rid)>=150');def:=replace(def,'ส่งทหารได้สูงสุด 40 หน่วยต่อกองทัพ','ส่งทหารได้สูงสุด 150 หน่วยต่อกองทัพ');execute def;
 end loop;
end $$;
