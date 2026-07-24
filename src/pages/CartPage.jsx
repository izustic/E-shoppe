import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getImageUrl } from '../utils/images'

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <main className="page-main">
        <div className="empty-state cart-empty">
          <i className="ri-shopping-cart-2-line" aria-hidden="true" />
          <h1>Your cart is empty</h1>
          <p>Add something you love and it will appear here.</p>
          <Link className="primary-button" to="/products">Start shopping</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="page-main">
      <section className="page-section">
        <div className="page-heading cart-page-heading">
          <div>
            <p className="eyebrow">Your selections</p>
            <h1>Shopping Cart</h1>
          </div>
          <button className="text-button danger-text" type="button" onClick={clearCart}>Clear cart</button>
        </div>
        <div className="cart-layout">
          <div className="cart-items">
            {items.map(({ product, quantity }) => (
              <article className="cart-item" key={product.id}>
                <Link className="cart-item-image" to={`/products/${product.id}`}>
                  <img src={getImageUrl(product.image)} alt={product.name} />
                </Link>
                <div className="cart-item-info">
                  <p className="eyebrow">{product.category}</p>
                  <Link to={`/products/${product.id}`}><h2>{product.name}</h2></Link>
                  <p>${product.price.toFixed(2)} each</p>
                </div>
                <label className="quantity-field compact-quantity">
                  <span>Quantity</span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={quantity}
                    onChange={(event) => updateQuantity(product.id, event.target.value)}
                  />
                </label>
                <div className="cart-item-total">
                  <strong>${(product.price * quantity).toFixed(2)}</strong>
                  <button className="text-button danger-text" type="button" onClick={() => removeItem(product.id)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
          <aside className="cart-summary">
            <h2>Order summary</h2>
            <div><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
            <div><span>Shipping</span><span>Calculated later</span></div>
            <div className="summary-total"><span>Total</span><strong>${subtotal.toFixed(2)}</strong></div>
            <button className="primary-button checkout-button" type="button" disabled>Checkout coming soon</button>
            <p>This portfolio demo does not process payments.</p>
          </aside>
        </div>
      </section>
    </main>
  )
}
