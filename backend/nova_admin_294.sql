-- Owner password gate, idempotent NOVA gifts and limited promotions.
alter table nova_private.admins293 add column password_hash294 text,add column failed294 integer not null default 0,add column blocked_until294 timestamptz;
create table nova_private.gifts294(id uuid primary key,actor uuid not null references auth.users(id),recipient uuid not null references auth.users(id),amount integer not null check(amount between 1 and 1000000),reason text not null check(char_length(reason) between 3 and 200),created_at timestamptz not null default now());
create index gifts294_recipient on nova_private.gifts294(recipient,created_at desc);
create table nova_private.promos294(id uuid primary key,title text not null check(char_length(title) between 3 and 100),amount integer not null check(amount between 1 and 1000000),starts_at timestamptz not null,ends_at timestamptz not null,limit_claims integer not null check(limit_claims between 1 and 1000000),claimed integer not null default 0,enabled boolean not null default true,actor uuid not null references auth.users(id),created_at timestamptz not null default now(),check(ends_at>starts_at));
create table nova_private.promo_claims294(promo uuid references nova_private.promos294(id),user_id uuid references auth.users(id),amount integer not null,created_at timestamptz not null default now(),primary key(promo,user_id));
create index promo_claims294_user on nova_private.promo_claims294(user_id);
alter table nova_private.gifts294 enable row level security;
alter table nova_private.promos294 enable row level security;
alter table nova_private.promo_claims294 enable row level security;
revoke all on nova_private.gifts294,nova_private.promos294,nova_private.promo_claims294 from public,anon,authenticated;
alter function nova_private.admin293(jsonb) rename to admin_before294;
revoke all on function nova_private.admin_before294(jsonb) from public,anon,authenticated;
create function nova_private.admin293(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid();mode text:=payload->>'admin293';a nova_private.admins293;pw text:=payload->>'password';p nova_private.promos294;g nova_private.gifts294;rid uuid;target uuid;amt integer;txt text;balance bigint;outcome jsonb;start_time timestamptz;end_time timestamptz;cap integer;
begin
 if uid is null or not exists(select 1 from auth.users where id=uid and not coalesce(is_anonymous,false)) then raise exception 'login_required';end if;
 if mode in ('presence','feedback') then return nova_private.admin_before294(payload);end if;
 if mode in ('offers','claim_offer') then
  if mode='claim_offer' then
   rid:=(payload->>'id')::uuid;select * into p from nova_private.promos294 where id=rid for update;
   if p.id is null then raise exception 'promo_unavailable';end if;
   if not exists(select 1 from nova_private.promo_claims294 where promo=rid and user_id=uid) then
    if not p.enabled or now()<p.starts_at or now()>=p.ends_at or p.claimed>=p.limit_claims then raise exception 'promo_unavailable';end if;
    insert into nova_private.test_wallets(user_id) values(uid) on conflict do nothing;
    update nova_private.test_wallets set gems=gems+p.amount where user_id=uid and gems::bigint+p.amount<=2147483647 returning gems into balance;
    if balance is null then raise exception 'wallet_limit';end if;
    insert into nova_private.promo_claims294(promo,user_id,amount) values(rid,uid,p.amount);
    update nova_private.promos294 set claimed=claimed+1 where id=rid;
   end if;
  end if;
  return jsonb_build_object('admin293',true,'claimed',mode='claim_offer','balance',(select gems from nova_private.test_wallets where user_id=uid),'offers',coalesce((select jsonb_agg(to_jsonb(x)) from(select offer.id,offer.title,offer.amount,offer.ends_at,offer.limit_claims-offer.claimed remaining,exists(select 1 from nova_private.promo_claims294 c where c.promo=offer.id and c.user_id=uid) received from nova_private.promos294 offer where enabled and now()>=starts_at and now()<ends_at order by created_at desc limit 50)x),'[]'::jsonb));
 end if;
 -- Both the private allowlist and verified owner email are mandatory.
 if not exists(select 1 from auth.users where id=uid and lower(email)='sunan.tongsan@gmail.com' and email_confirmed_at is not null) then raise exception 'admin_required';end if;
 select * into a from nova_private.admins293 where user_id=uid for update;
 if a.user_id is null then raise exception 'admin_required';end if;
 if mode='gate' then return jsonb_build_object('admin293',true,'setup_required',a.password_hash294 is null);end if;
 if mode<>'setup' and pw is null then raise exception 'password_required';end if;
 if a.blocked_until294>now() then return jsonb_build_object('admin293',true,'error','password_locked');end if;
 if mode='setup' then
  if a.password_hash294 is not null then return jsonb_build_object('admin293',true,'error','password_already_set');end if;
  if pw is null or char_length(pw)<12 or octet_length(pw)>72 then return jsonb_build_object('admin293',true,'error','password_length');end if;
  update nova_private.admins293 set password_hash294=extensions.crypt(pw,extensions.gen_salt('bf',12)),failed294=0,blocked_until294=null where user_id=uid;
  insert into nova_private.admin_audit293(actor,action,after_value) values(uid,'password_setup','{"configured":true}');
 elsif a.password_hash294 is null then return jsonb_build_object('admin293',true,'error','password_setup_required');
 elsif pw is null or octet_length(pw)>72 or extensions.crypt(pw,a.password_hash294)<>a.password_hash294 then
  update nova_private.admins293 set failed294=case when failed294>=4 then 0 else failed294+1 end,blocked_until294=case when failed294>=4 then now()+interval '5 minutes' else null end where user_id=uid;
  return jsonb_build_object('admin293',true,'error','password_incorrect');
 else update nova_private.admins293 set failed294=0,blocked_until294=null where user_id=uid;
 end if;
 if mode='gift' then
  rid:=(payload->>'id')::uuid;target:=(payload->>'recipient')::uuid;amt:=(payload->>'amount')::integer;txt:=btrim(payload->>'reason');
  if rid is null or amt is null or amt not between 1 and 1000000 or txt is null or char_length(txt) not between 3 and 200 then raise exception 'invalid_gift';end if;
  if not exists(select 1 from public.nova_war_players where user_id=target union all select 1 from nova_private.presence293 where user_id=target union all select 1 from nova_private.test_wallets where user_id=target union all select 1 from nova_private.base_names224 where user_id=target union all select 1 from public.nova_rts_saves where user_id=target union all select 1 from nova_private.miners251 where owner=target) then raise exception 'player_missing';end if;
  select * into g from nova_private.gifts294 where id=rid;
  if g.id is not null then
   if g.actor<>uid or g.recipient<>target or g.amount<>amt or g.reason<>txt then raise exception 'request_conflict';end if;
  else
   insert into nova_private.test_wallets(user_id) values(target) on conflict do nothing;
   update nova_private.test_wallets set gems=gems+amt where user_id=target and gems::bigint+amt<=2147483647 returning gems into balance;
   if balance is null then raise exception 'wallet_limit';end if;
   insert into nova_private.gifts294(id,actor,recipient,amount,reason) values(rid,uid,target,amt,txt);
   insert into nova_private.admin_audit293(actor,action,after_value) values(uid,'nova_gift',jsonb_build_object('id',rid,'recipient',target,'amount',amt,'reason',txt));
  end if;
 elsif mode='create_promo' then
  rid:=(payload->>'id')::uuid;amt:=(payload->>'amount')::integer;txt:=btrim(payload->>'title');start_time:=(payload->>'starts_at')::timestamptz;end_time:=(payload->>'ends_at')::timestamptz;cap:=(payload->>'limit_claims')::integer;
  if rid is null or amt is null or amt not between 1 and 1000000 or txt is null or char_length(txt) not between 3 and 100 or start_time is null or end_time is null or end_time<=greatest(start_time,now()) or end_time>start_time+interval '90 days' or cap is null or cap not between 1 and 1000000 then raise exception 'invalid_promo';end if;
  select * into p from nova_private.promos294 where id=rid;
  if p.id is not null then
   if p.actor<>uid or p.title<>txt or p.amount<>amt or p.starts_at<>start_time or p.ends_at<>end_time or p.limit_claims<>cap then raise exception 'request_conflict';end if;
  else
   insert into nova_private.promos294(id,title,amount,starts_at,ends_at,limit_claims,actor) values(rid,txt,amt,start_time,end_time,cap,uid);
   insert into nova_private.admin_audit293(actor,action,after_value) values(uid,'create_promo',jsonb_build_object('id',rid,'title',txt,'amount',amt,'limit_claims',cap,'starts_at',start_time,'ends_at',end_time));
  end if;
 elsif mode='toggle_promo' then
  if jsonb_typeof(payload->'enabled') is distinct from 'boolean' then raise exception 'invalid_promo';end if;
  update nova_private.promos294 set enabled=(payload->>'enabled')::boolean where id=(payload->>'id')::uuid returning * into p;
  if p.id is null then raise exception 'promo_unavailable';end if;
  insert into nova_private.admin_audit293(actor,action,after_value) values(uid,'toggle_promo',jsonb_build_object('id',p.id,'enabled',p.enabled));
 elsif mode not in ('setup','unlock','dashboard','settings','feedback_status') then raise exception 'invalid_admin_action';end if;
 outcome:=nova_private.admin_before294((payload-'password')||jsonb_build_object('admin293',case when mode in ('settings','feedback_status') then mode else 'dashboard' end));
 return outcome||jsonb_build_object('players',coalesce((with players as (select user_id from public.nova_war_players union select user_id from public.nova_rts_saves union select user_id from nova_private.base_names224 union select user_id from nova_private.test_wallets union select owner from nova_private.miners251 union select user_id from nova_private.presence293) select jsonb_agg(to_jsonb(x)) from(select u.user_id,coalesce(b.name,w.callsign,'—') name,coalesce(t.gems,0) nova from players u left join nova_private.base_names224 b on b.user_id=u.user_id left join public.nova_war_players w on w.user_id=u.user_id left join nova_private.test_wallets t on t.user_id=u.user_id where coalesce(b.name,w.callsign,'') ilike '%'||left(coalesce(payload->>'search',''),80)||'%' or u.user_id::text=payload->>'search' order by u.user_id limit 100)x),'[]'::jsonb),'promos',coalesce((select jsonb_agg(to_jsonb(x)) from(select id,title,amount,starts_at,ends_at,limit_claims,claimed,enabled from nova_private.promos294 order by created_at desc limit 50)x),'[]'::jsonb));
end $$;
revoke all on function nova_private.admin293(jsonb) from public,anon,authenticated;
