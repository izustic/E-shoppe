import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { createOrder } from '../services/orders'

const initialForm = { name: '', phone: '', address: '', note: '' }

function validate(form) {
  const errors = {}
  if (form.name.trim().length < 2) errors.name = 'Please enter your full name.'
  if (!/^[+\d][\d\s()-]{7,}$/.test(form.phone.trim())) errors.phone = 'Please enter a valid phone number.'
  if (form.address.trim().length < 10) errors.address = 'Please enter a complete delivery address.'
  return errors
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const navigate = useNavigate()

  const unavailableItems = useMemo(
    () => items.filter(({ product }) => product.in_stock === false),
    [items],
  )

  if (items.length === 0) {
    return (
      <main className="page-main">
        <div className="empty-state">
          <h1>Your cart is empty</h1>
          <p>Add groceries before starting checkout.</p>
          <Link className="primary-button" to="/products">Browse products</Link>
        </div>
      </main>
    )
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSubmitError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || unavailableItems.length > 0) return

    setSubmitting(true)
    setSubmitError('')

    try {
      const order = await createOrder({
        customer: form,
        items,
        total: subtotal,
      })
      clearCart()
      navigate(`/order-confirmation/${order.id}`, {
        replace: true,
        state: {
          orderNumber: order.id.slice(0, 8).toUpperCase(),
          customerName: order.customer_name,
          total: order.total,
        },
      })
    } catch (error) {
      setSubmitError(error.message || 'We could not place your order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="page-main">
      <section className="page-section checkout-layout">
        <div>
          <Link className="text-link back-link" to="/cart">← Back to cart</Link>
          <div className="page-heading checkout-heading">
            <p className="eyebrow">Local delivery</p>
            <h1>Checkout</h1>
            <p>No account is required. We’ll use these details only to confirm and deliver this order.</p>
          </div>
          <form className="contact-form checkout-form" noValidate onSubmit={handleSubmit}>
            <label>
              <span>Full name *</span>
              <input name="name" autoComplete="name" value={form.name} onChange={updateField} aria-invalid={Boolean(errors.name)} />
              {errors.name && <small className="field-error">{errors.name}</small>}
            </label>
            <label>
              <span>Phone number *</span>
              <input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={updateField} aria-invalid={Boolean(errors.phone)} />
              {errors.phone && <small className="field-error">{errors.phone}</small>}
            </label>
            <label>
              <span>Delivery address *</span>
              <textarea name="address" rows="4" autoComplete="street-address" value={form.address} onChange={updateField} aria-invalid={Boolean(errors.address)} />
              {errors.address && <small className="field-error">{errors.address}</small>}
            </label>
            <label>
              <span>Delivery note <small>(optional)</small></span>
              <textarea name="note" rows="3" value={form.note} onChange={updateField} placeholder="Landmark, gate instructions, or preferred contact method" />
            </label>
            <div className="payment-method">
              <i className="fa-solid fa-money-bill-transfer" aria-hidden="true" />
              <div>
                <strong>Cash/Transfer on Delivery</strong>
                <span>No online payment is collected. The store will confirm the method with you.</span>
              </div>
            </div>
            {unavailableItems.length > 0 && (
              <p className="form-alert">Remove out-of-stock items before placing your order.</p>
            )}
            {submitError && <p className="form-alert" role="alert">{submitError}</p>}
            <button className="primary-button" type="submit" disabled={submitting || unavailableItems.length > 0}>
              {submitting ? 'Placing order…' : 'Place order'}
            </button>
          </form>
        </div>
        <aside className="cart-summary checkout-summary">
          <h2>Order summary</h2>
          {items.map(({ product, quantity }) => (
            <div className="checkout-summary-item" key={product.id}>
              <span>{quantity}× {product.name}</span>
              <strong>${(product.price * quantity).toFixed(2)}</strong>
            </div>
          ))}
          <div className="summary-total"><span>Total</span><strong>${subtotal.toFixed(2)}</strong></div>
          <p>Delivery details and timing will be confirmed by phone.</p>
        </aside>
      </section>
    </main>
  )
}
