import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getImageUrl } from '../utils/images'

export function ProductCardSkeleton() {
  return (
    <article className="card" aria-hidden="true">
      <div className="card-header animated-bg">&nbsp;</div>
      <div className="card-content">
        <div className="card-title skeleton-title animated-bg animated-bg-text">&nbsp;</div>
        <div className="card-excerpt skeleton-copy">
          <span className="span animated-bg animated-bg-text">&nbsp;</span>
          <span className="span animated-bg animated-bg-text">&nbsp;</span>
          <span className="span animated-bg animated-bg-text">&nbsp;</span>
        </div>
        <div className="author">
          <div className="profile-img animated-bg">&nbsp;</div>
          <div className="author-info">
            <span className="animated-bg animated-bg-text">&nbsp;</span>
            <span className="animated-bg animated-bg-text">&nbsp;</span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function ProductCard({ product }) {
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const handleAdd = () => {
    if (!product.in_stock) return
    addItem(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="card product-card">
      <Link className="card-header product-image-link" to={`/products/${product.id}`}>
        <img src={getImageUrl(product.image)} alt={product.name} />
        {!product.in_stock && <span className="stock-badge">Out of Stock</span>}
      </Link>
      <div className="card-content">
        <Link className="product-title-link" to={`/products/${product.id}`}>
          <h3 className="card-title">{product.name}</h3>
        </Link>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <p className="card-excerpt">{product.description}</p>
        <button
          className={`add-cart-button${added ? ' added' : ''}`}
          type="button"
          disabled={!product.in_stock}
          onClick={handleAdd}
        >
          <i className="ri-shopping-cart-2-line" aria-hidden="true" />
          {!product.in_stock ? 'Out of Stock' : added ? 'Added to cart' : 'Add to Cart'}
        </button>
      </div>
    </article>
  )
}
