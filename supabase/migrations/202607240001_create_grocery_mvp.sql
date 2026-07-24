create extension if not exists pgcrypto;

create type public.order_status as enum (
  'new',
  'confirmed',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

create type public.payment_method as enum ('cash_on_delivery');

create table public.products (
  id text primary key,
  name text not null,
  description text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  image_url text not null,
  category text not null,
  in_stock boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  phone_number text not null,
  delivery_address text not null,
  delivery_note text,
  status public.order_status not null default 'new',
  payment_method public.payment_method not null default 'cash_on_delivery',
  total numeric(12, 2) not null check (total >= 0)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  price_at_order_time numeric(12, 2) not null check (price_at_order_time >= 0)
);

create table public.staff_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index orders_created_at_idx on public.orders(created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);
create index products_category_idx on public.products(category);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.staff_users enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

create policy "Products are publicly readable"
on public.products for select
to anon, authenticated
using (true);

create policy "Authenticated staff manage products"
on public.products for all
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Authenticated staff read orders"
on public.orders for select
to authenticated
using (public.is_staff());

create policy "Authenticated staff update orders"
on public.orders for update
to authenticated
using (public.is_staff())
with check (public.is_staff());

create policy "Authenticated staff read order items"
on public.order_items for select
to authenticated
using (public.is_staff());

create or replace function public.place_order(
  customer_name text,
  phone_number text,
  delivery_address text,
  delivery_note text,
  items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_order_id uuid := gen_random_uuid();
  calculated_total numeric(12, 2);
begin
  if length(trim(customer_name)) < 2
    or length(trim(phone_number)) < 8
    or length(trim(delivery_address)) < 10 then
    raise exception 'Complete customer and delivery details are required.';
  end if;

  if jsonb_array_length(items) = 0 then
    raise exception 'The order must contain at least one item.';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(items) as requested(product_id text, quantity integer)
    left join public.products product on product.id = requested.product_id
    where product.id is null
      or product.in_stock is false
      or requested.quantity < 1
      or requested.quantity > 20
  ) then
    raise exception 'One or more products are unavailable or have an invalid quantity.';
  end if;

  select sum(product.price * requested.quantity)
  into calculated_total
  from jsonb_to_recordset(items) as requested(product_id text, quantity integer)
  join public.products product on product.id = requested.product_id;

  insert into public.orders (
    id, customer_name, phone_number, delivery_address, delivery_note, total
  ) values (
    new_order_id,
    trim(customer_name),
    trim(phone_number),
    trim(delivery_address),
    nullif(trim(delivery_note), ''),
    calculated_total
  );

  insert into public.order_items (
    order_id, product_id, quantity, price_at_order_time
  )
  select
    new_order_id,
    product.id,
    requested.quantity,
    product.price
  from jsonb_to_recordset(items) as requested(product_id text, quantity integer)
  join public.products product on product.id = requested.product_id;

  return new_order_id;
end;
$$;

revoke all on function public.place_order(text, text, text, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, text, jsonb) to anon, authenticated;

insert into public.products (id, name, description, price, image_url, category, in_stock, featured) values
('classic-canvas-cap', 'Classic Canvas Cap', 'A lightweight everyday cap with an adjustable back strap and breathable cotton canvas.', 24.99, 'hat1.png', 'Hats', true, false),
('sunset-trucker-cap', 'Sunset Trucker Cap', 'A structured trucker cap with a curved peak, soft front panel, and ventilated mesh back.', 29.99, 'hat2.png', 'Hats', true, false),
('heritage-bucket-hat', 'Heritage Bucket Hat', 'A relaxed bucket hat designed for sunny days, finished with a flexible brim and tonal stitching.', 27.50, 'hat3.png', 'Hats', true, false),
('midnight-runner', 'Midnight Runner', 'Responsive street-running shoes with a cushioned sole, secure lace fit, and lightweight upper.', 89.99, 'shoe1.png', 'Shoes', true, false),
('coastline-walker', 'Coastline Walker', 'Comfort-first walking shoes with a supportive heel and durable outsole for daily mileage.', 74.99, 'shoe2.png', 'Shoes', true, false),
('metro-leather-low', 'Metro Leather Low', 'A clean low-profile leather shoe that moves easily between casual days and smart evenings.', 109.99, 'shoe3.png', 'Shoes', true, false),
('pulse-knit-sneaker', 'Pulse Knit Sneaker', 'A flexible knit sneaker with soft lining and balanced cushioning for all-day comfort.', 84.99, 'sneaker1.png', 'Sneakers', true, false),
('streetline-court', 'Streetline Court', 'A court-inspired sneaker with a stable rubber sole and timeless everyday silhouette.', 94.99, 'sneaker2.png', 'Sneakers', true, false),
('aero-stride', 'Aero Stride', 'An energetic performance sneaker built with breathable panels and springy foam cushioning.', 99.99, 'sneaker3.png', 'Sneakers', true, false),
('essential-crew-tee', 'Essential Crew Tee', 'A soft cotton crew-neck T-shirt with a relaxed fit that works alone or as a base layer.', 34.99, 'shirt1.png', 'Shirts', true, false),
('weekend-polo', 'Weekend Polo', 'A breathable polo shirt with a neat collar, easy fit, and understated everyday finish.', 44.99, 'shirt2.png', 'Shirts', true, false),
('city-oxford-shirt', 'City Oxford Shirt', 'A versatile button-down Oxford shirt tailored for a polished look without sacrificing comfort.', 59.99, 'shirt3.png', 'Shirts', true, false),
('straight-leg-denim', 'Straight-Leg Denim', 'Mid-weight straight-leg jeans with classic five-pocket construction and a comfortable rise.', 69.99, 'denim1.png', 'Denim', true, false),
('indigo-taper-jeans', 'Indigo Taper Jeans', 'Deep indigo jeans with a modern tapered leg and a touch of stretch for easy movement.', 74.99, 'denim2.png', 'Denim', true, false),
('vintage-wash-denim', 'Vintage Wash Denim', 'Comfortable denim with a lived-in wash, subtle fading, and a relaxed weekend shape.', 79.99, 'denim3.png', 'Denim', true, false),
('trail-panel-cap', 'Trail Panel Cap', 'A quick-drying panel cap made for active days, with an adjustable fit and compact profile.', 32.99, 'hat4.png', 'Hats', true, false),
('harbor-five-panel', 'Harbor Five-Panel', 'A low-profile five-panel cap with a soft crown and adjustable closure for an easy custom fit.', 31.99, 'hat5.png', 'Hats', true, false),
('everyday-snapback', 'Everyday Snapback', 'A crisp structured snapback with a flat peak and classic shape for casual everyday styling.', 28.99, 'hat6.png', 'Hats', true, false),
('daybreak-sneaker', 'Daybreak Sneaker', 'A bold everyday sneaker combining a streamlined upper with comfortable impact protection.', 99.00, 'sneaker4.png', 'Sneakers', true, true),
('velocity-runner', 'Velocity Runner', 'A lightweight running silhouette with responsive cushioning and confident road-ready grip.', 119.00, 'sneaker6.png', 'Sneakers', true, true),
('cloudstep-low', 'Cloudstep Low', 'A minimal low-top sneaker with cloud-soft cushioning and a versatile premium finish.', 105.00, 'sneaker5.png', 'Sneakers', true, true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  image_url = excluded.image_url,
  category = excluded.category,
  in_stock = excluded.in_stock,
  featured = excluded.featured;

alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.orders;
