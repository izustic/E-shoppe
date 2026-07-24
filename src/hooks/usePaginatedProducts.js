import { useEffect, useMemo, useState } from 'react'
import { preloadImages } from '../utils/images'

const delay = (duration) => new Promise((resolve) => {
  window.setTimeout(resolve, duration)
})

export default function usePaginatedProducts(products, pageSize = 6) {
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize))

  const visibleProducts = useMemo(() => {
    const firstProduct = (currentPage - 1) * pageSize
    return products.slice(firstProduct, firstProduct + pageSize)
  }, [currentPage, pageSize, products])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.all([
      preloadImages(visibleProducts.map((product) => product.image)),
      delay(currentPage === 1 ? 700 : 450),
    ]).then(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [currentPage, visibleProducts])

  const changePage = (page) => {
    if (loading || page === currentPage || page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  return { currentPage, totalPages, visibleProducts, loading, changePage }
}
