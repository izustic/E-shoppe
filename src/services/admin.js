import { supabase } from '../lib/supabase'

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(id, quantity, price_at_order_time, products(id, name))')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) throw error
}

export async function saveProduct(product) {
  const payload = {
    id: product.id.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    name: product.name.trim(),
    description: product.description.trim(),
    price: Number(product.price),
    image_url: product.image_url.trim(),
    category: product.category.trim(),
    in_stock: product.in_stock,
    featured: product.featured,
  }

  const { error } = await supabase.from('products').upsert(payload)
  if (error) throw error
  return payload
}

export async function updateProductFlags(productId, changes) {
  const { error } = await supabase
    .from('products')
    .update(changes)
    .eq('id', productId)

  if (error) throw error
}
