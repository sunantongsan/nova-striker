-- Update the established support command in place; keep ACL, owner checks and receipts.
do $migration$
declare body text;old_expression text:='ceil(extract(epoch from(j.finishes_at-now()))/30)';
begin
 body:=pg_get_functiondef('nova_private.command(text,jsonb)'::regprocedure);
 if strpos(body,old_expression)=0 or strpos(body,'support228')=0 then
  raise exception 'Unexpected support command; inspect before applying economy 229';
 end if;
 execute replace(body,old_expression,'ceil(extract(epoch from(j.finishes_at-now()))/120)');
end
$migration$;
