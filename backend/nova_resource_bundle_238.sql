-- Quote all missing upgrade resources at the existing production-scaled diamond rate.
create function nova_private.bundle_quote238(p public.nova_war_players,needs jsonb) returns jsonb language plpgsql stable set search_path='' as $$
declare k text;n bigint;q jsonb;items jsonb:='[]';total int:=0;amount bigint:=0;price int;ok bool:=true;ad_kind text;ad_amount bigint:=0;largest int:=-1;
begin
 if jsonb_typeof(needs) is distinct from 'object' then raise exception 'Invalid resource quantities';end if;
 foreach k in array array['gold','power','crystals'] loop
  n:=coalesce((needs->>k)::bigint,0);if n<0 or n>100000000 then raise exception 'Invalid resource quantities';end if;
  if n=0 then continue;end if;
  q:=nova_private.resource_quote233(p,k,n);
  if (q->>'paid_base')::bigint<=0 or (q->>'room')::bigint<n then ok:=false;end if;
  price:=case when (q->>'paid_base')::bigint>0 then ceil(15.0*n/(q->>'paid_base')::bigint)::int else 0 end;
  total:=total+price;amount:=amount+n;
  items:=items||jsonb_build_array(jsonb_build_object('kind',k,'amount',n,'cost',price));
  if (q->>'ad_amount')::bigint>0 and price>largest then largest:=price;ad_kind:=k;ad_amount:=(q->>'ad_amount')::bigint;end if;
 end loop;
 return jsonb_build_object('kind','bundle','items',items,'cost',total,'amount',amount,'available',ok and amount>0 and total>0,'ad_kind',ad_kind,'ad_amount',ad_amount);
end $$;
revoke all on function nova_private.bundle_quote238(public.nova_war_players,jsonb) from public,anon,authenticated;
alter function nova_private.command(text,jsonb) rename to command_before_bundle238;
create function nova_private.command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'resource233';p public.nova_war_players;r nova_private.resource_receipts233;result jsonb;q jsonb;rid uuid;sig jsonb;wallet integer;g bigint;e bigint;c bigint;
begin
 if payload->>'kind' is distinct from 'bundle' or mode is null then return nova_private.command_before_bundle238(action,payload);end if;
 if uid is null or payload->>'owner' is distinct from uid::text then raise exception 'กรุณาใช้บัญชีเดิม';end if;
 if action<>'research' or mode not in ('quote','buy','status','cancel') then raise exception 'คำสั่งไม่ถูกต้อง';end if;
 perform pg_advisory_xact_lock(153014,1);
 result:=nova_private.command_before_bundle238('status','{}');
 select * into p from public.nova_war_players where user_id=uid;
 if p.user_id is null then raise exception 'เชื่อมต่อกองบัญชาการก่อน';end if;
 if nova_private.siege_locked(uid) or exists(select 1 from nova_private.siege_members m join nova_private.sieges s on s.id=m.room where m.owner=uid and s.finished_at is null) or exists(select 1 from nova_private.live_battles where not finished and(attacker=uid or defender=uid)) then raise exception 'รอการรบสิ้นสุดก่อน';end if;
 insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
 select gems into wallet from nova_private.test_wallets where user_id=uid for update;
 if mode='quote' then return result||jsonb_build_object('resource_quote',nova_private.bundle_quote238(p,payload->'needs'),'wallet_gems',wallet);end if;
 rid:=(payload->>'request_id')::uuid;if rid is null then raise exception 'ต้องมีรหัสรายการ';end if;
 sig:=jsonb_build_object('needs',payload->'needs','quoted_cost',(payload->>'quoted_cost')::int,'quoted_amount',(payload->>'quoted_amount')::bigint);
 select * into r from nova_private.resource_receipts233 where owner=uid and id=rid;
 if r.id is not null and r.kind<>'bundle' then raise exception 'รหัสรายการถูกใช้แล้ว';end if;
 if r.id is not null and mode='buy' and not r.cancelled and r.signature is distinct from sig then raise exception 'รหัสรายการถูกใช้แล้ว';end if;
 if r.id is null and mode='cancel' then
  insert into nova_private.resource_receipts233(owner,id,kind,amount,cost,signature,cancelled) values(uid,rid,'bundle',0,0,sig,true) returning * into r;
 elsif r.id is null and mode='buy' then
  q:=nova_private.bundle_quote238(p,payload->'needs');
  if not (q->>'available')::bool then raise exception 'ไม่มีรางวัลที่รับได้ คลังเต็มหรือไม่มีงาน';end if;
  if (q->>'cost')::int is distinct from (payload->>'quoted_cost')::int or (q->>'amount')::bigint is distinct from (payload->>'quoted_amount')::bigint then raise exception 'ราคาเปลี่ยน กรุณาตรวจรายการ';end if;
  if wallet<(q->>'cost')::int then raise exception 'เพชรออนไลน์ไม่พอ';end if;
  g:=coalesce((payload->'needs'->>'gold')::bigint,0);e:=coalesce((payload->'needs'->>'power')::bigint,0);c:=coalesce((payload->'needs'->>'crystals')::bigint,0);
  update nova_private.test_wallets set gems=gems-(q->>'cost')::int where user_id=uid returning gems into wallet;
  update public.nova_war_players set resource_gold=nova_private.resource_balance(p,'gold')+g,resource_power=nova_private.resource_balance(p,'power')+e,gold_delta=gold_delta+g,power_delta=power_delta+e,crystals=crystals+c,resource_at=now() where user_id=uid;
  insert into nova_private.resource_receipts233(owner,id,kind,amount,cost,signature) values(uid,rid,'bundle',(q->>'amount')::bigint,(q->>'cost')::int,sig) returning * into r;
 end if;
 return nova_private.command_before_bundle238('status','{}')||jsonb_build_object('wallet_gems',wallet,'resource_receipt',case when r.id is null then null else jsonb_build_object('id',r.id,'kind',r.kind,'amount',r.amount,'cost',r.cost,'cancelled',r.cancelled) end);
end $$;
revoke all on function nova_private.command_before_bundle238(text,jsonb) from public,anon,authenticated;
revoke all on function nova_private.command(text,jsonb) from public,anon;
grant execute on function nova_private.command(text,jsonb) to authenticated;
