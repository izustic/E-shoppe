import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { products as fallbackProducts } from '../data/products'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const ProductsContext = createContext(null)

const normalizeProduct = (product) => ({
  ...product,
  price: Number(product.price),
  image: product.image_url ?? product.image,
  image_url: product.image_url ?? product.image,
  in_stock: product.in_stock ?? true,
  featured: product.featured ?? false,
})

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(fallbackProducts.map(normalizeProduct))
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')

  const refreshProducts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setProducts(fallbackProducts.map(normalizeProduct))
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error: queryError } = await supabase
      .from('products')
      .select('*')
      .order('name')

    if (queryError) {
      setError('The live catalog is temporarily unavailable. Showing the local catalog instead.')
      setProducts(fallbackProducts.map(normalizeProduct))
    } else {
      setError('')
      setProducts((data ?? []).map(normalizeProduct))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refreshProducts()
  }, [refreshProducts])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    const channel = supabase
      .channel('storefront-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, refreshProducts)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshProducts])

  const value = useMemo(() => ({
    products,
    featuredProducts: products.filter((product) => product.featured),
    loading,
    error,
    isLive: isSupabaseConfigured && !error,
    findProduct: (id) => products.find((product) => product.id === id),
    refreshProducts,
  }), [error, loading, products, refreshProducts])

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (!context) throw new Error('useProducts must be used inside ProductsProvider')
  return context
}
