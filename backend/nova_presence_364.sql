CREATE OR REPLACE FUNCTION nova_private.siege_command(payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
 if r ? 'target' then
  r:=jsonb_set(r,'{target,presence364}',jsonb_build_object(
   'online',exists(select 1 from nova_private.presence293 q where q.user_id=tid and q.last_seen>now()-interval '2 minutes'),
   'checked_at',now()));
 end if;
 if receipt.id is null then
  select * into p from public.nova_war_players where user_id=uid for update;
  if p.user_id is null or nova_private.resource_balance(p,'gold')<100 then raise exception 'ทองไม่พอ • ค้นหาฐานครั้งละ 100 ทอง';end if;
  update public.nova_war_players set resource_gold=nova_private.resource_balance(p,'gold')-100,resource_power=nova_private.resource_balance(p,'power'),resource_at=now(),gold_delta=gold_delta-100 where user_id=uid;
  insert into nova_private.scout_receipts362 values(uid,rid,tid,100) returning * into receipt;
 end if;
 return coalesce(r,jsonb_build_object('live',mode))||jsonb_build_object('online',nova_private.command('status','{}'),'scout362',jsonb_build_object('id',rid,'owner',uid,'cost',receipt.cost));
end $function$

;
