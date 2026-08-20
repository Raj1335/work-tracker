-- Run this in the Supabase SQL editor once, on a new project.

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  date date not null default current_date,
  category text not null default 'Other',
  reference_number text default '',
  village text default '',
  recipient_name text default '',
  contact_number text default '',
  description text default '',
  deadline date,
  status text not null default 'pending' check (status in ('pending', 'in-progress', 'done'))
);

create index if not exists entries_status_idx on entries (status);
create index if not exists entries_deadline_idx on entries (deadline);

-- Keep updated_at current on every row change.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists entries_set_updated_at on entries;
create trigger entries_set_updated_at
before update on entries
for each row execute function set_updated_at();

-- Row Level Security: the app only ever talks to Supabase via the service
-- role key from the server (never the browser), so RLS can stay locked down
-- with no public policies. This is what actually keeps the data private,
-- not just the app's password gate.
alter table entries enable row level security;
