create or replace function nova_private.base_name_command224(payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); v_name text; saved text;
begin
 if uid is null then raise exception 'กรุณาเข้าสู่ระบบ'; end if;
 if payload->>'profile' not in ('status','claim','rename') or payload->>'profile' is null then raise exception 'คำสั่งชื่อฐานไม่ถูกต้อง';end if;
 -- Same lock as the existing PvP command keeps enrollment/name synchronization atomic.
 perform pg_advisory_xact_lock(153014,1);
 select name into saved from nova_private.base_names224 where user_id=uid;
 if (payload->>'profile'='claim' and saved is null) or payload->>'profile'='rename' then
  v_name:=normalize(btrim(regexp_replace(payload->>'name','[[:space:]]+',' ','g')),NFC);
  if v_name is null or char_length(v_name) not between 1 and 40 or char_length(nova_private.base_name_key224(v_name))=0
   or v_name ~ '[[:cntrl:]<>]' or v_name ~ U&'[\202A-\202E\2066-\2069]' then
   raise exception 'กรุณาตั้งชื่อ 1–40 ตัวอักษร ไม่ใช้สัญลักษณ์ควบคุมหรือ < >';
  end if;
  begin
   insert into nova_private.base_names224(user_id,name) values(uid,v_name) on conflict (user_id) do update set name=excluded.name returning name into saved;
  exception when unique_violation then raise exception 'ชื่อนี้มีผู้ใช้แล้ว กรุณาเลือกชื่ออื่น';end;
  update public.nova_war_players set callsign=saved where user_id=uid;
 end if;
 return jsonb_build_object('profile',true,'owner',uid,'name',saved);
end $$;
revoke all on function nova_private.base_name_command224(jsonb) from public,anon,authenticated;
grant execute on function nova_private.base_name_command224(jsonb) to authenticated;

