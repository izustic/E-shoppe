import { supabase } from '../lib/supabase'

const productImageBucket = 'product-images'
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const maximumImageSize = 5 * 1024 * 1024

export async function uploadProductImage(file) {
  if (!allowedImageTypes.includes(file.type)) {
    throw new Error('Choose a JPG, PNG, WebP, or GIF image.')
  }

  if (file.size > maximumImageSize) {
    throw new Error('Product images must be 5 MB or smaller.')
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'product'
  const path = `products/${crypto.randomUUID()}-${safeName}.${extension}`

  const { error } = await supabase.storage
    .from(productImageBucket)
    .upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    })

  if (error) throw error

  const { data } = supabase.storage.from(productImageBucket).getPublicUrl(path)
  return data.publicUrl
}

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
