import { Link, useLocation, useParams } from 'react-router-dom'

export default function OrderConfirmationPage() {
  const { id } = useParams()
  const { state } = useLocation()
  const orderNumber = state?.orderNumber ?? id.slice(0, 8).toUpperCase()

  return (
    <main className="page-main">
      <div className="empty-state order-confirmation">
        <span className="confirmation-icon"><i className="fa-solid fa-check" aria-hidden="true" /></span>
        <p className="eyebrow">Order received</p>
        <h1>Thank you{state?.customerName ? `, ${state.customerName}` : ''}!</h1>
        <p>Your order number is <strong>{orderNumber}</strong>.</p>
        <p>We’ll contact you using the phone number provided to confirm availability and delivery.</p>
        <div className="confirmation-actions">
          <Link className="primary-button" to="/products">Continue shopping</Link>
          <Link className="text-link" to="/">Return home</Link>
        </div>
      </div>
    </main>
  )
}
