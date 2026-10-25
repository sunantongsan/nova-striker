-- Expand both store limits and snapshot capacity without minting resources.
do $migration$
declare body text;
begin
 body:=pg_get_functiondef('nova_private.command_before_siege(text,jsonb)'::regprocedure);
 if position('"goldstore":2' in body)=0 or position('between 50000 and 10000000' in body)=0 then raise exception 'Economy schema changed';end if;
 body:=replace(replace(body,'"goldstore":2','"goldstore":4'),'"powerstore":2','"powerstore":4');
 body:=replace(body,'between 50000 and 10000000','between 50000 and 20000000');
 -- Four extra stores must fit alongside the pre-existing maximum layout.
 body:=replace(body,'jsonb_array_length(v_layout)>160','jsonb_array_length(v_layout)>164');
 execute body;
 body:=pg_get_functiondef('nova_private.titan_command_before347(jsonb)'::regprocedure);
 if position('price:=case s.level when 1 then 2500 else 10000 end;' in body)=0 then raise exception 'Mech upgrade definition changed';end if;
 body:=replace(body,'price:=case s.level when 1 then 2500 else 10000 end;', $new$
     g:=ceil((case s.level when 1 then 5000000 else 10000000 end)::numeric * greatest(0,1-coalesce((s.ads->>'upgrade')::numeric,0)/(case s.level when 1 then 50 else 200 end)));e:=g;
     if (payload->>'upgrade_level358')::int is distinct from s.level or (payload->>'resource_cost358')::bigint is distinct from g then raise exception 'ราคาเปลี่ยน กรุณาเปิดหน้าอัปเกรดใหม่';end if;
     if p.resource_gold<g or p.resource_power<e then raise exception 'ทองหรือพลังงานไม่พอ';end if;
     update public.nova_war_players set resource_gold=resource_gold-g,resource_power=resource_power-e,gold_delta=gold_delta-g,power_delta=power_delta-e where user_id=uid;
     price:=0;
 $new$);
 -- Honor previously prepared videos, but do not offer new upgrade-principal ads.
 body:=replace(body,$old$if receipt.id is null then
     if s.last_ad$old$, $new$if receipt.id is null then
     if target='upgrade' then raise exception 'อัปเกรดด้วยทองและพลังงาน';end if;
     if s.last_ad$new$);
 execute body;
end $migration$;
