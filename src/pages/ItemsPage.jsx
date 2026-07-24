import Pagination from '../components/Pagination'
import ProductGrid from '../components/ProductGrid'
import { products } from '../data/products'
import usePaginatedProducts from '../hooks/usePaginatedProducts'

export default function ItemsPage() {
  const pagination = usePaginatedProducts(products)

  return (
    <main className="page-main">
      <section className="page-section">
        <div className="page-heading">
          <p className="eyebrow">The full collection</p>
          <h1>Item Listings</h1>
          <p>Browse clothing, footwear, and accessories selected for comfort and everyday versatility.</p>
        </div>
        <ProductGrid products={pagination.visibleProducts} loading={pagination.loading} />
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          loading={pagination.loading}
          onChange={pagination.changePage}
        />
      </section>
    </main>
  )
}
