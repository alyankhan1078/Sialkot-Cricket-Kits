-- Durable manual-payment workflow for Sialkot Cricket Kits.
-- Safe to run more than once.

create table if not exists public.payment_submissions (
  id text primary key,
  order_id text not null references public.orders(id) on delete cascade,
  payment_method text not null,
  sender_name text not null,
  sender_country text not null,
  provider text not null,
  amount_sent numeric not null check (amount_sent >= 0),
  currency_sent text not null default 'GBP',
  transfer_reference text not null,
  transfer_date date not null,
  receipt_storage_path text not null,
  receipt_original_name text not null,
  receipt_mime_type text not null,
  receipt_file_size bigint not null check (receipt_file_size > 0 and receipt_file_size <= 5242880),
  status text not null default 'payment_submitted' check (
    status in (
      'awaiting_payment',
      'payment_submitted',
      'payment_verified',
      'payment_rejected',
      'payment_reupload_requested',
      'refunded'
    )
  ),
  customer_note text,
  rejection_reason text,
  verified_by text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id)
);

create table if not exists public.payment_status_history (
  id text primary key,
  payment_submission_id text not null references public.payment_submissions(id) on delete cascade,
  order_id text not null references public.orders(id) on delete cascade,
  old_status text not null,
  new_status text not null,
  changed_by text not null,
  internal_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_logs (
  id text primary key,
  order_id text not null references public.orders(id) on delete cascade,
  type text not null check (type in ('order_received', 'order_confirmed', 'status_update', 'admin_alert')),
  channel text not null check (channel in ('email', 'whatsapp')),
  recipient text not null,
  status text not null check (status in ('sent', 'failed', 'simulated')),
  provider text,
  provider_message_id text,
  error_reason text,
  sent_at timestamptz not null default now()
);

create index if not exists idx_payment_submissions_order_id
  on public.payment_submissions(order_id);
create index if not exists idx_payment_submissions_status_created
  on public.payment_submissions(status, created_at desc);
create index if not exists idx_payment_submissions_transfer_reference
  on public.payment_submissions(lower(transfer_reference));
create index if not exists idx_payment_status_history_order_id
  on public.payment_status_history(order_id, created_at desc);
create index if not exists idx_notification_logs_order_id
  on public.notification_logs(order_id, sent_at desc);

alter table public.payment_submissions enable row level security;
alter table public.payment_status_history enable row level security;
alter table public.notification_logs enable row level security;

revoke all on public.payment_submissions from anon, authenticated;
revoke all on public.payment_status_history from anon, authenticated;
revoke all on public.notification_logs from anon, authenticated;

grant all on public.payment_submissions to service_role;
grant all on public.payment_status_history to service_role;
grant all on public.notification_logs to service_role;

drop policy if exists "Service role manages payment submissions" on public.payment_submissions;
create policy "Service role manages payment submissions"
  on public.payment_submissions for all to service_role
  using (true) with check (true);

drop policy if exists "Service role manages payment history" on public.payment_status_history;
create policy "Service role manages payment history"
  on public.payment_status_history for all to service_role
  using (true) with check (true);

drop policy if exists "Service role manages notification logs" on public.notification_logs;
create policy "Service role manages notification logs"
  on public.notification_logs for all to service_role
  using (true) with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- This event-trigger helper is internal infrastructure and must not be exposed
-- through the public Data API as an executable SECURITY DEFINER function.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
