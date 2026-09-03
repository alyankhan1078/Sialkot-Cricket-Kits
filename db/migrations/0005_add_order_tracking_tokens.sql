alter table public.orders
  add column if not exists tracking_token text;

update public.orders
set tracking_token = encode(gen_random_bytes(32), 'hex')
where tracking_token is null;

alter table public.orders
  alter column tracking_token set default encode(gen_random_bytes(32), 'hex'),
  alter column tracking_token set not null;

create unique index if not exists idx_orders_tracking_token
  on public.orders (tracking_token);
