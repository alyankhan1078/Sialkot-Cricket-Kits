create index if not exists idx_payment_status_history_submission_id
on public.payment_status_history (payment_submission_id);

revoke all on table
  public.orders,
  public.payment_submissions,
  public.payment_status_history,
  public.notification_logs,
  public.admin_config,
  public.admin_sessions
from anon, authenticated;

grant select, insert, update, delete on table
  public.orders,
  public.payment_submissions,
  public.payment_status_history,
  public.notification_logs,
  public.admin_config,
  public.admin_sessions
to service_role;
