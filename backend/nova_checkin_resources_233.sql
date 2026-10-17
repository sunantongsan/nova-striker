-- Daily rewards are explicit server check-ins. Preserve all existing balances.
alter table nova_private.test_wallets add column if not exists checkin_streak233 integer not null default 0;
alter table nova_private.test_wallets add column if not exists checkin_reward233 integer not null default 0;
do $migration$
declare body text;
begin
 body:=pg_get_functiondef('nova_private.test_command(text,jsonb)'::regprocedure);
 if strpos(body,'gems=gems+10000')=0 then raise exception 'Inspect daily reward implementation before applying 233';end if;
 body:=replace(body,$old$if action='test_claim' and (w.claimed_day is null or w.claimed_day<today) then$old$, $new$if action='test_claim' and payload->>'checkin233'='true' and (w.claimed_day is null or w.claimed_day<today) then$new$);
 body:=replace(body,'update nova_private.test_wallets set gems=gems+10000,claimed_day=today where user_id=uid returning * into w;', 'qty:=case when w.claimed_day=today-1 then w.checkin_streak233+1 else 1 end;
  amount:=20+5*(qty-1);
  update nova_private.test_wallets set gems=gems+amount,claimed_day=today,checkin_streak233=qty,checkin_reward233=amount where user_id=uid returning * into w;');
 body:=replace(body,'if r is null then'||chr(10)||$kind$   kind:=payload->>'kind';$kind$, $disable$if r is null then raise exception 'กรุณาเปิดเกมใหม่เพื่อใช้อัตราแลกใหม่';$disable$||chr(10)||$kind$   kind:=payload->>'kind';$kind$);
 body:=replace(body,'return result;', 'return result||jsonb_build_object(''checkin233'',jsonb_build_object(''day'',today,''claimed'',coalesce(w.claimed_day>=today,false),''streak'',case when w.claimed_day>=today-1 then w.checkin_streak233 else 0 end,''reward'',case when w.claimed_day=today then w.checkin_reward233 else 0 end,''next_reward'',20+5*(case when w.claimed_day>=today-1 then w.checkin_streak233 else 0 end)));');
 execute body;
end $migration$;

-- The same production basis as verified AdMob/Monetag rewards, with a 20% paid bonus.
create or replace function nova_private.resource_quote233(p public.nova_war_players,kind text,wanted bigint default null)
returns jsonb language plpgsql stable set search_path='' as $$
declare base bigint;room bigint;amount bigint;paid bigint;balance bigint;
begin
 if kind not in ('gold','power','crystals') or kind is null then raise exception 'เลือกทรัพยากรไม่ถูกต้อง';end if;
 if wanted is not null and wanted<=0 then raise exception 'จำนวนไม่ถูกต้อง';end if;
 if kind='crystals' then
  base:=nova_private.rate(p)/4;balance:=p.crystals;room:=greatest(0,nova_private.capacity(p)-balance);
 else
  select coalesce(sum((b->>'lv')::int*1080),0) into base from jsonb_array_elements(p.layout) b where b->>'type'=case when kind='gold' then 'mine' else 'reactor' end;
  balance:=nova_private.resource_balance(p,kind);room:=greatest(0,case when kind='gold' then p.gold_cap else p.power_cap end-balance);
 end if;
 paid:=floor(base*1.2);amount:=least(paid,room,coalesce(wanted,paid));
 return jsonb_build_object('kind',kind,'ad_amount',least(base,room),'ad_base',base,'paid_base',paid,'amount',amount,'cost',case when amount>0 and paid>0 then ceil(15.0*amount/paid)::int else 0 end,'balance',balance,'room',room);
end $$;
revoke all on function nova_private.resource_quote233(public.nova_war_players,text,bigint) from public,anon,authenticated;
create table nova_private.resource_receipts233(owner uuid not null references auth.users(id) on delete cascade,id uuid not null,kind text not null,amount bigint not null,cost integer not null,signature jsonb not null,cancelled boolean not null default false,primary key(owner,id));
alter table nova_private.resource_receipts233 enable row level security;
revoke all on nova_private.resource_receipts233 from public,anon,authenticated;
alter function nova_private.command(text,jsonb) rename to command_before_resources233;
-- Explicit labels in the previous provider implementation remain valid after rename.
create function nova_private.command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
<<resource233>>
declare uid uuid:=auth.uid();mode text:=payload->>'resource233';result jsonb;p public.nova_war_players;r nova_private.resource_receipts233;q jsonb;rid uuid;kind text;wanted bigint;sig jsonb;wallet integer;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ';end if;
 if mode is null then return nova_private.command_before_resources233(action,payload);end if;
 if action<>'research' or mode not in ('quote','buy','status','cancel') then raise exception 'คำสั่งไม่ถูกต้อง';end if;
 if payload->>'owner' is distinct from uid::text then raise exception 'กรุณาใช้บัญชีเดิม';end if;
 perform pg_advisory_xact_lock(153014,1);
 result:=nova_private.command_before_resources233('status',payload-'resource233');
 select * into p from public.nova_war_players where user_id=uid;
 if p.user_id is null then raise exception 'เชื่อมต่อกองบัญชาการก่อน';end if;
 if nova_private.siege_locked(uid) or exists(select 1 from nova_private.siege_members m join nova_private.sieges s on s.id=m.room where m.owner=uid and s.finished_at is null) or exists(select 1 from nova_private.live_battles where not finished and(attacker=uid or defender=uid)) then raise exception 'รอการรบสิ้นสุดก่อน';end if;
 insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
 select gems into wallet from nova_private.test_wallets where user_id=uid for update;
 kind:=payload->>'kind';wanted:=(payload->>'wanted')::bigint;
 if mode='quote' then
  q:=nova_private.resource_quote233(p,kind,wanted);
  return result||jsonb_build_object('resource233',true,'resource_quote',q,'wallet_gems',wallet);
 end if;
 rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'ต้องมีรหัสรายการ';end if;
 select * into r from nova_private.resource_receipts233 where owner=uid and id=rid;
 sig:=jsonb_build_object('kind',kind,'wanted',wanted,'quoted_amount',(payload->>'quoted_amount')::bigint,'quoted_cost',(payload->>'quoted_cost')::integer);
 if r.id is not null and mode='buy' and not r.cancelled and r.signature is distinct from sig then raise exception 'รหัสรายการถูกใช้แล้ว';end if;
 if r.id is null and mode='cancel' then
  insert into nova_private.resource_receipts233(owner,id,kind,amount,cost,signature,cancelled) values(uid,rid,coalesce(kind,'gold'),0,0,sig,true) returning * into r;
 elsif r.id is null and mode='buy' then
  q:=nova_private.resource_quote233(p,kind,wanted);
  if (q->>'amount')::bigint<=0 then raise exception 'ไม่มีรางวัลที่รับได้ คลังเต็มหรือไม่มีงาน';end if;
  if (q->>'amount')::bigint is distinct from (payload->>'quoted_amount')::bigint or (q->>'cost')::int is distinct from (payload->>'quoted_cost')::int then raise exception 'ราคาเปลี่ยน กรุณาตรวจรายการ';end if;
  if wallet<(q->>'cost')::int then raise exception 'เพชรออนไลน์ไม่พอ';end if;
  update nova_private.test_wallets set gems=gems-(q->>'cost')::int where user_id=uid returning gems into wallet;
  if kind='crystals' then update public.nova_war_players set crystals=crystals+(q->>'amount')::bigint where user_id=uid;
  else
   update public.nova_war_players set
    resource_gold=case when kind='gold' then nova_private.resource_balance(p,'gold')+(q->>'amount')::bigint else nova_private.resource_balance(p,'gold') end,
    resource_power=case when kind='power' then nova_private.resource_balance(p,'power')+(q->>'amount')::bigint else nova_private.resource_balance(p,'power') end,
    gold_delta=gold_delta+case when kind='gold' then (q->>'amount')::bigint else 0 end,
    power_delta=power_delta+case when kind='power' then (q->>'amount')::bigint else 0 end,resource_at=now() where user_id=uid;
  end if;
  insert into nova_private.resource_receipts233(owner,id,kind,amount,cost,signature) values(uid,rid,kind,(q->>'amount')::bigint,(q->>'cost')::int,sig) returning * into r;
 end if;
 result:=nova_private.command_before_resources233('status','{}');
 return result||jsonb_build_object('resource233',true,'wallet_gems',wallet,'resource_receipt',case when r.id is null then null else jsonb_build_object('id',r.id,'kind',r.kind,'amount',r.amount,'cost',r.cost,'cancelled',r.cancelled) end);
end $$;
revoke all on function nova_private.command_before_resources233(text,jsonb) from public,anon,authenticated;
revoke all on function nova_private.command(text,jsonb) from public,anon;
grant execute on function nova_private.command(text,jsonb) to authenticated;
