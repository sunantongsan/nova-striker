-- One voluntary ad boosts all production by 30 minutes; receipts remain authoritative.
create function nova_private.production_quote240(p public.nova_war_players) returns jsonb language plpgsql stable set search_path='' as $$
declare g bigint;e bigint;c bigint;
begin
 select coalesce(sum((b->>'lv')::int*1080) filter(where b->>'type'='mine'),0),coalesce(sum((b->>'lv')::int*1080) filter(where b->>'type'='reactor'),0) into g,e from jsonb_array_elements(p.layout) b;
 return jsonb_build_object('gold',least(g,greatest(0,p.gold_cap-nova_private.resource_balance(p,'gold'))),'power',least(e,greatest(0,p.power_cap-nova_private.resource_balance(p,'power'))),'crystals',least(nova_private.rate(p)/2,greatest(0,nova_private.capacity(p)-p.crystals)));
end $$;
revoke all on function nova_private.production_quote240(public.nova_war_players) from public,anon,authenticated;
alter table nova_private.admob_intents230 drop constraint admob_intents230_kind_check;
alter table nova_private.admob_intents230 add constraint admob_intents230_kind_check check(kind in ('gold','power','crystals','speed','checkin','production'));
alter table nova_private.admob_intents230 add column production240 jsonb,add column granted240 jsonb;
alter table nova_private.monetag_intents231 drop constraint monetag_intents231_kind_check;
alter table nova_private.monetag_intents231 add constraint monetag_intents231_kind_check check(kind in ('gold','power','crystals','speed','checkin','production'));
alter table nova_private.monetag_intents231 add column production240 jsonb,add column granted240 jsonb;
do $migration$declare body text;fn text;tbl text;begin
 foreach fn in array array['nova_private.command_before_resources233(text,jsonb)','public.nova_telegram_command(text,jsonb)','nova_private.checkin_ad234(text,jsonb,text)'] loop
  body:=pg_get_functiondef(fn::regprocedure);
  body:=regexp_replace(body,E'[^\n]*if exists[^\n]*interval ''2 minutes''[^\n]*end if;','','g');
  if fn not like '%checkin_ad234%' then
   tbl:=case when fn like 'public.%' then 'monetag_intents231' else 'admob_intents230' end;
   body:=replace(body,'amount bigint;enabled bool;','amount bigint;enabled bool;prod240 jsonb;g240 bigint;e240 bigint;c240 bigint;');
   body:=replace(body,$old$kind not in ('gold','power','crystals','speed')$old$,$new$kind not in ('gold','power','crystals','speed','production')$new$);
   body:=replace(body,$old$   if kind='speed' then$old$,$prepare$
   if exists(select 1 from nova_private.admob_intents230 where owner=uid and not cancelled and claimed_at is null and (expires_at>now() or verified_at is not null)) or exists(select 1 from nova_private.monetag_intents231 where owner=uid and not cancelled and claimed_at is null and (expires_at>now() or verified_at is not null)) then raise exception 'กรุณารับรางวัลรายการก่อนให้เสร็จ';end if;
   if kind='production' then
    prod240:=nova_private.production_quote240(p);amount:=(prod240->>'gold')::bigint+(prod240->>'power')::bigint+(prod240->>'crystals')::bigint;
   elsif kind='speed' then$prepare$);
   body:=replace(body,'(owner,id,kind,job,amount) values(uid,rid,kind,job,amount)','(owner,id,kind,job,amount,production240) values(uid,rid,kind,job,amount,prod240)');
   body:=replace(body,$old$  if r.kind='speed' then$old$,$claim$
  if r.kind='production' then
   g240:=least((r.production240->>'gold')::bigint,greatest(0,p.gold_cap-nova_private.resource_balance(p,'gold')));
   e240:=least((r.production240->>'power')::bigint,greatest(0,p.power_cap-nova_private.resource_balance(p,'power')));
   c240:=least((r.production240->>'crystals')::bigint,greatest(0,nova_private.capacity(p)-p.crystals));
   amount:=g240+e240+c240;
   update public.nova_war_players set resource_gold=nova_private.resource_balance(p,'gold')+g240,resource_power=nova_private.resource_balance(p,'power')+e240,gold_delta=gold_delta+g240,power_delta=power_delta+e240,crystals=crystals+c240,resource_at=now() where user_id=uid;
   prod240:=jsonb_build_object('gold',g240,'power',e240,'crystals',c240);
  elsif r.kind='speed' then$claim$);
   body:=replace(body,'set claimed_at=now(),granted=','set claimed_at=now(),granted240=prod240,granted=');
   body:=replace(body,$old$'amount',r.amount,'expires_at'$old$,$new$'amount',r.amount,'production240',r.production240,'granted240',r.granted240,'expires_at'$new$);
  end if;
  execute body;
 end loop;
 body:=pg_get_functiondef('nova_private.bundle_quote238(public.nova_war_players,jsonb)'::regprocedure);
 body:=replace(body,$old$'kind','bundle','items'$old$,$new$'production240',nova_private.production_quote240(p),'kind','bundle','items'$new$);execute body;
 body:=pg_get_functiondef('nova_private.resource_quote233(public.nova_war_players,text,bigint)'::regprocedure);
 body:=replace(body,$old$'kind',kind,'ad_amount'$old$,$new$'production240',nova_private.production_quote240(p),'kind',kind,'ad_amount'$new$);execute body;
end $migration$;
