# Sialkot Cricket Kits — Production Web Application

Official production codebase for **Sialkot Cricket Kits** ([https://sialkotcricketkits.com](https://sialkotcricketkits.com)). Handcrafted English Willow cricket bats, batting gloves, pads, helmets, kit bags, and bespoke custom cricket equipment dispatched worldwide from Sialkot, Pakistan.

---

## 🛠️ Technology Stack & Architecture

- **Frontend & Server Framework**: Next.js / Vinext App Router with React Server Components (RSC)
- **Hosting & Edge Runtime**: Cloudflare Workers
- **Database**: Supabase (PostgreSQL) — Project ID: `yokiizorrqopfhbvrtpa`
- **Storage**: Supabase Storage (`receipts` bucket for payment proof, `products` bucket for catalogue media)
- **Transactional Email**: Resend API
- **Automated Messaging**: Meta WhatsApp Cloud API / Twilio WhatsApp API
- **Security**: Edge-safe session authentication, short-lived signed URLs, private storage buckets

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20+ or 22+
- npm 10+

### 2. Installation
```bash
git clone https://github.com/alyankhan1078/Sialkot-Cricket-Kits.git
cd "Sialkot Cricket Kits"
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase, Resend, and Admin credentials.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Deployment

### Build Command
```bash
npm run build:vite
```

### Deploy to Cloudflare Workers
```bash
git add .
git commit -m "deploy: update production application"
git push origin main
```
Cloudflare Workers automatically builds and deploys from the `main` branch.

---

## ⚙️ Production Environment Variables

Configure these variables in your **Cloudflare Dashboard → Workers & Pages → Settings → Variables and Secrets**:

| Variable Name | Description | Example / Required Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://yokiizorrqopfhbvrtpa.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Service Role Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Never expose to browser) |
| `ADMIN_EMAIL` | Authorised Administrator Email | `alyankhan1078@gmail.com` |
| `ADMIN_USER_ID` | (Optional) Supabase Auth Admin UUID | `your-supabase-user-uuid` |
| `BUSINESS_EMAIL` | Business Alert Email | `sialkotcricketkits@gmail.com` |
| `BUSINESS_WHATSAPP` | Business WhatsApp Contact | `+923231438214` |
| `RESEND_API_KEY` | Resend Transactional Email Key | `re_xxxxxxxxxxxx` |
| `EMAIL_FROM` | Verified Sending Domain | `orders@sialkotcricketkits.com` |
| `META_WHATSAPP_TOKEN` | Meta WhatsApp Cloud Token (Optional) | `EAAG...` |
| `META_WHATSAPP_PHONE_ID` | Meta Phone Number ID (Optional) | `1029384756...` |

---

## 🛡️ Admin Dashboard & Order Management

Access the secure Admin Panel at:
👉 **[https://sialkotcricketkits.com/admin/orders](https://sialkotcricketkits.com/admin/orders)**

### Key Admin Features:
1. **Payment Verification Tab**: Inspect new orders with attached UBL transfer receipts.
2. **Private Receipt Viewer**: Securely stream and verify payment proofs from the private `receipts` storage bucket.
3. **Verify Payment & Confirm Order**: One-click verification updates order status to `Order Confirmed` and dispatches confirmation email & WhatsApp message.
4. **Workshop Pipeline**: Progress orders across `In Production`, `Ready for Dispatch`, `Dispatched` (with tracking number), and `Delivered`.
5. **Notification Delivery Badges & Retry**: View delivery status and 1-click resend failed notifications.

---

## 🔒 Security Best Practices
- The `SUPABASE_SERVICE_ROLE_KEY` is kept strictly server-side and never bundled in client assets.
- Payment receipts are stored in a private bucket (`receipts`) and only accessible to authenticated administrators via signed proxy routes.
- Form inputs and files are strictly validated (5 MB limit, magic byte validation for JPG, PNG, WEBP, PDF).
