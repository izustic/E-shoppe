import ProductCard, { ProductCardSkeleton } from './ProductCard'

export default function ProductGrid({ products, loading = false, skeletonCount = 6 }) {
  return (
    <div className="content-wrap" aria-busy={loading} aria-live="polite">
      {loading
        ? Array.from({ length: skeletonCount }, (_, index) => (
          <ProductCardSkeleton key={`skeleton-${index}`} />
        ))
        : products.map((product) => <ProductCard product={product} key={product.id} />)}
    </div>
  )
}
