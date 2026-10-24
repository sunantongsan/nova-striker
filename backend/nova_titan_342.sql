-- FORGE ownership, reserved construction funds, verified rewards and skill shop.
create table nova_private.titans342(owner uuid primary key references auth.users(id),level int not null default 0 check(level between 0 and 3),gold bigint not null default 0 check(gold between 0 and 10000000),power bigint not null default 0 check(power between 0 and 10000000),finishes_at timestamptz,shop_at timestamptz,skills jsonb not null default '{"slash":1,"palm":1,"dash":0,"shield":0,"nova":0}',ads jsonb not null default '{}',last_ad timestamptz);
create table nova_private.titan_receipts342(owner uuid not null references auth.users(id),id uuid not null,target text not null,provider text,created_at timestamptz not null default now(),claimed_at timestamptz,primary key(owner,id));
alter table nova_private.titans342 enable row level security;
alter table nova_private.titan_receipts342 enable row level security;
revoke all on nova_private.titans342,nova_private.titan_receipts342 from public,anon,authenticated;
create function nova_private.titan_state342(who uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('level',case when level=0 and finishes_at<=now() then 1 else level end,'gold',gold,'power',power,'finishes_at',case when finishes_at>now() then finishes_at end,'shop_at',shop_at,'shop_ready',shop_at<=now(),'skills',skills,'ads',ads,'next_ad',last_ad+interval '60 seconds') from nova_private.titans342 where owner=who;
$$;
create function nova_private.titan_command342(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'titan342';s nova_private.titans342;p public.nova_war_players;receipt nova_private.titan_receipts342;rid uuid;target text;provider text;skill text:=payload->>'skill';lv int;hq int;price int:=0;countn int;amount bigint;g bigint;e bigint;online jsonb;verified bool;effect text;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 if payload->>'owner' is not null and payload->>'owner'<>uid::text then raise exception 'ใช้บัญชีเดิมเพื่อตรวจหุ่น';end if;
 if mode is null or mode not in('status','fund','build','shop','upgrade','skill','speed','prepare','claim') then raise exception 'คำสั่งหุ่นไม่ถูกต้อง';end if;
 perform pg_advisory_xact_lock(153014,1);
 online:=nova_private.command('status',coalesce(payload-'titan342','{}'));
 select * into p from public.nova_war_players where user_id=uid for update;
 insert into nova_private.titans342(owner) values(uid) on conflict do nothing;
 insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
 select * into s from nova_private.titans342 where owner=uid for update;
 if s.level=0 and s.finishes_at<=now() then update nova_private.titans342 set level=1,finishes_at=null where owner=uid returning * into s;end if;
 select coalesce(max((b->>'lv')::int),0) into hq from jsonb_array_elements(coalesce(p.layout,'[]')) b where b->>'type'='hq';
 if mode<>'status' then
  if p.user_id is null or hq<10 then raise exception 'ต้องมีฐานแม่เลเวล 10';end if;
  if nova_private.siege_locked(uid) then raise exception 'รอการรบสิ้นสุดก่อน';end if;
  rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'ไม่มีรหัสรายการ';end if;
  target:=case when mode in('prepare','claim') then payload->>'target' else mode||':'||coalesce(skill,payload->>'kind','') end;
  if target is null then raise exception 'ไม่มีรายการ';end if;
  select * into receipt from nova_private.titan_receipts342 where owner=uid and id=rid for update;
  if receipt.id is not null and receipt.target<>target then raise exception 'รายการไม่ตรง';end if;
  if mode not in('prepare','claim') and exists(select 1 from nova_private.titan_receipts342 where owner=uid and titan_receipts342.provider is not null and claimed_at is null and created_at>now()-interval '30 minutes') then raise exception 'รับรางวัลวิดีโอก่อนหน้าให้เสร็จ';end if;
  if receipt.claimed_at is null then
   if mode in('prepare','claim') then
    if target not in('speed','upgrade','skill:slash','skill:palm','skill:dash','skill:shield','skill:nova') then raise exception 'ไม่พบรางวัล';end if;
    if receipt.id is null and mode='claim' then raise exception 'ไม่พบวิดีโอ';end if;
    if receipt.id is null then
     if s.last_ad>now()-interval '60 seconds' then raise exception 'พักอย่างน้อย 60 วินาทีก่อนดูวิดีโอถัดไป';end if;
     if exists(select 1 from nova_private.titan_receipts342 where owner=uid and titan_receipts342.provider is not null and claimed_at is null and created_at>now()-interval '30 minutes') then raise exception 'รับรางวัลวิดีโอก่อนหน้าให้เสร็จ';end if;
     provider:=case when exists(select 1 from nova_private.telegram_accounts231 where user_id=uid) then 'monetag' else 'admob' end;
     if provider='admob' and not exists(select 1 from nova_private.admob_settings230 where enabled) or provider='monetag' and not exists(select 1 from nova_private.monetag_settings231 where enabled) then raise exception 'โฆษณายังไม่พร้อม';end if;
     if target='speed' and (s.finishes_at is null or s.finishes_at<=now()) or target='upgrade' and s.level not between 1 and 2 then raise exception 'ไม่มีงานที่รับรางวัลได้';end if;
     if target like 'skill:%' then skill:=split_part(target,':',2);lv:=coalesce((s.skills->>skill)::int,0);if s.shop_at is null or s.shop_at>now() or lv>=5 or s.level<(case skill when 'shield' then 2 when 'nova' then 3 else 1 end) then raise exception 'ยังไม่ปลดล็อกสกิลหรือเต็มแล้ว';end if;end if;
     insert into nova_private.titan_receipts342(owner,id,target,provider) values(uid,rid,target,provider) returning * into receipt;
     if provider='admob' then insert into nova_private.admob_intents230(owner,id,kind,amount) values(uid,rid,'timer',0);else insert into nova_private.monetag_intents231(owner,id,kind,amount) values(uid,rid,'timer',0);end if;
     update nova_private.titans342 set last_ad=now() where owner=uid;
    end if;
    if mode='claim' then
     if payload->>'completed' is distinct from 'true' then raise exception 'ดูวิดีโอให้จบก่อน';end if;
     verified:=case receipt.provider when 'admob' then exists(select 1 from nova_private.admob_intents230 where owner=uid and id=rid and kind='timer' and verified_at is not null and claimed_at is null and not cancelled) else exists(select 1 from nova_private.monetag_intents231 where owner=uid and id=rid and kind='timer' and verified_at is not null and claimed_at is null and not cancelled) end;
     if verified then
      if target='speed' then update nova_private.titans342 set finishes_at=greatest(now(),finishes_at-interval '500 seconds') where owner=uid and finishes_at is not null;
      else
       countn:=coalesce((s.ads->>target)::int,0)+1;
       if target='upgrade' then
        if s.level between 1 and 2 and countn>=(case s.level when 1 then 50 else 200 end) then update nova_private.titans342 set level=level+1,ads=jsonb_set(ads,array[target],'0') where owner=uid;else update nova_private.titans342 set ads=jsonb_set(ads,array[target],to_jsonb(countn)) where owner=uid;end if;
       else
        skill:=split_part(target,':',2);lv:=coalesce((s.skills->>skill)::int,0);if countn>=5 and lv<5 then update nova_private.titans342 set skills=jsonb_set(skills,array[skill],to_jsonb(lv+1)),ads=jsonb_set(ads,array[target],'0') where owner=uid;else update nova_private.titans342 set ads=jsonb_set(ads,array[target],to_jsonb(countn)) where owner=uid;end if;
       end if;
      end if;
      update nova_private.titan_receipts342 set claimed_at=now() where owner=uid and id=rid returning * into receipt;
      if receipt.provider='admob' then update nova_private.admob_intents230 set claimed_at=now(),granted=0 where owner=uid and id=rid;else update nova_private.monetag_intents231 set claimed_at=now(),granted=0 where owner=uid and id=rid;end if;
     end if;
    end if;
   else
    if mode='fund' then
     if s.level>0 or s.finishes_at is not null then raise exception 'ฐานนี้มีหุ่นหรือกำลังผลิตแล้ว';end if;
     amount:=(payload->>'amount')::bigint;if amount is null or amount<1 or amount>10000000 or payload->>'kind' not in('gold','power') then raise exception 'จำนวนไม่ถูกต้อง';end if;
     if payload->>'kind'='gold' then amount:=least(amount,10000000-s.gold);g:=amount;e:=0;else amount:=least(amount,10000000-s.power);g:=0;e:=amount;end if;
     if p.resource_gold<g or p.resource_power<e then raise exception 'ทรัพยากรในคลังไม่พอ';end if;
     update public.nova_war_players set resource_gold=resource_gold-g,resource_power=resource_power-e,gold_delta=gold_delta-g,power_delta=power_delta-e where user_id=uid;
     update nova_private.titans342 set gold=gold+g,power=power+e where owner=uid;
    elsif mode='build' then
     if s.level>0 or s.finishes_at is not null or s.gold<10000000 or s.power<10000000 then raise exception 'ต้องสะสมทองและพลังงานอย่างละ 10 ล้าน และมีได้ฐานละตัว';end if;
     update nova_private.titans342 set finishes_at=now()+interval '3 days' where owner=uid;
    elsif mode='shop' then
     if s.shop_at is not null then raise exception 'มีร้านสกิลแล้ว';end if;
     if p.resource_gold<500000 or p.resource_power<500000 then raise exception 'สร้างร้านใช้ทองและพลังงานอย่างละ 500,000';end if;
     update public.nova_war_players set resource_gold=resource_gold-500000,resource_power=resource_power-500000,gold_delta=gold_delta-500000,power_delta=power_delta-500000 where user_id=uid;
     update nova_private.titans342 set shop_at=now()+interval '1 hour' where owner=uid;
    elsif mode='speed' then
     if s.finishes_at is null or s.finishes_at<=now() then raise exception 'ไม่มีงานผลิต';end if;price:=ceil(extract(epoch from(s.finishes_at-now()))/10);update nova_private.titans342 set finishes_at=now(),level=1 where owner=uid;
    elsif mode='upgrade' then
     if s.level not between 1 and 2 then raise exception 'อัปเกรดไม่ได้';end if;price:=case s.level when 1 then 2500 else 10000 end;update nova_private.titans342 set level=level+1,ads=jsonb_set(ads,'{upgrade}','0') where owner=uid;
    elsif mode='skill' then
     if skill is null or skill not in('slash','palm','dash','shield','nova') then raise exception 'ไม่พบสกิล';end if;
     lv:=coalesce((s.skills->>skill)::int,0);if s.shop_at is null or s.shop_at>now() or lv>=5 or s.level<(case skill when 'shield' then 2 when 'nova' then 3 else 1 end) then raise exception 'ยังไม่ปลดล็อกสกิลหรือเต็มแล้ว';end if;
     price:=250*(lv+1)*(lv+1);update nova_private.titans342 set skills=jsonb_set(skills,array[skill],to_jsonb(lv+1)),ads=jsonb_set(ads,array['skill:'||skill],'0') where owner=uid;
    end if;
    if price>0 then update nova_private.test_wallets set gems=gems-price where user_id=uid and gems>=price;if not found then raise exception 'NOVA ไม่พอ';end if;end if;
    insert into nova_private.titan_receipts342(owner,id,target,claimed_at) values(uid,rid,target,now()) returning * into receipt;
   end if;
  end if;
 end if;
 online:=nova_private.command('status','{}');
 return jsonb_build_object('titan342',true,'owner',uid,'state',nova_private.titan_state342(uid),'gems',(select gems from nova_private.test_wallets where user_id=uid),'online',online,'server_time',now(),'receipt',case when receipt.id is not null then jsonb_build_object('id',receipt.id,'provider',receipt.provider,'claimed',receipt.claimed_at is not null) end);
end $$;
alter function nova_private.test_command(text,jsonb) rename to test_command_before_titan342;
create function nova_private.test_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$begin
 if payload ? 'titan342' then if action not in('test_status','test_claim') then raise exception 'คำสั่งไม่ถูกต้อง';end if;return nova_private.titan_command342(payload);end if;
 return nova_private.test_command_before_titan342(action,payload);
end $$;
revoke all on function nova_private.titan_state342(uuid),nova_private.titan_command342(jsonb),nova_private.test_command_before_titan342(text,jsonb) from public,anon,authenticated;
revoke all on function nova_private.test_command(text,jsonb) from public,anon;
grant execute on function nova_private.test_command(text,jsonb) to authenticated;

-- A titan deployment is its own order, never a refundable troop inventory entry.
alter table nova_private.siege_orders add column titan342 jsonb;
create unique index titan342_one_deployment on nova_private.siege_orders(room,owner) where titan342 is not null;
create table nova_private.titan_inputs342(room uuid references nova_private.sieges(id) on delete cascade,owner uuid references auth.users(id),seq bigint not null,dx real not null,dy real not null,skill text,manual bool not null,stamp timestamptz not null default now(),primary key(room,owner));
alter table nova_private.titan_inputs342 enable row level security;
revoke all on nova_private.titan_inputs342 from public,anon,authenticated;
create function nova_private.titan_combat342(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();roomid uuid:=(payload->>'room')::uuid;s nova_private.sieges;mech jsonb;xx numeric:=(payload->>'x')::numeric;yy numeric:=(payload->>'y')::numeric;rid uuid;seqn bigint;dx real;dy real;manual bool;skill text;
begin
 if uid is null or roomid is null then raise exception 'ไม่มีสิทธิ์ควบคุมหุ่น';end if;
 perform pg_advisory_xact_lock(153014,1);
 select * into s from nova_private.sieges where id=roomid for update;
 if s.id is null or s.finished_at is not null or s.ends_at<=now() or not(s.defender=uid or exists(select 1 from nova_private.siege_members where room=roomid and owner=uid and not withdrawn)) then raise exception 'ไม่มีสนามรบที่ควบคุมได้';end if;
 mech:=nova_private.titan_state342(uid);if coalesce((mech->>'level')::int,0)<1 then raise exception 'ไม่มีหุ่นพร้อมรบ';end if;
 if payload->>'titan342'='deploy' then
  if s.defender=uid then raise exception 'หุ่นฝ่ายรับเฝ้าฐานอยู่แล้ว';end if;
  rid:=(payload->>'request_id')::uuid;
  if rid is null or xx is null or yy is null or xx not between .4 and 20.6 or yy not between .4 and 20.6 or not(xx<2 or yy<2 or xx>19 or yy>19) or exists(select 1 from jsonb_array_elements(s.target->'layout') b where abs((b->>'x')::numeric-xx)<.75 and abs((b->>'y')::numeric-yy)<.75) then raise exception 'เลือกขอบสนามที่ว่าง';end if;
  if not exists(select 1 from nova_private.siege_orders where room=roomid and owner=uid and titan342 is not null) then
   insert into nova_private.siege_orders(room,owner,nonce,kind,x,y,titan342) values(roomid,uid,rid,10,xx,yy,jsonb_build_object('level',mech->'level','skills',mech->'skills'));
  end if;
 elsif payload->>'titan342'='control' then
  if s.defender<>uid and not exists(select 1 from nova_private.siege_orders where room=roomid and owner=uid and titan342 is not null) then raise exception 'ส่งหุ่นก่อน';end if;
  seqn:=(payload->>'seq')::bigint;dx:=(payload->>'dx')::real;dy:=(payload->>'dy')::real;manual:=coalesce((payload->>'manual')::bool,false);skill:=payload->>'skill';
  if seqn is null or seqn<0 or dx is null or dy is null or dx not between -1 and 1 or dy not between -1 and 1 or skill is not null and skill not in('slash','palm','dash','shield','nova') then raise exception 'คำสั่งบังคับไม่ถูกต้อง';end if;
  insert into nova_private.titan_inputs342(room,owner,seq,dx,dy,skill,manual) values(roomid,uid,seqn,dx,dy,skill,manual) on conflict(room,owner) do update set seq=excluded.seq,dx=excluded.dx,dy=excluded.dy,skill=excluded.skill,manual=excluded.manual,stamp=now() where titan_inputs342.seq<excluded.seq;
 end if;
 return jsonb_build_object('titan342',true,'combat',true,'owner',uid,'state',mech,'server_time',now());
end $$;
revoke all on function nova_private.titan_combat342(jsonb) from public,anon,authenticated;
create or replace function nova_private.test_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$begin
 if payload ? 'titan342' then
  if action not in('test_status','test_claim') then raise exception 'คำสั่งไม่ถูกต้อง';end if;
  if payload->>'titan342' in('deploy','control') then return nova_private.titan_combat342(payload);end if;
  return nova_private.titan_command342(payload);
 end if;return nova_private.test_command_before_titan342(action,payload);
end $$;
-- Existing finish paths must not add a titan to the ordinary army on refund.
do $migration$ declare f record;body text;begin
 for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='nova_private' and p.prokind='f' and p.prosrc like '%siege_orders%' and p.prosrc like '%jsonb_set(m.army%' loop
  body:=pg_get_functiondef(f.oid);
  body:=replace(body,'and id>s.ack and not alien loop','and id>s.ack and not alien and titan342 is null loop');
  body:=replace(body,'and owner=m.owner and not alien and (id>s.ack','and owner=m.owner and not alien and titan342 is null and (id>s.ack');
  execute body;
 end loop;
end $migration$;
alter function nova_private.siege_command(jsonb) rename to siege_command_before_titan342;
create function nova_private.siege_command(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;rid uuid;tid uuid;state jsonb;inputs jsonb;s nova_private.sieges;
begin
 result:=nova_private.siege_command_before_titan342(payload);
 if result ? 'target' then
  tid:=(result->'target'->>'id')::uuid;state:=nova_private.titan_state342(tid);
  if state is not null then result:=jsonb_set(result,'{target,titan342}',state);end if;
 end if;
 if result ? 'battle' then
  rid:=(result->'battle'->>'id')::uuid;select * into s from nova_private.sieges where id=rid;
  if s.id is not null and s.target->'titan342' is null then
   state:=nova_private.titan_state342(s.defender);
   update nova_private.sieges set target=target||jsonb_build_object('titan342',coalesce(state,'{"level":0}'::jsonb)) where id=rid returning * into s;
  end if;
  if result->'battle' ? 'target' then result:=jsonb_set(result,'{battle,target}',s.target);end if;
  select coalesce(jsonb_agg(jsonb_build_object('owner',owner,'seq',seq,'dx',dx,'dy',dy,'skill',skill,'manual',manual,'age',extract(epoch from(now()-stamp)))),'[]') into inputs from nova_private.titan_inputs342 where room=rid and stamp>now()-interval '2 seconds';
  result:=jsonb_set(result,'{battle,titanInputs342}',inputs);
 end if;
 return result;
end $$;
revoke all on function nova_private.siege_command_before_titan342(jsonb),nova_private.siege_command(jsonb) from public,anon;
grant execute on function nova_private.siege_command(jsonb) to authenticated;
revoke all on function nova_private.siege_command_before_titan342(jsonb) from authenticated;
