const imageModules = import.meta.glob('../../images/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})

const imageUrls = Object.fromEntries(
  Object.entries(imageModules).map(([path, url]) => [path.split('/').pop(), url]),
)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

export const getImageUrl = (fileName) => {
  if (!fileName) return ''
  if (/^(https?:|data:|blob:)/.test(fileName)) return fileName
  if (imageUrls[fileName]) return imageUrls[fileName]
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/product-images/legacy/${encodeURIComponent(fileName)}`
  }
  return fileName
}

export const preloadImages = (fileNames) => Promise.all(
  fileNames.map((fileName) => new Promise((resolve) => {
    const image = new Image()
    image.onload = resolve
    image.onerror = resolve
    image.src = getImageUrl(fileName)

    if (image.complete) resolve()
  })),
)
