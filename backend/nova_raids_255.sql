-- Base-level rules are enforced server-side for browse and every attack entry point.
create function nova_private.hq255(layout jsonb) returns int language sql immutable set search_path='' as $$
 select coalesce((select greatest(1,least(15,coalesce((b->>'lv')::int,1))) from jsonb_array_elements(layout) b where b->>'type'='hq' limit 1),1)
$$;
create function nova_private.match255(attacker uuid,defender uuid) returns bool language sql stable set search_path='' as $$
 select attacker<>defender and exists(select 1 from public.nova_war_players a,public.nova_war_players d where a.user_id=attacker and d.user_id=defender and
 ((select count(*) from (select user_id from public.nova_war_players union select owner from nova_private.miners251) members)<100 or abs(nova_private.hq255(a.layout)-nova_private.hq255(d.layout))<=5))
$$;
create function nova_private.raid_rate255(attacker int,defender int) returns int language sql immutable set search_path='' as $$
 select case when attacker>defender then greatest(0,40-(attacker-defender)*8) else 40+least(3,defender-attacker)*4 end
$$;
alter table public.nova_war_reports add column nova255 int not null default 0;
-- AFTER insertion avoids paying again on ON CONFLICT retries. Store the amount in the existing row.
create function nova_private.raid_credit255() returns trigger language plpgsql security definer set search_path='' as $$
declare a public.nova_war_players;d public.nova_war_players;reward int;weight numeric;total numeric;
begin
 if new.destruction<>100 then return new;end if;
 select * into a from public.nova_war_players where user_id=new.attacker;
 select * into d from public.nova_war_players where user_id=new.defender;
 reward:=nova_private.raid_rate255(nova_private.hq255(a.layout),nova_private.hq255(d.layout));
 if exists(select 1 from nova_private.sieges where id=new.request_id) then
  select count(*),count(*) filter(where owner=new.attacker) into total,weight from nova_private.siege_orders where room=new.request_id and id<=(select ack from nova_private.sieges where id=new.request_id);
  reward:=case when total>0 then floor(reward*weight/total) else 0 end;
 end if;
 if reward>0 then
  insert into nova_private.miners251(owner,code,code_key) values(new.attacker,replace(new.attacker::text,'-',''),replace(new.attacker::text,'-','')) on conflict(owner) do nothing;
  insert into nova_private.test_wallets(user_id) values(new.attacker) on conflict do nothing;
  update nova_private.miners251 set earned=earned+reward,credited=credited+reward where owner=new.attacker;
  update nova_private.test_wallets set gems=gems+reward where user_id=new.attacker;
  insert into nova_private.mining_ledger251(owner,kind,amount,source) values(new.attacker,'raid',reward,new.id);
 end if;
 update public.nova_war_reports set nova255=reward where id=new.id;return new;
