# Trolley Dey

Trolley Dey is a React + Vite storefront for a single physical store offering local delivery. Customers can browse a curated catalog, add available products to a persistent cart, and place a cash/transfer-on-delivery order without creating an account. Supabase provides the catalog, order storage, staff authentication, and administration data.

## Features

- Shareable storefront, product detail, cart, checkout, confirmation, contact, admin, and 404 routes.
- Supabase-backed product catalog with a safe local fallback when environment variables are absent.
- Stock-aware product cards and details.
- Persistent client-side cart with quantity editing and subtotals.
- Guest checkout capturing name, phone, delivery address, and an optional note.
- Atomic order and line-item creation through a Postgres function.
- Email notification Edge Function for newly placed orders.
- Staff-only admin screens for order status and product management.
- Search and image-aware pagination skeletons.

Payment gateways, automated delivery logistics, customer accounts, multi-location support, and live POS inventory sync are intentionally out of scope for this MVP.

## Local development

Use Node.js 22:

```sh
nvm use
npm install
cp .env.example .env.local
npm run dev
```

Create a production build with:

```sh
npm run build
```

## Supabase setup

1. Create or link a Supabase project.
2. Apply the migration:

   ```sh
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

   The migration creates the schema, row-level security policies, atomic `place_order` function, and seeds the existing catalog.

3. Create the owner account under **Authentication → Users** in the Supabase dashboard.
4. Add that account to the staff allowlist in the SQL editor:

   ```sql
   insert into public.staff_users (user_id)
   select id from auth.users where email = 'owner@example.com';
   ```

5. Add the project values locally and in Netlify:

   ```text
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

Only the public anon key belongs in the frontend. Never expose the service-role key through a `VITE_` variable.

## New-order email notification

The `notify-new-order` Edge Function reads the saved order using Supabase’s server-side service role and sends the owner an email through Resend.

Configure and deploy it:

```sh
supabase secrets set \
  RESEND_API_KEY=YOUR_RESEND_KEY \
  OWNER_NOTIFICATION_EMAIL=owner@example.com \
  NOTIFICATION_FROM_EMAIL="Trolley Dey <orders@your-verified-domain.com>"

supabase functions deploy notify-new-order
```

Notification delivery is intentionally non-blocking: a notification-provider failure never discards an order that was already saved.

## Netlify

The included `netlify.toml` runs `npm run build`, publishes `dist`, uses Node.js 22, and redirects client-side routes to `index.html`.
