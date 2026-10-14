-- Offline campaign backups only. Never use this client-writable payload as a paid wallet.
create table public.nova_rts_saves (
 user_id uuid primary key references auth.users(id) on delete cascade,
 revision bigint not null default 1 check (revision > 0),
 payload jsonb not null check (jsonb_typeof(payload)='object' and octet_length(payload::text)<=131072),
 updated_at timestamptz not null default now()
);
alter table public.nova_rts_saves enable row level security;
revoke all on public.nova_rts_saves from anon, authenticated;
grant select,insert,update,delete on public.nova_rts_saves to authenticated;
create policy nova_owner_select on public.nova_rts_saves for select to authenticated using ((select auth.uid())=user_id);
create policy nova_owner_insert on public.nova_rts_saves for insert to authenticated with check ((select auth.uid())=user_id);
create policy nova_owner_update on public.nova_rts_saves for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy nova_owner_delete on public.nova_rts_saves for delete to authenticated using ((select auth.uid())=user_id);
create function public.nova_save_guard() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='INSERT' then NEW.revision:=1;
 else
  if NEW.user_id<>OLD.user_id or NEW.revision<>OLD.revision+1 then raise exception 'revision_conflict' using errcode='40001'; end if;
 end if;
 if NEW.payload->>'version' is distinct from '1' or jsonb_typeof(NEW.payload->'buildings') is distinct from 'array' or jsonb_array_length(NEW.payload->'buildings')>100 or jsonb_typeof(NEW.payload->'army') is distinct from 'array' then raise exception 'invalid_save'; end if;
 NEW.updated_at:=now();return NEW;
end $$;
revoke all on function public.nova_save_guard() from public,anon,authenticated;
create trigger nova_save_guard before insert or update on public.nova_rts_saves for each row execute function public.nova_save_guard();
comment on table public.nova_rts_saves is 'Nova Striker offline campaign backups. RLS owner-only. Not authoritative paid currency or PvP state.';