end $$;
create trigger nova_raid_credit255 after insert on public.nova_war_reports for each row execute function nova_private.raid_credit255();
-- Update the original engines without bypassing later enhancement/timer wrappers.
do $$ declare src text;begin
 select pg_get_functiondef('nova_private.command_before_siege(text,jsonb)'::regprocedure) into src;
 if position('*.6' in src)=0 then raise exception 'Unexpected raid engine';end if;
 src:=replace(src,'*.6','*.5');
 src:=replace(src,'from public.nova_war_players p where p.user_id<>uid','from public.nova_war_players p where p.user_id<>uid and nova_private.match255(uid,p.user_id)');
 src:=replace(src,$rep$if enemy.shield_until>now()$rep$, $rep$if not nova_private.match255(uid,target) then raise exception 'ไม่พบคู่ต่อสู้นี้ กรุณาค้นหาใหม่';end if; if enemy.shield_until>now()$rep$);
 src:=replace(src,$rep$shield_until=now()+interval '30 minutes'$rep$, $rep$shield_until=greatest(shield_until,now()+case when pct=100 then interval '4 hours' else interval '30 minutes' end)$rep$);
 -- Defenders lose the budget even if the attacker's storage is full; only collected loot is credited.
 src:=replace(src,$rep$resource_gold=nova_private.resource_balance(enemy,'gold')-gold_loot,resource_power=nova_private.resource_balance(enemy,'power')-power_loot,gold_delta=gold_delta-gold_loot,power_delta=power_delta-power_loot,resource_at=now(),crystals=available-amount$rep$, $rep$resource_gold=nova_private.resource_balance(enemy,'gold')-floor(nova_private.resource_balance(enemy,'gold')*.5*pct/100),resource_power=nova_private.resource_balance(enemy,'power')-floor(nova_private.resource_balance(enemy,'power')*.5*pct/100),gold_delta=gold_delta-floor(nova_private.resource_balance(enemy,'gold')*.5*pct/100),power_delta=power_delta-floor(nova_private.resource_balance(enemy,'power')*.5*pct/100),resource_at=now(),crystals=available-floor(available*.5*pct/100)$rep$);
 execute src;
 select pg_get_functiondef('nova_private.siege_finish(uuid)'::regprocedure) into src;
 if position('budgetc:=floor(d.crystals*.6*pct/100)' in src)=0 then raise exception 'Unexpected siege engine';end if;
 src:=replace(src,'*.6','*.5');
 src:=replace(src,'select count(*) into deflost', 'tc:=budgetc;tg:=budgetg;tp:=budgetp; select count(*) into deflost');
 src:=replace(src,$rep$shield_until=now()+interval '30 minutes'$rep$, $rep$shield_until=greatest(shield_until,now()+case when pct=100 then interval '4 hours' else interval '30 minutes' end)$rep$);
 src:=replace(src,$rep$update nova_private.sieges set finished_at=stop_at,result=results$rep$, $rep$for m in select * from nova_private.siege_members where room=rid loop results:=jsonb_set(results,array[m.owner::text,'nova255'],to_jsonb(coalesce((select nova255 from public.nova_war_reports where attacker=m.owner and request_id=rid),0)));end loop; update nova_private.sieges set finished_at=stop_at,result=results$rep$);
 execute src;
 select pg_get_functiondef('nova_private.live_finish(uuid)'::regprocedure) into src;
 src:=replace(src,'*.6','*.5');
 src:=replace(src,$rep$crystals=crystals-cl,resource_gold=nova_private.resource_balance(d,'gold')-gl,resource_power=nova_private.resource_balance(d,'power')-pl,gold_delta=gold_delta-gl,power_delta=power_delta-pl$rep$, $rep$crystals=crystals-floor(d.crystals*.5*pct/100),resource_gold=nova_private.resource_balance(d,'gold')-floor(nova_private.resource_balance(d,'gold')*.5*pct/100),resource_power=nova_private.resource_balance(d,'power')-floor(nova_private.resource_balance(d,'power')*.5*pct/100),gold_delta=gold_delta-floor(nova_private.resource_balance(d,'gold')*.5*pct/100),power_delta=power_delta-floor(nova_private.resource_balance(d,'power')*.5*pct/100)$rep$);
 src:=replace(src,$rep$shield_until=now()+interval '30 minutes'$rep$, $rep$shield_until=greatest(shield_until,now()+case when pct=100 then interval '4 hours' else interval '30 minutes' end)$rep$);
 src:=replace(src,$rep$update nova_private.live_battles set finished=true,result=outcome$rep$, $rep$outcome:=outcome||jsonb_build_object('nova255',coalesce((select nova255 from public.nova_war_reports where attacker=b.attacker and request_id=bid),0)); update nova_private.live_battles set finished=true,result=outcome$rep$);
 execute src;
 -- Gate actual entry points, including old clients, while allowing idempotent retry of joined rooms.
 select pg_get_functiondef('nova_private.siege_command_before_enhance(jsonb)'::regprocedure) into src;
 if position('if p.shield_until>now()' in src)=0 then raise exception 'Unexpected siege entry';end if;
 src:=replace(src,'if p.shield_until>now()', $rep$if not nova_private.match255(uid,tid) then raise exception 'ไม่พบคู่ต่อสู้นี้ กรุณาค้นหาใหม่';end if; if p.shield_until>now()$rep$);execute src;
 select pg_get_functiondef('nova_private.live_command_before_siege(jsonb)'::regprocedure) into src;
 src:=replace(src,'if p.shield_until>now()', $rep$if not nova_private.match255(uid,target_id) then raise exception 'ไม่พบคู่ต่อสู้นี้ กรุณาค้นหาใหม่';end if; if p.shield_until>now()$rep$);execute src;
end $$;
revoke all on function nova_private.hq255(jsonb),nova_private.match255(uuid,uuid),nova_private.raid_rate255(int,int),nova_private.raid_credit255() from public,anon,authenticated;
