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

-- Enable Row-Level Security (RLS).
-- Inserts are allowed for both the service-role key and the anon key (see policies below).
-- Reads are blocked for the anon key so row data is never exposed publicly.
alter table leads enable row level security;

-- Allow server-side inserts.
-- The service-role key bypasses RLS entirely.
-- The policy below also grants the anon key insert access so that the fallback
-- path in src/lib/supabase.ts (SUPABASE_ANON_KEY) can persist leads.
create policy "Allow anonymous inserts"
    on leads
    for insert
    with check (true);

-- Deny public reads so row data cannot be read via the anon key.
create policy "No public read access"
    on leads
    for select
    using (false);
