-- 0006_close_public_insert_policies.sql
-- Status: PREPARED, NOT APPLIED. Apply only after the owner approves.
--
-- Why: the website server writes orders and enquiries with the service-role key,
-- which bypasses RLS. The two "public insert" policies below are therefore not
-- needed by the site, but they let anyone holding the public (anon) key insert
-- rows straight into the database — skipping the payment-proof, price and
-- terms checks in /api/checkout/submit-manual-order and the spam checks in
-- /api/enquiries.
--
-- Effect: no change for real customers (they go through the website API).
-- Direct inserts with the anon key will be refused.
--
-- Rollback (if ever needed):
--   create policy "Allow public insert orders" on public.orders for insert to public with check (true);
--   create policy "Allow public insert enquiries" on public.enquiries for insert to public with check (true);

begin;

drop policy if exists "Allow public insert orders" on public.orders;
drop policy if exists "Allow public insert enquiries" on public.enquiries;

commit;
