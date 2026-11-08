-- Permanent cosmetic ownership is account-scoped. Each video is signed AdMob SSV.
create table nova_private.themes383(
 owner uuid not null references auth.users(id) on delete cascade,
 theme text not null check(theme in('ocean','sky')),
 videos integer not null default 0 check(videos between 0 and 2),
 unlocked_at timestamptz,
 primary key(owner,theme)
);
create table nova_private.theme_receipts383(
 owner uuid not null references auth.users(id) on delete cascade,
 id uuid not null,theme text not null check(theme in('ocean','sky')),
 kind text not null check(kind in('buy','ad')),
 cost integer not null default 0 check(cost in(0,50)),
 created_at timestamptz not null default now(),
 finished_at timestamptz,cancelled boolean not null default false,
 primary key(owner,id)
);
alter table nova_private.themes383 enable row level security;
alter table nova_private.theme_receipts383 enable row level security;
revoke all on nova_private.themes383,nova_private.theme_receipts383 from public,anon,authenticated;
create function nova_private.themes_command383(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'theme383';choice text:=payload->>'theme';rid uuid; r nova_private.theme_receipts383;v record; state jsonb;receipt jsonb;owned boolean;
begin
 if uid is null or payload->>'owner' is distinct from uid::text or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'Sign in required';end if;
 if mode is null or mode not in('status','buy','cancel','prepare','claim') then raise exception 'Invalid theme action';end if;
 if mode<>'status' and (choice is null or choice not in('ocean','sky')) then raise exception 'Invalid theme';end if;
 perform pg_advisory_xact_lock(153014,1);
 insert into nova_private.themes383(owner,theme) values(uid,'ocean'),(uid,'sky') on conflict do nothing;
 -- Recover verified videos even after reinstall or a lost client callback.
 for v in select t.id,t.theme from nova_private.theme_receipts383 t join nova_private.admob_intents230 a on a.owner=t.owner and a.id=t.id where t.owner=uid and t.kind='ad' and t.finished_at is null and not t.cancelled and a.verified_at is not null and not a.cancelled and a.claimed_at is null for update of t,a loop
  update nova_private.theme_receipts383 set finished_at=now() where owner=uid and id=v.id;
  update nova_private.admob_intents230 set claimed_at=now(),granted=0 where owner=uid and id=v.id;
  update nova_private.themes383 set videos=least(2,videos+1),unlocked_at=case when videos>=1 then coalesce(unlocked_at,now()) else unlocked_at end where owner=uid and theme=v.theme;
 end loop;
 if payload ? 'request_id' then rid:=(payload->>'request_id')::uuid;end if;
 if mode<>'status' and rid is null then raise exception 'Missing receipt';end if;
 if rid is not null then
  select * into r from nova_private.theme_receipts383 where owner=uid and id=rid for update;
  if r.id is not null and (r.theme is distinct from choice or (mode in('buy','cancel') and r.kind<>'buy') or (mode in('prepare','claim') and r.kind<>'ad')) then raise exception 'Receipt mismatch';end if;
 end if;
 select unlocked_at is not null into owned from nova_private.themes383 where owner=uid and theme=choice;
 if mode in('buy','cancel') and r.id is null then
  insert into nova_private.theme_receipts383(owner,id,theme,kind,finished_at,cancelled) values(uid,rid,choice,'buy',now(),mode='cancel') returning * into r;
  if mode='buy' and not owned then
   update nova_private.test_wallets set gems=gems-50 where user_id=uid and gems>=50;
   if found then
    update nova_private.themes383 set unlocked_at=now() where owner=uid and theme=choice;
    update nova_private.theme_receipts383 set cost=50 where owner=uid and id=rid returning * into r;
   else update nova_private.theme_receipts383 set cancelled=true where owner=uid and id=rid returning * into r;
   end if;
  end if;
 elsif mode='prepare' and r.id is null and not owned then
  if not exists(select 1 from nova_private.admob_settings230 where enabled) then raise exception 'Ads are not available yet';end if;
  -- Reuse a live reservation across devices; never let two concurrent requests count twice.
  select t.* into r from nova_private.theme_receipts383 t join nova_private.admob_intents230 a on a.owner=t.owner and a.id=t.id where t.owner=uid and t.theme=choice and t.kind='ad' and t.finished_at is null and not t.cancelled and not a.cancelled and a.expires_at>now() order by t.created_at desc limit 1;
  if r.id is null then
   insert into nova_private.admob_intents230(owner,id,kind,amount) values(uid,rid,'timer',0);
   insert into nova_private.theme_receipts383(owner,id,theme,kind) values(uid,rid,choice,'ad') returning * into r;
  end if;
 elsif mode='claim' and r.id is null then raise exception 'Receipt not found';
 end if;
 select jsonb_object_agg(theme,jsonb_build_object('unlocked',unlocked_at is not null,'videos',videos)) into state from nova_private.themes383 where owner=uid;
 if r.id is not null then receipt:=jsonb_build_object('id',r.id,'theme',r.theme,'kind',r.kind,'cost',r.cost,'finished',r.finished_at is not null,'cancelled',r.cancelled,'verified',exists(select 1 from nova_private.admob_intents230 a where a.owner=uid and a.id=r.id and a.verified_at is not null and not a.cancelled),'expires_at',(select expires_at from nova_private.admob_intents230 where owner=uid and id=r.id));end if;
 return jsonb_build_object('theme383',true,'owner',uid,'themes',state,'available',exists(select 1 from nova_private.admob_settings230 where enabled),'receipt',receipt);
end $$;
revoke all on function nova_private.themes_command383(jsonb) from public,anon,authenticated;
alter function nova_private.test_command(text,jsonb) rename to test_command_before383;
create function nova_private.test_command(action text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if payload ? 'theme383' then
  if action not in('test_status','test_claim') then raise exception 'Invalid theme transport';end if;
  return nova_private.themes_command383(payload);
 end if;
 return nova_private.test_command_before383(action,payload);
end $$;
revoke all on function nova_private.test_command(text,jsonb) from public,anon,authenticated;
