-- Candidate migration. Apply atomically only with the matching client release.
begin;
create or replace function nova_private.speed_price365(seconds numeric) returns integer
language plpgsql immutable set search_path='' as $$
declare gems numeric;
begin
 if seconds is null or seconds::text in ('NaN','Infinity','-Infinity') then raise exception 'Invalid remaining time';end if;
 if seconds<=0 then return 0;end if;
 gems:=case when seconds<=60 then 1 when seconds<=3600 then 1+(seconds-60)*19/3540 when seconds<=86400 then 20+(seconds-3600)*240/82800 else 260+(seconds-86400)*740/518400 end;
 return greatest(1,ceil(floor(gems)*.9))::integer;
end $$;
revoke all on function nova_private.speed_price365(numeric) from public,anon,authenticated;
do $migration$
declare body text; old text;
begin
 body:=pg_get_functiondef('nova_private.command_before_admob230(text,jsonb)'::regprocedure);
 old:='ceil(extract(epoch from(j.finishes_at-now()))/10)';
 if strpos(body,old)=0 or strpos(body,'(array[25,100,500,1500])[cnt]')=0 then raise exception 'Support economy drift: inspect before applying';end if;
 body:=replace(body,old,'nova_private.speed_price365(extract(epoch from(j.finishes_at-now())))');
 body:=replace(body,'(array[25,100,500,1500])[cnt]','(array[225,450,900,1800])[cnt]');
 execute body;
 body:=pg_get_functiondef('nova_private.titan_state_before347(uuid)'::regprocedure);
 old:='ceil(greatest(0,extract(epoch from(finishes_at-now())))/10)';
 if strpos(body,old)=0 then raise exception 'Titan quote drift';end if;
 execute replace(body,old,'nova_private.speed_price365(extract(epoch from(finishes_at-now())))');
 body:=pg_get_functiondef('nova_private.titan_command_before347(jsonb)'::regprocedure);
 old:='ceil(extract(epoch from(s.finishes_at-now()))/10)';
 if strpos(body,old)=0 then raise exception 'Titan debit drift';end if;
 execute replace(body,old,'nova_private.speed_price365(extract(epoch from(s.finishes_at-now())))');
end $migration$;
commit;
