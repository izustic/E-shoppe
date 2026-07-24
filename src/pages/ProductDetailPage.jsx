import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import { getImageUrl } from '../utils/images'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { findProduct, loading } = useProducts()
  const product = findProduct(id)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  if (loading) {
    return <main className="page-main"><div className="empty-state"><p>Loading product…</p></div></main>
  }

  if (!product) {
    return (
      <main className="page-main">
        <div className="empty-state">
          <h1>Product not found</h1>
          <p>The product you requested is no longer available.</p>
          <Link className="primary-button" to="/products">Back to products</Link>
        </div>
      </main>
    )
  }

  const handleAdd = () => {
    if (!product.in_stock) return
    addItem(product, quantity)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1400)
  }

  return (
    <main className="page-main">
      <section className="page-section product-detail">
        <Link className="text-link back-link" to="/products">← Back to products</Link>
        <div className="product-detail-grid">
          <div className="product-detail-image">
            <img src={getImageUrl(product.image)} alt={product.name} />
          </div>
          <div className="product-detail-copy">
            <p className="eyebrow">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="detail-price">${product.price.toFixed(2)}</p>
            <p className="detail-description">{product.description}</p>
            <p className={`stock-label${product.in_stock ? '' : ' out-of-stock'}`}>
              <span /> {product.in_stock ? 'In stock and ready for delivery' : 'Currently out of stock'}
            </p>
            <div className="detail-actions">
              <label className="quantity-field">
                <span>Quantity</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={quantity}
                  disabled={!product.in_stock}
                  onChange={(event) => setQuantity(Math.min(20, Math.max(1, Number(event.target.value) || 1)))}
                />
              </label>
              <button
                className={`primary-button detail-cart-button${added ? ' added' : ''}`}
                type="button"
                disabled={!product.in_stock}
                onClick={handleAdd}
              >
                <i className="ri-shopping-cart-2-line" aria-hidden="true" />
                {!product.in_stock ? 'Out of Stock' : added ? 'Added to cart' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
