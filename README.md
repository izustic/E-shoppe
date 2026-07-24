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

## Product image storage

The database stores product information while Supabase Storage stores the actual image files. The migrations create a public `product-images` bucket with a 5 MB limit and staff-only upload/update/delete policies. Public visitors can view the resulting image URLs, but only allowlisted staff can manage files.

The admin product form accepts JPG, PNG, WebP, and GIF files from your device. When you save a product, the browser uploads the selected file to Supabase Storage and saves its public URL in `products.image_url`.

### Move the existing images once

Keep the current `images/` product files until the database and Storage migrations have been applied. Then:

```sh
cp .env.migration.example .env.migration
```

Fill `.env.migration` with the project URL and service-role key from Supabase. This file is ignored by Git and must never be committed or added to Netlify. Run:

```sh
npm run migrate:product-images
```

The script uploads each existing product image to `product-images/legacy/` and replaces every database `image_url` with its Supabase public URL. Verify the storefront and admin images afterward. Only then is it safe to remove the migrated product files from the repository; keep the logo/favicon files because the site shell still uses them.

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
