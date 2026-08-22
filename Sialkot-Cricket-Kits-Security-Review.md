# Sialkot Cricket Kits — Code Review & Security Findings

**Scope:** Static analysis of the uploaded project archive (Next.js/vinext app deployed to a Cloudflare Worker via the `chatgpt.site` hosting platform). No live network testing was performed — findings are based on source review only.

**Overall picture:** This is a mostly-static marketing/catalog site. There is no real backend, login system, or payment processor — checkout and enquiries are done by generating a `wa.me` (WhatsApp) link or a `mailto:` link client-side. Because of that, the *attack surface* is small, but there are a few real issues plus several pieces of leftover template/scaffolding code that would be dangerous if ever wired up.

---

## High priority

### 1. Dead ChatGPT-auth code trusts request headers for identity
**File:** `app/chatgpt-auth.ts`

This module treats the presence of the request headers `oai-authenticated-user-email` / `oai-authenticated-user-full-name` as proof that a user is logged in — there is no signature, token, or verification of any kind. It is not currently called from any page or route, so today it is inert dead code. However:
- If this is ever wired into a real page (e.g., a future "my orders" or admin page), **anyone who can send a raw HTTP request directly to the Worker origin (bypassing the trusted ChatGPT proxy) could forge these headers and impersonate any user/email**, unless the edge is strictly configured to strip/overwrite these headers before they reach the app.
- Recommendation: remove this file if unused, or if it's needed, confirm (and document/test) that the Cloudflare Worker cannot be reached directly — only through the proxy that sets these headers — and add a signed/verifiable token instead of a plain trusted header.

### 2. Full business bank account details published on a public, indexed page
**File:** `app/payment/page.tsx`

The `/payment` page publicly displays the account holder's real name ("Alyan Wazir"), last 4 digits of the account number, partially-masked IBAN, SWIFT/BIC code, and branch. `robots.ts` sets `allow: "/"` and the page is included in `sitemap.ts`, so this content is meant to be crawled and indexed by search engines.

- This directly **helps the exact scam the page itself warns about** ("do not send payment using details received from an unknown number") — a fraudster can legitimately screenshot this real, verified page and reuse the real account title/branch/SWIFT details while posing as the seller on a different phone number or fake WhatsApp/social account, since the victim can "confirm" the account name/branch matches what's on the real website.
- It also **doxxes a real individual's name** in connection with a specific financial account, which is a personal-safety/identity-fraud risk for that person.
- Recommendation: don't publish full bank profile details on a page search engines can index. Gate the real payment details behind manual confirmation over a verified channel only (which is already partially the intent), `noindex` the `/payment` route, and drop it from `sitemap.ts`.

---

## Medium priority

### 3. No security headers / CSP configured anywhere
**Files:** `next.config.ts`, `worker/index.ts`

`next.config.ts` is an empty default config, and the Worker entry point (`worker/index.ts`) does not add any response headers. There is no `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`, or `Strict-Transport-Security` header set anywhere in the app.
- This provides no defense-in-depth against clickjacking, MIME-sniffing, or any future injected script, and makes the `dangerouslySetInnerHTML` usage below riskier than it needs to be.
- Recommendation: add security headers either in `next.config.ts` (`headers()` function) or in the Worker `fetch` handler, and set a CSP that only allows the required script/style/image origins.

### 4. Unused example API route ships with no auth, no rate limiting, no input limits
**File:** `examples/d1/app/api/notes/route.ts`

