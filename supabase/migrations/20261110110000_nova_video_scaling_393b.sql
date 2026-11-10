-- 393b: video prices follow value. Mech skill level n+1 needs 5*(n+1) videos (5/10/15/20/25).
-- Base environments need four verified videos instead of two (50 NOVA unchanged); owned themes stay owned.
do $migration$
declare body text;
begin
 body:=pg_get_functiondef('nova_private.titan_command_before347(jsonb)'::regprocedure);
 if strpos(body,'if countn>=5 and lv<5 then')=0 then raise exception 'titan skill video drift';end if;
 execute replace(body,'if countn>=5 and lv<5 then','if countn>=5*(lv+1) and lv<5 then');
 alter table nova_private.themes383 drop constraint if exists themes383_videos_check;
 alter table nova_private.themes383 add constraint themes383_videos_check check(videos between 0 and 4);
 body:=pg_get_functiondef('nova_private.themes_command383(jsonb)'::regprocedure);
 if strpos(body,'videos=least(2,videos+1),unlocked_at=case when videos>=1 then')=0 then raise exception 'theme video drift';end if;
 execute replace(body,'videos=least(2,videos+1),unlocked_at=case when videos>=1 then','videos=least(4,videos+1),unlocked_at=case when videos>=3 then');
end $migration$;
