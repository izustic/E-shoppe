import { isSupabaseConfigured, supabase } from '../lib/supabase'

export async function createOrder({ customer, items, total }) {
  if (!isSupabaseConfigured) {
    throw new Error('Online ordering is not configured yet. Please contact the store to place your order.')
  }

  const { data: orderId, error: orderError } = await supabase.rpc('place_order', {
    customer_name: customer.name.trim(),
    phone_number: customer.phone.trim(),
    delivery_address: customer.address.trim(),
    delivery_note: customer.note.trim(),
    items: items.map(({ product, quantity }) => ({
      product_id: product.id,
      quantity,
    })),
  })
  if (orderError) throw orderError

  supabase.functions.invoke('notify-new-order', {
    body: { orderId },
  }).catch(() => {
    // The order is already safely stored; notification failure must not block checkout.
  })

  return {
    id: orderId,
    customer_name: customer.name.trim(),
    total,
  }
}
