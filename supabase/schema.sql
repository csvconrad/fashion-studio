-- =====================================================
-- Fashion Studio — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL)
-- =====================================================

-- 1. Profiles (one per kid, linked to parent auth account)
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  avatar text not null default '🎨',
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users manage own profiles"
  on profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Designs (one per creation, linked to a profile)
create table designs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  thumbnail text,
  canvas_json jsonb not null,
  layers jsonb not null,
  active_layer_id text not null,
  garment_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table designs enable row level security;

create policy "Users manage designs via own profiles"
  on designs for all
  using (
    profile_id in (select id from profiles where user_id = auth.uid())
  )
  with check (
    profile_id in (select id from profiles where user_id = auth.uid())
  );
