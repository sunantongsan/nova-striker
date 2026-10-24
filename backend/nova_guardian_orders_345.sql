-- Start an order with available resources; settle shortages explicitly or wait for stock.
alter table nova_private.titans342 add column ordered345 boolean not null default false, add column waiting345 boolean not null default false;
create or replace function nova_private.titan_state342(who uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('level',case when level=0 and finishes_at<=now() then 1 else level end,'gold',gold,'power',power,'finishes_at',case when finishes_at>now() then finishes_at end,
 'ordered345',ordered345,'waiting345',waiting345,'remaining_nova345',ceil((20000000-gold-power)::numeric/10000),
 'remaining_ads345',ceil((20000000-gold-power)::numeric/2000000),
 'speed_nova345',ceil(greatest(0,extract(epoch from(finishes_at-now())))/10),
 'speed_ads345',ceil(greatest(0,extract(epoch from(finishes_at-now())))/25920),
 'shop_ready',true,'skills',skills,'ads',ads,'next_ad',last_ad+interval '60 seconds') from nova_private.titans342 where owner=who;
$$;
create or replace function nova_private.titan_command342(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'titan342';s nova_private.titans342;p public.nova_war_players;receipt nova_private.titan_receipts342;rid uuid;target text;provider text;skill text:=payload->>'skill';lv int;hq int;price int:=0;countn int;amount bigint;g bigint;e bigint;online jsonb;verified bool;effect text;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 if payload->>'owner' is not null and payload->>'owner'<>uid::text then raise exception 'ใช้บัญชีเดิมเพื่อตรวจหุ่น';end if;
 if mode is null or mode not in('status','order','complete','wait','fund','build','upgrade','skill','speed','prepare','claim') then raise exception 'คำสั่งหุ่นไม่ถูกต้อง';end if;
 perform pg_advisory_xact_lock(153014,1);
 online:=nova_private.command('status',coalesce(payload-'titan342','{}'));
 select * into p from public.nova_war_players where user_id=uid for update;
 insert into nova_private.titans342(owner) values(uid) on conflict do nothing;
 insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
 select * into s from nova_private.titans342 where owner=uid for update;
 if s.level=0 and s.finishes_at<=now() then update nova_private.titans342 set level=1,finishes_at=null where owner=uid returning * into s;end if;
 select coalesce(max((b->>'lv')::int),0) into hq from jsonb_array_elements(coalesce(p.layout,'[]')) b where b->>'type'='hq';

 if mode='status' and s.ordered345 and s.waiting345 and s.level=0 and s.finishes_at is null and not nova_private.siege_locked(uid)
 and not exists(select 1 from nova_private.titan_receipts342 where owner=uid and titan_receipts342.provider is not null and claimed_at is null and created_at>now()-interval '30 minutes') then
  g:=least(greatest(0,p.resource_gold),10000000-s.gold);e:=least(greatest(0,p.resource_power),10000000-s.power);
  update public.nova_war_players set resource_gold=resource_gold-g,resource_power=resource_power-e,gold_delta=gold_delta-g,power_delta=power_delta-e where user_id=uid;
  update nova_private.titans342 set gold=gold+g,power=power+e where owner=uid returning * into s;
 end if;
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
    if target not in('resources','speed','upgrade','skill:slash','skill:palm','skill:dash','skill:shield','skill:nova') then raise exception 'ไม่พบรางวัล';end if;
    if receipt.id is null and mode='claim' then raise exception 'ไม่พบวิดีโอ';end if;
    if receipt.id is null then
     if s.last_ad>now()-interval '60 seconds' then raise exception 'พักอย่างน้อย 60 วินาทีก่อนดูวิดีโอถัดไป';end if;
     if exists(select 1 from nova_private.titan_receipts342 where owner=uid and titan_receipts342.provider is not null and claimed_at is null and created_at>now()-interval '30 minutes') then raise exception 'รับรางวัลวิดีโอก่อนหน้าให้เสร็จ';end if;
     provider:=case when exists(select 1 from nova_private.telegram_accounts231 where user_id=uid) then 'monetag' else 'admob' end;
     if provider='admob' and not exists(select 1 from nova_private.admob_settings230 where enabled) or provider='monetag' and not exists(select 1 from nova_private.monetag_settings231 where enabled) then raise exception 'โฆษณายังไม่พร้อม';end if;
     if target='resources' and (not s.ordered345 or s.level>0 or s.finishes_at is not null) then raise exception 'ไม่มีทรัพยากรค้างชำระ';end if;
     if target='speed' and (s.finishes_at is null or s.finishes_at<=now()) or target='upgrade' and s.level not between 1 and 2 then raise exception 'ไม่มีงานที่รับรางวัลได้';end if;
     if target like 'skill:%' then skill:=split_part(target,':',2);lv:=coalesce((s.skills->>skill)::int,0);if lv>=5 or s.level<(case skill when 'shield' then 2 when 'nova' then 3 else 1 end) then raise exception 'ยังไม่ปลดล็อกสกิลหรือเต็มแล้ว';end if;end if;
     insert into nova_private.titan_receipts342(owner,id,target,provider) values(uid,rid,target,provider) returning * into receipt;
     if provider='admob' then insert into nova_private.admob_intents230(owner,id,kind,amount) values(uid,rid,'timer',0);else insert into nova_private.monetag_intents231(owner,id,kind,amount) values(uid,rid,'timer',0);end if;
     update nova_private.titans342 set last_ad=now() where owner=uid;
    end if;
    if mode='claim' then
     if payload->>'completed' is distinct from 'true' then raise exception 'ดูวิดีโอให้จบก่อน';end if;
     verified:=case receipt.provider when 'admob' then exists(select 1 from nova_private.admob_intents230 where owner=uid and id=rid and kind='timer' and verified_at is not null and claimed_at is null and not cancelled) else exists(select 1 from nova_private.monetag_intents231 where owner=uid and id=rid and kind='timer' and verified_at is not null and claimed_at is null and not cancelled) end;
     if verified then
      if target='resources' then
       g:=least(2000000,10000000-s.gold);e:=least(2000000-g,10000000-s.power);
       update nova_private.titans342 set gold=gold+g,power=power+e where owner=uid;
      elsif target='speed' then update nova_private.titans342 set finishes_at=greatest(now(),finishes_at-interval '25920 seconds') where owner=uid and finishes_at is not null;
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
    if mode='order' then
     if s.level>0 or s.finishes_at is not null or s.ordered345 then raise exception 'ฐานนี้สั่งสร้างหุ่นแล้ว';end if;
     g:=least(greatest(0,p.resource_gold),10000000-s.gold);e:=least(greatest(0,p.resource_power),10000000-s.power);
     update public.nova_war_players set resource_gold=resource_gold-g,resource_power=resource_power-e,gold_delta=gold_delta-g,power_delta=power_delta-e where user_id=uid;
     update nova_private.titans342 set ordered345=true,gold=gold+g,power=power+e where owner=uid;
    elsif mode='wait' then
     if not s.ordered345 or s.level>0 or s.finishes_at is not null then raise exception 'ไม่มีทรัพยากรค้างชำระ';end if;
     update nova_private.titans342 set waiting345=true where owner=uid;
    elsif mode='complete' then
     if not s.ordered345 or s.level>0 or s.finishes_at is not null then raise exception 'ไม่มีทรัพยากรค้างชำระ';end if;
     price:=ceil((20000000-s.gold-s.power)::numeric/10000);
     update nova_private.titans342 set gold=10000000,power=10000000 where owner=uid;
    elsif mode='fund' then
     if s.level>0 or s.finishes_at is not null then raise exception 'ฐานนี้มีหุ่นหรือกำลังผลิตแล้ว';end if;
     amount:=(payload->>'amount')::bigint;if amount is null or amount<1 or amount>10000000 or payload->>'kind' not in('gold','power') then raise exception 'จำนวนไม่ถูกต้อง';end if;
     if payload->>'kind'='gold' then amount:=least(amount,10000000-s.gold);g:=amount;e:=0;else amount:=least(amount,10000000-s.power);g:=0;e:=amount;end if;
     if p.resource_gold<g or p.resource_power<e then raise exception 'ทรัพยากรในคลังไม่พอ';end if;
     update public.nova_war_players set resource_gold=resource_gold-g,resource_power=resource_power-e,gold_delta=gold_delta-g,power_delta=power_delta-e where user_id=uid;
     update nova_private.titans342 set gold=gold+g,power=power+e where owner=uid;
    elsif mode='build' then
     if s.level>0 or s.finishes_at is not null or s.gold<10000000 or s.power<10000000 then raise exception 'ต้องสะสมทองและพลังงานอย่างละ 10 ล้าน และมีได้ฐานละตัว';end if;
     update nova_private.titans342 set finishes_at=now()+interval '3 days' where owner=uid;
    elsif mode='speed' then
     if s.finishes_at is null or s.finishes_at<=now() then raise exception 'ไม่มีงานผลิต';end if;price:=ceil(extract(epoch from(s.finishes_at-now()))/10);update nova_private.titans342 set finishes_at=now(),level=1 where owner=uid;
    elsif mode='upgrade' then
     if s.level not between 1 and 2 then raise exception 'อัปเกรดไม่ได้';end if;price:=case s.level when 1 then 2500 else 10000 end;update nova_private.titans342 set level=level+1,ads=jsonb_set(ads,'{upgrade}','0') where owner=uid;
    elsif mode='skill' then
     if skill is null or skill not in('slash','palm','dash','shield','nova') then raise exception 'ไม่พบสกิล';end if;
     lv:=coalesce((s.skills->>skill)::int,0);if lv>=5 or s.level<(case skill when 'shield' then 2 when 'nova' then 3 else 1 end) then raise exception 'ยังไม่ปลดล็อกสกิลหรือเต็มแล้ว';end if;
     price:=250*(lv+1)*(lv+1);update nova_private.titans342 set skills=jsonb_set(skills,array[skill],to_jsonb(lv+1)),ads=jsonb_set(ads,array['skill:'||skill],'0') where owner=uid;
    end if;
    if price>0 then update nova_private.test_wallets set gems=gems-price where user_id=uid and gems>=price;if not found then raise exception 'NOVA ไม่พอ';end if;end if;
    insert into nova_private.titan_receipts342(owner,id,target,claimed_at) values(uid,rid,target,now()) returning * into receipt;
   end if;
  end if;
 end if;
 update nova_private.titans342 set finishes_at=now()+interval '3 days' where owner=uid and ordered345 and level=0 and finishes_at is null and gold=10000000 and power=10000000;
 online:=nova_private.command('status','{}');
 return jsonb_build_object('titan342',true,'owner',uid,'state',nova_private.titan_state342(uid),'gems',(select gems from nova_private.test_wallets where user_id=uid),'online',online,'server_time',now(),'receipt',case when receipt.id is not null then jsonb_build_object('id',receipt.id,'provider',receipt.provider,'claimed',receipt.claimed_at is not null) end);
end $$;

revoke all on function nova_private.titan_state342(uuid),nova_private.titan_command342(jsonb) from public,anon,authenticated;
