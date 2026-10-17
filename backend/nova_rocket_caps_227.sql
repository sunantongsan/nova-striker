-- Expand only the existing formation validator. CREATE OR REPLACE preserves its ACL.
-- Existing player layouts, receipts, balances and timer functions are untouched.
do $migration$
declare src text; anchor text:='   if (select count(*) from jsonb_array_elements(v_layout) b where b->>''type''=''hq'')<>1';
begin
 select pg_get_functiondef('nova_private.command_before_siege(text,jsonb)'::regprocedure) into src;
 if position('-- rocket_caps227' in src)>0 then return; end if;
 if position(anchor in src)=0 or position('"missileturret":1' in src)=0 then raise exception 'Unexpected formation validator; inspect before updating'; end if;
 src:=replace(src,'"missileturret":1','"missileturret":4');
 src:=replace(src,anchor,$body$   -- rocket_caps227: HQ levels 1 / 5 / 10 / 15 unlock 1 / 2 / 3 / 4 batteries.
   caps:=jsonb_set(caps,'{missileturret}',to_jsonb((select case when coalesce(max((b->>'lv')::integer),1)>=15 then 4 when coalesce(max((b->>'lv')::integer),1)>=10 then 3 when coalesce(max((b->>'lv')::integer),1)>=5 then 2 else 1 end from jsonb_array_elements(v_layout) b where b->>'type'='hq')));
$body$||anchor);
 execute src;
end $migration$;
