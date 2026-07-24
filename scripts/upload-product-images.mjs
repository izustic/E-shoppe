import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'
import WebSocket from 'ws'
import { products } from '../src/data/products.js'

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const bucket = 'product-images'

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.migration')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: WebSocket },
})

const contentTypes = {
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

for (const product of products) {
  const imagePath = new URL(`../images/${product.image}`, import.meta.url)
  const image = await readFile(imagePath)
  const extension = product.image.split('.').pop().toLowerCase()
  const storagePath = `legacy/${product.image}`

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, image, {
      contentType: contentTypes[extension] ?? 'application/octet-stream',
      cacheControl: '31536000',
      upsert: true,
    })

  if (uploadError) throw new Error(`Could not upload ${product.image}: ${uploadError.message}`)

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath)
  const { error: updateError } = await supabase
    .from('products')
    .update({ image_url: data.publicUrl })
    .eq('id', product.id)

  if (updateError) throw new Error(`Could not update ${product.id}: ${updateError.message}`)
  console.log(`Uploaded ${product.image}`)
}

console.log(`Migrated ${products.length} product images to Supabase Storage.`)
