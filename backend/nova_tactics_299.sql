-- Extend the existing authenticated, idempotent command channel; no new public API.
do $migration$
declare def text;needle text:='   elsif act=''unload'' then';
begin
 def:=pg_get_functiondef('nova_private.siege_command(jsonb)'::regprocedure);
 if position('tactics299' in def)>0 then return;end if;
 if position(needle in def)=0 or position('act:=payload->>''action'';meta:=' in def)=0 then raise exception 'Unexpected siege command definition';end if;
 def:=replace(def,'act:=payload->>''action'';meta:=','act:=payload->>''action'';meta:=');
 -- Preserve the old request signature for all existing actions.
 def:=replace(def,'  select * into s from nova_private.sieges where id=rid;', '  if act=''tactics299'' then meta:=meta||jsonb_build_object(''units'',payload->''units'');end if;'||chr(10)||'  select * into s from nova_private.sieges where id=rid;');
 def:=replace(def,needle,$branch$
   elsif act='tactics299' then
    xx:=(payload->>'x')::numeric;yy:=(payload->>'y')::numeric;
    if xx is null or yy is null or xx not between 0 and 21 or yy not between 0 and 21 then raise exception 'จุดสั่งการไม่ถูกต้อง';end if;
    if jsonb_typeof(payload->'units') is distinct from 'array' then raise exception 'กรุณาเลือกกำลังพล';end if;
    if jsonb_array_length(payload->'units') not between 1 and 150 then raise exception 'จำนวนหน่วยไม่ถูกต้อง';end if;
    if exists(select 1 from jsonb_array_elements_text(payload->'units') z(v) where v !~ '^[0-9]{1,18}$') then raise exception 'รหัสหน่วยไม่ถูกต้อง';end if;
    if exists(select 1 from jsonb_array_elements_text(payload->'units') z(v) where not exists(select 1 from nova_private.siege_orders so where so.id=v::bigint and so.room=rid and so.owner=uid and not so.cancelled262)) then raise exception 'สั่งได้เฉพาะกำลังพลของตนเอง';end if;
    if payload->>'target' is not null and not exists(select 1 from jsonb_array_elements(s.target->'layout') with ordinality z(v,n) where n-1=(payload->>'target')::int) then raise exception 'เป้าหมายไม่ถูกต้อง';end if;
   elsif act='unload' then
$branch$);
 execute def;
end $migration$;
