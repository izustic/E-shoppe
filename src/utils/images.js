const imageModules = import.meta.glob('../../images/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})

const imageUrls = Object.fromEntries(
  Object.entries(imageModules).map(([path, url]) => [path.split('/').pop(), url]),
)

export const getImageUrl = (fileName) => imageUrls[fileName]

export const preloadImages = (fileNames) => Promise.all(
  fileNames.map((fileName) => new Promise((resolve) => {
    const image = new Image()
    image.onload = resolve
    image.onerror = resolve
    image.src = getImageUrl(fileName)

    if (image.complete) resolve()
  })),
)
