import { Link } from 'react-router-dom'
import ProductGrid from '../components/ProductGrid'
import { featuredProducts } from '../data/products'

export default function HomePage() {
  return (
    <main>
      <header className="hero">
        <div className="container">
          <p className="eyebrow">Style for every day</p>
          <h1>Welcome to Trolley Dey</h1>
          <p>Fresh wardrobe essentials, comfortable footwear, and accessories picked for real life.</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/products">Shop products</Link>
            <Link className="secondary-button" to="/items">Browse items</Link>
          </div>
        </div>
      </header>

      <section className="page-section featured-products-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Popular right now</p>
            <h2>Featured Products</h2>
          </div>
          <Link className="text-link" to="/products">View all products →</Link>
        </div>
        <ProductGrid products={featuredProducts} skeletonCount={3} />
      </section>
    </main>
  )
}
