# Master Prompt: Trolley Dey (E-shoppe) Upgrade

## Context

You are working on **Trolley Dey**, a React + Vite e-commerce demo project (repo: `izustic/E-shoppe`, live at https://trolleydey.netlify.app/).

Current state:
- Single-page app with a top nav (Home / Items / Products / Contact) that scrolls/hash-jumps between sections — there is no real routing.
- "Items Listings" and "Featured Products" sections both render hardcoded, duplicated product cards using lorem-ipsum placeholder text.
- "Add to Cart" buttons exist on product cards but have no behavior — there is no cart state anywhere in the app.
- Footer contains many dead links (Sell your Products, Advertise, Pricing, Return, Cash Back, Careers, Affiliate Marketing, Help Center, Privacy Policy, Terms, Login) that go nowhere.
- README claims a "search" feature that does not appear to exist in the UI.
- Pagination dots exist visually under product grids but should be checked for actual functionality.
- Stack: Vite + React, plain CSS files (`style.css`, `pagination.css`, `placeholder.css`), no TypeScript, no routing library, no state management library currently installed.
- This is a personal/portfolio project, not a production store — no real backend, payments, or auth are in scope right now.

Tech preferences:
- Write plain JavaScript (JSX), not TypeScript, unless told otherwise.
- Keep dependencies minimal — prefer React Router + built-in React state (Context/useReducer) over pulling in Redux, Zustand, etc.
- Match the existing visual style (dark navy header, orange/red accent color, card-based product grids) rather than introducing a new design system.

## Goal

Turn this from a static, non-functional catalog mockup into a working front-end shopping flow demo: browse products → view a product → add to cart → view/edit cart → contact form. No backend/auth/payments needed yet.

## Priority-ordered task list

Work through these in order. Don't skip ahead to later items before earlier ones are functionally solid — each step builds on the last.

### 1. Real routing
- Install and configure `react-router-dom`.
- Convert the current tab/anchor nav into real routes: `/`, `/items`, `/products`, `/contact`.
- Add a catch-all `404` route.
- Keep the existing nav bar component, just wire its links to `<Link>`/`<NavLink>` instead of anchor jumps.

### 2. Centralize product data
- Create a single source of truth for products (e.g. `src/data/products.js`) — an array of objects with at least `id`, `name`, `price`, `description`, `image`, `category`.
- Refactor "Items Listings," "Featured Products," and the "Products" page to all read from this shared array instead of duplicated hardcoded JSX. Featured Products can be a filtered/sliced subset (e.g. `featured: true` flag) rather than a separate hardcoded list.
- Replace all lorem-ipsum text with realistic (can be fake, doesn't need to be real inventory) product names and descriptions.
- Fix the Featured Products section so all cards consistently show price and name (currently only one of three does).

### 3. Product detail page
- Add a route `/products/:id`.
- Clicking a product card (image or title) navigates to its detail page.
- Detail page shows larger image, full description, price, quantity selector, and an "Add to Cart" button.

### 4. Working cart
- Create cart state using React Context + `useReducer` (e.g. `src/context/CartContext.jsx`), persisted to `localStorage` so it survives refresh.
- Actions needed: add item, remove item, update quantity, clear cart.
- Wire up every existing "Add to Cart" button (on cards and on the detail page) to actually dispatch add-to-cart.
- Add a cart icon with item-count badge in the nav bar.
- Build a `/cart` route or slide-out cart drawer showing line items, quantities (editable), remove buttons, and a subtotal.

### 5. Search
- Add a search input (in the nav or on `/products`) that filters the shared product array by name, client-side.
- If search isn't going to be built right now, remove the claim from the README instead of leaving it misleading.

### 6. Contact page
- Build a real form on `/contact`: name, email, message fields, client-side validation, and a submit handler (can just log/toast for now since there's no backend — note this clearly with a `// TODO: wire to a real endpoint or form service (e.g. Netlify Forms)` comment).

### 7. Footer cleanup
- Audit every footer link. For each one, either:
  - (a) make it a real route/page if it's in scope, or
  - (b) remove it, or
  - (c) leave it but visually/semantically mark it as disabled or "coming soon" (don't leave dead links that look clickable).
- Do NOT build out Login, Sell Your Products, Affiliate Marketing, Careers, Cash Back — these are out of scope for this pass. Remove or stub them clearly.

## Constraints & house rules

- Don't introduce a backend, database, or auth system in this pass — everything should work client-side with static data + localStorage.
- Don't rewrite the visual design — reuse existing CSS classes/colors where possible, only add new styles for genuinely new UI (cart drawer, product detail, search input).
- Keep components small and one-purpose (e.g. `ProductCard`, `ProductGrid`, `CartDrawer`, `CartItem`) rather than one giant page file.
- After each numbered task above, the app should still run (`npm run dev`) without errors before moving to the next task.
- Commit in logical chunks (one commit per numbered task is ideal) with clear commit messages.

## Definition of done

- All four nav routes work as real URLs (shareable/refreshable, not just scroll anchors).
- Clicking any product goes to a working detail page.
- Add to Cart visibly updates a cart icon/badge and the cart contents persist on refresh.
- Cart items can have quantity changed and be removed.
- No dead-looking links remain in the footer.
- No lorem-ipsum text remains in product data.
