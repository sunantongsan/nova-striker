-- 391: paid environments (ocean / sky) allow a 26x26 base grid.
-- Layout cells 21..26 are accepted only for accounts that unlocked a paid environment.
-- Siege landing bounds follow the target layout extent (unchanged 0..21 for 20x20 bases).
do $migration$
declare d text; n text;
begin
 d:=pg_get_functiondef('nova_private.command_before_siege(text,jsonb)'::regprocedure);
 n:=replace(d,
  $a$coalesce(v_item->>'x','') !~ '^([1-9]|1[0-9]|20)$' or coalesce(v_item->>'y','') !~ '^([1-9]|1[0-9]|20)$'$a$,
  $b$coalesce(v_item->>'x','') !~ '^([1-9]|1[0-9]|2[0-6])$' or coalesce(v_item->>'y','') !~ '^([1-9]|1[0-9]|2[0-6])$' or (((v_item->>'x')::int>20 or (v_item->>'y')::int>20) and not exists(select 1 from nova_private.themes383 t391 where t391.owner=uid and t391.unlocked_at is not null))$b$);
 if n=d then raise exception 'grid391: layout rule not found'; end if;
 execute n;

 d:=pg_get_functiondef('nova_private.siege_command_before_enhance(jsonb)'::regprocedure);
 n:=replace(d,'xx not between 0 and 21 or yy not between 0 and 21',
  $c$xx not between 0 and greatest(21,(select max(greatest((b391->>'x')::numeric,(b391->>'y')::numeric))+1 from jsonb_array_elements(s.target->'layout') b391)) or yy not between 0 and greatest(21,(select max(greatest((b391->>'x')::numeric,(b391->>'y')::numeric))+1 from jsonb_array_elements(s.target->'layout') b391))$c$);
 if n=d then raise exception 'grid391: deploy bounds not found'; end if;
 execute n;

 d:=pg_get_functiondef('nova_private.siege_command_before_titan342(jsonb)'::regprocedure);
 n:=replace(d,'xx not between 0 and 21 or yy not between 0 and 21',
  $c$xx not between 0 and greatest(21,(select max(greatest((b391->>'x')::numeric,(b391->>'y')::numeric))+1 from jsonb_array_elements(s.target->'layout') b391)) or yy not between 0 and greatest(21,(select max(greatest((b391->>'x')::numeric,(b391->>'y')::numeric))+1 from jsonb_array_elements(s.target->'layout') b391))$c$);
 if n=d then raise exception 'grid391: landing bounds not found'; end if;
 execute n;
end
$migration$;
