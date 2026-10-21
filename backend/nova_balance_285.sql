-- Symmetric NOVA enhancement prices: level n costs 50*n*(n+1).
-- Keep old receipts and in-flight jobs exactly as paid; only new quoted purchases change.
do $balance285$
declare src text;old_price text:='cost:=100*(lev+1)*(lev+1);';new_price text:='cost:=50*(lev+1)*(lev+2);';
begin
 src:=pg_get_functiondef('nova_private.command_before_timers225(text,jsonb)'::regprocedure);
 if position(new_price in src)>0 then return;end if;
 if position(old_price in src)=0 then raise exception 'Unexpected enhancement price function';end if;
 execute replace(src,old_price,new_price);
end $balance285$;
