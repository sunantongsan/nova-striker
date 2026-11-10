-- 393: paying with NOVA beats watching videos.
-- * NOVA speed-ups cost 20% less (multiplier .9 -> .72), mirrored by novaSpeedPrice365 in economy393.js.
-- * Resources bought with NOVA cost 20% less.
-- * Mech skill and mech upgrade videos are limited to 10 per Thai calendar day; NOVA has no limit.
begin;
do $migration$
declare body text;
begin
 body:=pg_get_functiondef('nova_private.speed_price365(numeric)'::regprocedure);
 if strpos(body,'ceil(floor(gems)*.9)')=0 then raise exception 'speed_price365 drift';end if;
 execute replace(body,'ceil(floor(gems)*.9)','ceil(floor(gems)*.72)');
 body:=pg_get_functiondef('nova_private.resource_quote233(public.nova_war_players,text,bigint)'::regprocedure);
 if strpos(body,$o$'cost',nova_private.boost_price245(seconds,used,kind='crystals')$o$)=0 then raise exception 'resource_quote233 drift';end if;
 execute replace(body,$o$'cost',nova_private.boost_price245(seconds,used,kind='crystals')$o$,$n$'cost',ceil(nova_private.boost_price245(seconds,used,kind='crystals')*.8)::int,'nova_discount393',20$n$);
 body:=pg_get_functiondef('nova_private.titan_command342(jsonb)'::regprocedure);
 if strpos(body,'result:=nova_private.titan_command_before347(payload);')=0 then raise exception 'titan_command342 drift';end if;
 execute replace(body,'result:=nova_private.titan_command_before347(payload);',
 $n$if uid is not null and payload->>'titan342'='prepare' and (payload->>'target' like 'skill:%' or payload->>'target'='upgrade')
  and not exists(select 1 from nova_private.titan_receipts342 where owner=uid and id::text=payload->>'request_id')
  and (select count(*) from nova_private.titan_receipts342 where owner=uid and (target like 'skill:%' or target='upgrade')
       and created_at>=(date_trunc('day',now() at time zone 'Asia/Bangkok') at time zone 'Asia/Bangkok')
       and (claimed_at is not null or created_at>now()-interval '30 minutes'))>=10 then
  raise exception 'วันนี้ดูวิดีโอสกิล/อัปเกรดหุ่นครบ 10 ครั้งแล้ว ใช้ NOVA ได้ทันที หรือรอพรุ่งนี้';
 end if;
 result:=nova_private.titan_command_before347(payload);$n$);
end $migration$;
commit;
