create extension if not exists "pgcrypto";

create table if not exists public.redeem_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  course_type text not null,
  status text not null default 'active' check (status in ('active', 'disabled')),
  max_redemptions integer not null default 1 check (max_redemptions > 0),
  redeemed_count integer not null default 0 check (redeemed_count >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.redemption_events (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.redeem_codes(id) on delete cascade,
  redeemed_by_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (code_id, redeemed_by_user_id)
);

create table if not exists public.user_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_type text not null,
  active boolean not null default true,
  granted_by_code_id uuid references public.redeem_codes(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, course_type)
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  active boolean not null default true,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null,
  prompt_excerpt text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_user_permissions_updated_at on public.user_permissions;
create trigger trg_user_permissions_updated_at
before update on public.user_permissions
for each row
execute function public.set_updated_at();

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

alter table public.redeem_codes enable row level security;
alter table public.redemption_events enable row level security;
alter table public.user_permissions enable row level security;
alter table public.admin_users enable row level security;
alter table public.ai_usage_logs enable row level security;
alter table public.site_settings enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and active = true
  );
$$;

drop policy if exists "authenticated users can read active codes" on public.redeem_codes;
create policy "authenticated users can read active codes"
on public.redeem_codes
for select
to authenticated
using (status = 'active');

drop policy if exists "admins can manage all redeem codes" on public.redeem_codes;
create policy "admins can manage all redeem codes"
on public.redeem_codes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users can read own redemption events" on public.redemption_events;
create policy "users can read own redemption events"
on public.redemption_events
for select
to authenticated
using (auth.uid() = redeemed_by_user_id);

drop policy if exists "admins can read all redemption events" on public.redemption_events;
create policy "admins can read all redemption events"
on public.redemption_events
for select
to authenticated
using (public.is_admin());

drop policy if exists "users can read own permissions" on public.user_permissions;
create policy "users can read own permissions"
on public.user_permissions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "admins can read all permissions" on public.user_permissions;
create policy "admins can read all permissions"
on public.user_permissions
for select
to authenticated
using (public.is_admin());

drop policy if exists "admins can read own admin record" on public.admin_users;
create policy "admins can read own admin record"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can read own ai usage logs" on public.ai_usage_logs;
create policy "users can read own ai usage logs"
on public.ai_usage_logs
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can insert own ai usage logs" on public.ai_usage_logs;
create policy "users can insert own ai usage logs"
on public.ai_usage_logs
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "admins can read all ai usage logs" on public.ai_usage_logs;
create policy "admins can read all ai usage logs"
on public.ai_usage_logs
for select
to authenticated
using (public.is_admin());

drop policy if exists "admins can read site settings" on public.site_settings;
create policy "admins can read site settings"
on public.site_settings
for select
to authenticated
using (public.is_admin());

drop policy if exists "admins can manage site settings" on public.site_settings;
create policy "admins can manage site settings"
on public.site_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create or replace function public.redeem_code(input_code text)
returns table (success boolean, message text, course_type text)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  current_user_id uuid := auth.uid();
  code_record public.redeem_codes%rowtype;
