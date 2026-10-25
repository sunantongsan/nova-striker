-- Retire new enhancement purchases. Paid receipts and existing bonuses remain intact.
do $retire359$
declare body text;
begin
 body:=pg_get_functiondef('nova_private.command_before_timers225(text,jsonb)'::regprocedure);
 if position('if r is null then' in body)=0 or position('wallet_gems' in body)=0 then raise exception 'Enhancement handler changed';end if;
 body:=replace(body,'if r is null then',$guard$if r is null then
   raise exception 'กรุณาอัปเดตเกม ระบบตีบวกยกเลิกแล้ว โบนัสเดิมยังอยู่';$guard$);
 execute body;
end $retire359$;
