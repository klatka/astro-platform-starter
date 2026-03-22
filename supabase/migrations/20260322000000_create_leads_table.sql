-- Migration: create leads table
-- Run this once in your Supabase project via the SQL Editor or Supabase CLI.

create table if not exists leads (
    id            bigint generated always as identity primary key,
    vorname       text        not null,
    nachname      text        not null,
    email         text        not null,
    telefon       text,
    plz           text,
    gebaeudetyp   text,
    baujahr       text,
    bereiche      text[],
    kaufmotive    text[],
    pain_points   text[],
    budget        text,
    zeitplanung   text,
    submitted_at  timestamptz not null default now(),
    source        text        not null default 'smarthome-konfigurator'
);

-- Enable Row-Level Security (RLS) so that the public anon key cannot read rows.
-- Only the service-role key (used server-side) is allowed to insert.
alter table leads enable row level security;

-- Allow server-side inserts from the service-role key.
-- The service-role key bypasses RLS, so no extra policy is needed for inserts.
-- The policy below ensures nobody can SELECT rows via the anon key.
create policy "No public read access"
    on leads
    for select
    using (false);
