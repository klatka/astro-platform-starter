-- Migration: create configurator_events table
-- Tracks every configurator_opened, configurator_abandoned, and form_submitted
-- event so that statistics can be derived (e.g. funnel drop-off per step).

create table if not exists configurator_events (
    id           bigint generated always as identity primary key,
    event_type   text        not null,   -- 'configurator_opened' | 'configurator_abandoned' | 'form_submitted'
    step         integer,                -- step index at the time of the event (abandoned only)
    step_name    text,                   -- human-readable step name              (abandoned only)
    occurred_at  timestamptz not null default now(),
    source       text        not null default 'smarthome-konfigurator'
);

-- Enable Row-Level Security.
alter table configurator_events enable row level security;

-- Allow server-side inserts (service-role bypasses RLS; anon key uses this policy).
create policy "Allow anonymous inserts"
    on configurator_events
    for insert
    with check (true);

-- Deny public reads so event data cannot be read via the anon key.
create policy "No public read access"
    on configurator_events
    for select
    using (false);
