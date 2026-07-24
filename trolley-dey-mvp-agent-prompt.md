# Master Prompt: Trolley Dey — Grocery Delivery MVP

## Context

**Trolley Dey** is pivoting from a portfolio/demo shopping cart into the real front-end for a physical supermarket that will take online orders for local delivery.

Already implemented (previous pass — do not redo, build on top of it):
- Real routing via `react-router-dom` (`/`, `/items`, `/products`, `/contact`, product detail, 404)
- Shared product data source, product detail pages, working cart (Context + `useReducer`, persisted to localStorage)
- Client-side search/filter
- Contact form
- Footer cleaned up (dead links removed/stubbed)

**The business model now:** one physical store (single location, no multi-location logic needed), selling groceries online for local delivery. This is an MVP meant to validate demand before the store scales — not a fully automated logistics platform.

## Scope decisions already made (do not relitigate these — build to this scope)

1. **Single location only.** No store selector, no per-location inventory/pricing. Don't build for multi-location.
2. **Curated catalog, not live shelf-stock sync.** Products are manually maintained (added/edited/marked out-of-stock) via a simple admin interface — not synced to a POS or barcode system. Accuracy is "good enough," not real-time.
3. **Manual delivery coordination, not automated logistics.** The site's job is to capture a complete, correct order + delivery address + contact number. It does NOT need rider assignment, live tracking, delivery zones/fees calculation, or third-party courier API integration. Fulfillment happens by a human (owner/staff) contacting a rider after seeing the order.
4. **No payment gateway required for this MVP.** Default to "pay on delivery" (cash or transfer) captured as a note on the order. Don't integrate Paystack/Flutterwave yet — flag it as a clear future step but don't build it now.

## Goal

Turn the existing cart demo into an actual order-capture pipeline: customer browses the curated catalog → adds to cart → checks out with delivery details → order is saved and the store owner is notified → owner can see and manage incoming orders and the product catalog through a simple admin view.

## Tech direction

- Backend: **Supabase** (Postgres + Auth + Realtime) — consistent with existing stack experience, avoids building custom infra.
- Keep frontend in plain JavaScript/JSX, React + Vite, matching the existing codebase.
- Auth: only needed for the admin side (owner/staff login to manage products/orders). Customers should NOT be required to create an account to place an order — that's friction the MVP doesn't need yet. Optionally capture returning customers via phone number only.

## Priority-ordered task list

### 1. Supabase schema
Set up tables:
- `products` — id, name, description, price, image_url, category, in_stock (boolean), featured (boolean)
- `orders` — id, created_at, customer_name, phone_number, delivery_address, delivery_note, status (`new` / `confirmed` / `out_for_delivery` / `delivered` / `cancelled`), payment_method (default `cash_on_delivery`), total
- `order_items` — id, order_id, product_id, quantity, price_at_order_time

Migrate the existing static product array into this `products` table (one-time seed script is fine).

### 2. Real checkout flow
- Replace the current cart-only flow with an actual `/checkout` page: customer name, phone number, delivery address, optional delivery note.
- On submit: create a row in `orders` and matching rows in `order_items` from the current cart contents, then clear the cart and show an order confirmation screen (order number + "we'll contact you to confirm delivery").
- No payment collection in this flow — just capture "Cash/Transfer on Delivery" as the method, clearly labeled to the customer.

### 3. Owner notification on new order
- Since there's no dashboard being watched live yet, add a simple notification so a new order doesn't go unnoticed: e.g. a Supabase Edge Function triggered on insert into `orders` that sends a WhatsApp message (via a WhatsApp Business API, similar to the Botomotion setup) or email/SMS to the store owner's number with the order summary.
- Keep this simple — a message with customer name, phone, address, and item list is enough. No need for rich formatting yet.

### 4. Minimal admin view
- A `/admin` route (protected by Supabase Auth, single owner/staff account is fine for now — no need for role management) with two simple screens:
  - **Orders list**: see incoming orders, update status (new → confirmed → out for delivery → delivered/cancelled).
  - **Products list**: add/edit products, toggle in-stock/out-of-stock, mark featured.
- Keep this functional and plain — table + forms, no need for a polished dashboard UI at this stage.

### 5. Reflect stock status to customers
- On the storefront, if a product's `in_stock` is false, show it as "Out of Stock" and disable Add to Cart for it (don't hide it entirely — customers should still be able to browse the full catalog).

## Explicitly out of scope for this pass

Do not build any of the following yet — flag them as future work if relevant, but don't implement:
- Payment gateway integration (Paystack/Flutterwave)
- Delivery zone mapping, delivery fee calculation, or delivery time windows
- Rider assignment or live delivery tracking
- Customer accounts / order history / login for customers
- Multi-location support
- Live POS/barcode inventory sync

## Constraints & house rules

- Don't over-build the admin UI — this is for one or two people (you/staff) managing a single store, not a multi-tenant SaaS dashboard.
- Keep the checkout flow as low-friction as possible for the customer — minimize required fields to name, phone, address.
- Order status changes and stock toggles should feel instant (optimistic UI is fine) but must actually persist to Supabase, not just local state.
- After each numbered task, the app should run end-to-end without errors before moving to the next task.
- Commit in logical chunks, one commit per numbered task where practical.

## Definition of done

- Products live in Supabase, not a static local array.
- A customer can complete a full order (browse → cart → checkout → confirmation) without creating an account.
- Every completed order and its line items are correctly saved in Supabase.
- The store owner gets notified (WhatsApp/email/SMS) when a new order comes in.
- The owner can log into `/admin` to view/update order status and manage the product catalog (including marking items out of stock, which is reflected on the storefront).
