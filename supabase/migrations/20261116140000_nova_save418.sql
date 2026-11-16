-- 418: bases can never be lost to an update, reinstall or new phone.
-- 1) saves418: the whole local save of each signed-in player, copied every few minutes. A copy with a lower Command
--    Center never replaces a higher one (HQ levels never go down in play), so a reset phone cannot wipe the backup.
-- 2) layout_history418 + guard: the published base layout can no longer shrink to a lower Command Center, and every
--    earlier layout is kept (last 30 per player).
-- 3) 'get' returns the full copy, or the best published layout (live or the 412 backup) for accounts without one.

create table if not exists nova_private.saves418(
 user_id uuid primary key references auth.users(id) on delete cascade,
 save jsonb not null check (jsonb_typeof(save)='object' and octet_length(save::text)<=40000),
 hq int not null, building_count int not null, score int not null,
 saved_at timestamptz not null default now());
alter table nova_private.saves418 enable row level security;
revoke all on nova_private.saves418 from public, anon, authenticated;

create table if not exists nova_private.save_history418(
 id bigserial primary key, user_id uuid not null references auth.users(id) on delete cascade,
 save jsonb not null, hq int not null, saved_at timestamptz not null default now());
create index if not exists save_history418_user on nova_private.save_history418(user_id, id desc);
alter table nova_private.save_history418 enable row level security;
revoke all on nova_private.save_history418 from public, anon, authenticated;

create table if not exists nova_private.layout_history418(
 id bigserial primary key, user_id uuid not null, layout jsonb not null, hq int not null, replaced_at timestamptz not null default now());
create index if not exists layout_history418_user on nova_private.layout_history418(user_id, id desc);
alter table nova_private.layout_history418 enable row level security;
revoke all on nova_private.layout_history418 from public, anon, authenticated;

alter table nova_private.layout_backup412 enable row level security;

create or replace function nova_private.layout_guard418() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if OLD.layout is not null and NEW.layout is distinct from OLD.layout then
  if nova_private.hq255(NEW.layout) < nova_private.hq255(OLD.layout) then
   raise exception 'ฐานบนเซิร์ฟเวอร์มีศูนย์บัญชาการสูงกว่า ปิดแล้วเปิดเกมใหม่เพื่อกู้คืนฐาน';
  end if;
  insert into nova_private.layout_history418(user_id,layout,hq) values(OLD.user_id,OLD.layout,nova_private.hq255(OLD.layout));
  delete from nova_private.layout_history418 where user_id=OLD.user_id and id not in
   (select id from nova_private.layout_history418 where user_id=OLD.user_id order by id desc limit 30);
 end if;
 return NEW;
end $$;
drop trigger if exists layout_guard418 on public.nova_war_players;
create trigger layout_guard418 before update of layout on public.nova_war_players
 for each row execute function nova_private.layout_guard418();

create or replace function nova_private.save418(payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); mode text:=payload->>'save418'; s jsonb; v_hq int; cur record; live record; bak record;
begin
 if me is null then raise exception 'not signed in'; end if;
 if mode='put' then
  s:=payload->'save';
  if jsonb_typeof(s)<>'object' or s->>'version' is distinct from '1' or jsonb_typeof(s->'buildings')<>'array'
     or jsonb_array_length(s->'buildings')<1 or jsonb_array_length(s->'buildings')>400 or octet_length(s::text)>40000 then
   return jsonb_build_object('save418',jsonb_build_object('stored',false,'reason','invalid'));
  end if;
  v_hq:=nova_private.hq255(s->'buildings');
  select * into cur from nova_private.saves418 where user_id=me for update;
  if found and v_hq<cur.hq then
   return jsonb_build_object('save418',jsonb_build_object('stored',false,'reason','smaller','hq',cur.hq));
  end if;
  if found and (cur.hq<>v_hq or cur.saved_at<now()-interval '6 hours') then
   insert into nova_private.save_history418(user_id,save,hq) values(me,cur.save,cur.hq);
   delete from nova_private.save_history418 where user_id=me and id not in
    (select id from nova_private.save_history418 where user_id=me order by id desc limit 20);
  end if;
  insert into nova_private.saves418(user_id,save,hq,building_count,score,saved_at)
   values(me,s,v_hq,jsonb_array_length(s->'buildings'),coalesce((payload->>'score')::int,0),now())
   on conflict(user_id) do update set save=excluded.save,hq=excluded.hq,building_count=excluded.building_count,score=excluded.score,saved_at=now();
  return jsonb_build_object('save418',jsonb_build_object('stored',true,'hq',v_hq));
 end if;
 if mode='get' then
  select * into cur from nova_private.saves418 where user_id=me;
  select layout,resource_gold,resource_power into live from public.nova_war_players where user_id=me;
  select layout,resource_gold,resource_power into bak from nova_private.layout_backup412 where user_id=me;
  -- best published layout: the higher Command Center, then the bigger base
  if live.layout is not null and (bak.layout is null or nova_private.hq255(live.layout)>nova_private.hq255(bak.layout)
     or (nova_private.hq255(live.layout)=nova_private.hq255(bak.layout) and jsonb_array_length(live.layout)>=jsonb_array_length(bak.layout))) then
   bak:=live;
  end if;
  return jsonb_build_object('save418',jsonb_build_object(
   'save',case when cur.user_id is not null then cur.save end,
   'saved_at',cur.saved_at,
   'layout',bak.layout,'layout_hq',case when bak.layout is not null then nova_private.hq255(bak.layout) else 0 end,'gold',bak.resource_gold,'power',bak.resource_power,
   'hq',greatest(coalesce(cur.hq,0),case when bak.layout is not null then nova_private.hq255(bak.layout) else 0 end)));
 end if;
 raise exception 'คำสั่งสำรองฐานไม่ถูกต้อง';
end $$;
revoke all on function nova_private.save418(jsonb) from public, anon;
grant execute on function nova_private.save418(jsonb) to authenticated;

create or replace function public.nova_test_command(action text, payload jsonb default '{}'::jsonb) returns jsonb
language plpgsql set search_path='' as $$
begin
 if payload ? 'save418' then return nova_private.save418(payload); end if;
 return nova_private.test_command(action,payload);
end $$;
