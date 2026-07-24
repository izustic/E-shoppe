import Pagination from '../components/Pagination'
import ProductGrid from '../components/ProductGrid'
import { useProducts } from '../context/ProductsContext'
import usePaginatedProducts from '../hooks/usePaginatedProducts'

export default function ItemsPage() {
  const { products, loading: catalogLoading, error } = useProducts()
  const pagination = usePaginatedProducts(products)

  return (
    <main className="page-main">
      <section className="page-section">
        <div className="page-heading">
          <p className="eyebrow">The full collection</p>
          <h1>Item Listings</h1>
          <p>Browse the store’s curated selection and add available items to your delivery order.</p>
        </div>
        {error && <p className="catalog-notice">{error}</p>}
        <ProductGrid products={pagination.visibleProducts} loading={catalogLoading || pagination.loading} />
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          loading={catalogLoading || pagination.loading}
          onChange={pagination.changePage}
        />
      </section>
    </main>
  )
}
