import { Link } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid'
import { useProducts } from '../context/ProductsContext'

export default function HomePage() {
  const { featuredProducts, loading, error } = useProducts()

  return (
    <main>
      <header className="hero">
        <div className="container">
          <p className="eyebrow">Local shopping made easier</p>
          <h1>Welcome to Trolley Dey</h1>
          <p>Browse the store’s curated catalog, place your order online, and get it delivered locally.</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/products">Shop products</Link>
            <Link className="secondary-button" to="/items">Browse items</Link>
          </div>
        </div>
      </header>

      <section className="page-section featured-products-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Available from the store</p>
            <h2>Featured Products</h2>
          </div>
          <Link className="text-link" to="/products">View all products →</Link>
        </div>
        {error && <p className="catalog-notice">{error}</p>}
        <ProductGrid products={featuredProducts} loading={loading} skeletonCount={3} />
      </section>
    </main>
  )
}
