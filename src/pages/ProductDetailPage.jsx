import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { findProduct } from '../data/products'
import { getImageUrl } from '../utils/images'

export default function ProductDetailPage() {
  const { id } = useParams()
  const product = findProduct(id)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

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
            <p className="stock-label"><span /> In stock and ready to ship</p>
            <div className="detail-actions">
              <label className="quantity-field">
                <span>Quantity</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={quantity}
                  onChange={(event) => setQuantity(Math.min(20, Math.max(1, Number(event.target.value) || 1)))}
                />
              </label>
              <button className={`primary-button detail-cart-button${added ? ' added' : ''}`} type="button" onClick={handleAdd}>
                <i className="ri-shopping-cart-2-line" aria-hidden="true" />
                {added ? 'Added to cart' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
