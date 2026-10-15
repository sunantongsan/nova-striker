-- Cancel new crystal-to-gem requests, but retain committed receipts for recovery.
do $$ declare src text;begin
 select pg_get_functiondef('nova_private.command_before_siege(text,jsonb)'::regprocedure) into src;
 if position('price:=amount*10000;receipt:=receipt||jsonb_build_object(''gems'',amount);' in src)=0 then raise exception 'Reverse exchange implementation changed';end if;
 src:=replace(src,'price:=amount*10000;receipt:=receipt||jsonb_build_object(''gems'',amount);','price:=0;receipt:=receipt||jsonb_build_object(''cancelled'',true);');execute src;
end $$;
