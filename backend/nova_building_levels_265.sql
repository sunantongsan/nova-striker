-- Building levels 1..20. Preserve retired actions, auth, receipts and enhancement +10.
do $$
declare body text;
begin
 body:=pg_get_functiondef('nova_private.command_before_siege(text,jsonb)'::regprocedure);
 if position('^([1-9]|1[0-5])$' in body)=0 then raise exception 'Unexpected layout validator';end if;
 body:=replace(body,'^([1-9]|1[0-5])$','^([1-9]|1[0-9]|20)$');
 -- Three level-20 extractors, 2160/hour each, maximum +100% production path.
 body:=replace(body,'between 0 and 97200','between 0 and 259200');execute body;
 body:=pg_get_functiondef('nova_private.hq255(jsonb)'::regprocedure);
 if position('least(15,' in body)=0 then raise exception 'Unexpected HQ matcher';end if;
 execute replace(body,'least(15,','least(20,');
end $$;