This example "notes" API is not currently mounted under `app/` (so it isn't live), but it's shipped in the repo/bundle as a copy-paste starting point. As written:
- `POST` accepts arbitrary `title`/`content` strings with **no length limit, no authentication, no rate limiting, and no CAPTCHA/anti-abuse check**, and writes them straight to the D1 database.
- `GET` returns the latest 20 rows to **any unauthenticated caller**.
- If a developer copies this into the live `app/` tree without adding auth, it becomes an open read/write endpoint anyone can spam or use to fill the database with junk (storage-exhaustion / low-effort DoS) or scrape.
- Recommendation: remove unused example/starter code from what ships to production, and if a similar endpoint is ever built for real, add authentication, per-IP rate limiting, and input length validation before it goes live.

### 5. Client-side-only cart and pricing — no server-side source of truth
**Files:** `src/components/StoreProvider.tsx`, `src/components/ProductDetailsClient.tsx`, `src/data/products.ts`

The cart, quantities, and prices used to build the WhatsApp checkout message are entirely computed in the browser from a static `products.ts` file and `localStorage`, with nothing validated server-side. Practically this is low-severity today (a human on WhatsApp confirms the real price before any money moves), but:
- Anyone can trivially edit the page's JS state (via devtools) to send a WhatsApp message quoting a **different price or quantity than the real catalogue**, and an inattentive staff member could honor it.
- `localStorage` content (`sck-cart`, `sck-favourites`) is parsed with `JSON.parse` and only wrapped in a `try/catch` that resets to `[]` on parse failure — it doesn't validate the *shape* of the recovered data (e.g., a tampered `quantity` of `-999999` or a non-array), which could produce broken totals/NaN in the UI.
- Recommendation: if any of this ever becomes real e-commerce, always re-verify price/stock against the authoritative product list server-side before confirming an order. For the current site, at minimum validate the shape of anything read back from `localStorage`.

### 6. Personal WhatsApp number is the sole channel for order/payment confirmation
**Files:** `src/lib/whatsapp.ts`, throughout the UI

All ordering, payment confirmation, and customer support funnels through a single hardcoded WhatsApp number (`+92 323 1438214`). This is a business/operational risk rather than a classic "vulnerability," but from a security standpoint: if that number/WhatsApp account is ever compromised, cloned (SIM-swap), or spoofed, there is no secondary verification channel referenced anywhere on the site (e.g., a signed order-confirmation email, order ID system, etc.) to help customers detect the difference between the real seller and an impersonator.

---

## Low priority / hardening suggestions

### 7. `dangerouslySetInnerHTML` used for JSON-LD
**File:** `app/layout.tsx`

The organization schema is injected via `dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}`. Today `organization` is a fully static object with no user input, so this is **not currently exploitable**, but it's a sink pattern worth flagging: if this object is ever extended to include any value derived from user input, a query string, or CMS content, it becomes a stored/reflected XSS vector. Consider using a safer JSON-LD serialization helper that escapes `</script>` sequences, and keep this object 100% static.

### 8. No spam/anti-abuse protection on contact/custom-bat forms
**Files:** `src/components/ContactForm.tsx`, `src/components/CustomBatForm.tsx`

These forms don't post to a backend today (they build a `wa.me`/`mailto:` link), so there's no server to abuse. But there's also no length limit on any field, and if a backend is added later, the current implementation has no CAPTCHA, honeypot, or rate limiting to carry over — that would need to be designed in from the start rather than retrofitted.

### 9. Public exposure of internal hosting/project identifier
**File:** `.openai/hosting.json`

Contains a `project_id` (`appgprj_6a88aaac5c00819188818ffaa47f1241`). This is bundled with the source and not something end users would normally see, but if this archive or repo is ever made public (e.g., pushed to a public GitHub repo), it discloses an internal platform project identifier. Low sensitivity, but worth scrubbing before any public source release.

### 10. Bleeding-edge / pre-release dependency pins
**File:** `package.json`

The project pins very new major versions (`next@16.2.6`, `react@19.2.6` / `react-dom@19.2.6`, `vite@8.0.13`, `tailwindcss@4.2.1`, `wrangler@4.92.0`). Newer major releases tend to have less security-hardening mileage and a higher chance of undisclosed issues. Recommendation: keep an automated dependency-audit process (e.g., `npm audit`, Dependabot/Renovate) running on this project so any CVEs disclosed after this snapshot are caught quickly.

### 11. `<img>` tags without Next.js `<Image>` optimizations
**Files:** `StoreProvider.tsx` (cart line items), `ProductDetailsClient.tsx` (gallery)

Not a security bug per se, but plain `<img src=...>` tags are used for product images sourced from the static `products.ts` catalog rather than Next's `<Image>` component. Since image sources are fixed, first-party paths (not user-controlled), there's no injection risk today — flagged only because if product images are ever made editable by a non-developer (e.g., via a future admin panel or CMS), unsanitized `src` values from that source should be validated/allow-listed to prevent it from being pointed at an arbitrary/external URL.

---

## What looked fine

- No hardcoded API keys, tokens, or secrets were found anywhere in the source, scripts, or lockfile.
- `scripts/install-ci.sh` and `scripts/build-verified.sh` are unusually careful CI scripts: they pin/verify the `vinext` tarball's integrity hash before install, use `flock` to avoid concurrent installs, and run `npm ci` with retries disabled and a bounded timeout — solid supply-chain hygiene for the build pipeline itself.
- User-provided form input is properly `encodeURIComponent`-escaped before being placed into `wa.me`/`mailto:` URLs, so there's no obvious link/header injection there.
- `app/chatgpt-auth.ts`'s `safeRelativeReturnPath()` function does correctly guard against open-redirect payloads (protocol-relative URLs, absolute URLs, reserved paths) for the *return_to* parameter, even though the module as a whole is unused/risky as noted in Finding 1.

---

*This review covers static source code only. It does not include dynamic testing (e.g., actually probing the live Cloudflare Worker), dependency CVE scanning against a live vulnerability database, or infrastructure/DNS-level review.*
