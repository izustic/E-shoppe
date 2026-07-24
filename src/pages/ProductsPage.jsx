import { useMemo, useState } from 'react'
import ProductGrid from '../components/ProductGrid'
import { useProducts } from '../context/ProductsContext'

export default function ProductsPage() {
  const { products, loading, error } = useProducts()
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()

  const filteredProducts = useMemo(() => (
    products.filter((product) => (
      product.name.toLowerCase().includes(normalizedQuery)
      || product.category.toLowerCase().includes(normalizedQuery)
    ))
  ), [normalizedQuery])

  return (
    <main className="page-main">
      <section className="page-section">
        <div className="page-heading products-heading">
          <div>
            <p className="eyebrow">Find what you need</p>
            <h1>Products</h1>
            <p>Search by product name or category.</p>
          </div>
          <label className="search-field">
            <span className="sr-only">Search products</span>
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              type="search"
              value={query}
              placeholder="Search products..."
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        {error && <p className="catalog-notice">{error}</p>}
        <p className="results-count">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </p>

        {filteredProducts.length > 0
          ? <ProductGrid products={filteredProducts} loading={loading} />
          : (
            <div className="empty-state">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <h2>No matching products</h2>
              <p>Try a different product name or category.</p>
              <button className="primary-button" type="button" onClick={() => setQuery('')}>Clear search</button>
            </div>
          )}
      </section>
    </main>
  )
}
