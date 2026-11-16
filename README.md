# Project store

Customers subscribe to ready-made projects (hosted app, setup, or source code) and can order custom projects. You upload projects and set prices from the admin panel.

## Setup (one time)

1. Create a free project at https://supabase.com.
2. In Supabase: **SQL Editor → New query**, paste all of `supabase/schema.sql`, click **Run**.
3. In Supabase: **Project Settings → API**, copy the Project URL and the anon/publishable key.
4. Copy `.env.local.example` to `.env.local` and paste those two values in.
5. Run the site: `npm run dev`, open the address it prints, and **create an account** at `/signup`.
6. Make yourself admin: in the SQL Editor run
   ```sql
   insert into public.admins (user_id) select id from auth.users where email = 'YOUR-EMAIL';
   ```
7. Sign in. An **Admin** button appears in the header.

For sign-up emails to link back to your site, set **Authentication → URL Configuration → Site URL** in Supabase to your site address (and `NEXT_PUBLIC_SITE_URL` in `.env.local`).

## How it works

- **Admin → Projects → Upload project**: title, description, screenshot, monthly price, which options you offer, public demo link, private live-app link, and a source-code zip (stored privately).
- A customer opens a project and clicks **Request subscription**. It appears in **Admin → Subscriptions** with their email and phone.
- Confirm payment with them, then set the status to **Active**. Their account then shows the live app link or the **Download source** button (a 60-second private link).
- **Custom project** requests appear in **Admin → Custom requests**.

Payments are confirmed manually for now. Online payment (Stripe, Lemon Squeezy, Paddle) can be added later.

## Where things are

| What | File |
| --- | --- |
| Company name, email | `src/lib/site.ts` |
| Database, security rules, storage | `supabase/schema.sql` |
| 3D homepage story | `src/components/story/` |
| Admin panel | `src/app/admin/` |
| Standalone animated showcase (no backend) | `showcase/portfolio.html`, `public/showcase.html` |