begin
  if current_user_id is null then
    return query
    select false as success, '请先登录后再兑换邀请码。' as message, null::text as course_type;
    return;
  end if;

  select *
  into code_record
  from public.redeem_codes
  where code = upper(trim(input_code))
  limit 1;

  if code_record.id is null then
    return query
    select false as success, '邀请码不存在，请检查后再试。' as message, null::text as course_type;
    return;
  end if;

  if code_record.status <> 'active' then
    return query
    select false as success, '这个邀请码当前不可用。' as message, null::text as course_type;
    return;
  end if;

  if code_record.expires_at is not null and code_record.expires_at < timezone('utc', now()) then
    return query
    select false as success, '这个邀请码已经过期。' as message, null::text as course_type;
    return;
  end if;

  if exists (
    select 1
    from public.redemption_events
    where code_id = code_record.id
      and redeemed_by_user_id = current_user_id
  ) then
    return query
    select
      true as success,
      '这个邀请码你已经兑换过了。' as message,
      code_record.course_type as course_type;
    return;
  end if;

  if code_record.redeemed_count >= code_record.max_redemptions then
    return query
    select false as success, '这个邀请码的可用次数已经用完。' as message, null::text as course_type;
    return;
  end if;

  insert into public.redemption_events (code_id, redeemed_by_user_id)
  values (code_record.id, current_user_id);

  update public.redeem_codes
  set redeemed_count = redeemed_count + 1
  where id = code_record.id;

  insert into public.user_permissions (user_id, course_type, active, granted_by_code_id)
  values (current_user_id, code_record.course_type, true, code_record.id)
  on conflict (user_id, course_type)
  do update
  set active = true,
      granted_by_code_id = excluded.granted_by_code_id,
      updated_at = timezone('utc', now());

  return query
  select
    true as success,
    '兑换成功，课程权限已经开通。' as message,
    code_record.course_type as course_type;
end;
$$;

revoke all on function public.redeem_code(text) from public;
grant execute on function public.redeem_code(text) to authenticated;

create or replace function public.get_ai_quota_status(daily_limit integer, timezone_name text default 'Asia/Shanghai')
returns table (used_count integer, remaining_count integer, quota_limit integer, usage_day date)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  current_user_id uuid := auth.uid();
  target_day date := (timezone(timezone_name, now()))::date;
  current_used integer := 0;
begin
  if current_user_id is null then
    return query
    select
      0 as used_count,
      daily_limit as remaining_count,
      daily_limit as quota_limit,
      target_day as usage_day;
    return;
  end if;

  select count(*)
  into current_used
  from public.ai_usage_logs
  where user_id = current_user_id
    and usage_day = target_day;

  return query
  select
    current_used as used_count,
    greatest(daily_limit - current_used, 0) as remaining_count,
    daily_limit as quota_limit,
    target_day as usage_day;
end;
$$;

revoke all on function public.get_ai_quota_status(integer, text) from public;
grant execute on function public.get_ai_quota_status(integer, text) to authenticated;

create or replace function public.consume_ai_quota(
  daily_limit integer,
  timezone_name text default 'Asia/Shanghai',
  prompt_excerpt_input text default null
)
returns table (
  success boolean,
  message text,
  used_count integer,
  remaining_count integer,
  quota_limit integer,
  usage_day date
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  current_user_id uuid := auth.uid();
  target_day date := (timezone(timezone_name, now()))::date;
  current_used integer := 0;
begin
  if current_user_id is null then
    return query
    select
      false as success,
      '请先登录后再使用 AI 助教。' as message,
      0 as used_count,
      daily_limit as remaining_count,
      daily_limit as quota_limit,
      target_day as usage_day;
    return;
  end if;

  select count(*)
  into current_used
  from public.ai_usage_logs
  where user_id = current_user_id
    and usage_day = target_day;

  if current_used >= daily_limit then
    return query
    select
      false as success,
      '你今天的 AI 次数已经用完了。' as message,
      current_used as used_count,
      0 as remaining_count,
      daily_limit as quota_limit,
      target_day as usage_day;
    return;
  end if;

  insert into public.ai_usage_logs (user_id, usage_day, prompt_excerpt)
  values (current_user_id, target_day, left(prompt_excerpt_input, 180));

  current_used := current_used + 1;

  return query
  select
    true as success,
    '本次调用已计入今日额度。' as message,
    current_used as used_count,
    greatest(daily_limit - current_used, 0) as remaining_count,
    daily_limit as quota_limit,
    target_day as usage_day;
end;
$$;

revoke all on function public.consume_ai_quota(integer, text, text) from public;
grant execute on function public.consume_ai_quota(integer, text, text) to authenticated;
