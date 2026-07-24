import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getOrders, updateOrderStatus } from '../../services/admin'

const statuses = ['new', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled']
const statusLabel = (status) => status.replaceAll('_', ' ')

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const refresh = () => {
      getOrders()
        .then(setOrders)
        .catch((queryError) => setError(queryError.message))
        .finally(() => setLoading(false))
    }

    refresh()

    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, refresh)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const changeStatus = async (orderId, status) => {
    const previousOrders = orders
    setOrders((current) => current.map((order) => (
      order.id === orderId ? { ...order, status } : order
    )))

    try {
      await updateOrderStatus(orderId, status)
    } catch (updateError) {
      setOrders(previousOrders)
      setError(updateError.message)
    }
  }

  if (loading) return <p className="admin-loading">Loading orders…</p>

  return (
    <section className="admin-panel">
      <div className="admin-section-heading">
        <div>
          <h2>Incoming orders</h2>
          <p>Review delivery details and update fulfillment status.</p>
        </div>
        <span>{orders.length} total</span>
      </div>
      {error && <p className="form-alert" role="alert">{error}</p>}
      {orders.length === 0
        ? <p className="admin-empty">No orders have arrived yet.</p>
        : (
          <div className="admin-order-list">
            {orders.map((order) => (
              <article className="admin-order" key={order.id}>
                <div className="admin-order-topline">
                  <div>
                    <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>
                    <span>{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                  <select value={order.status} onChange={(event) => changeStatus(order.id, event.target.value)}>
                    {statuses.map((status) => <option value={status} key={status}>{statusLabel(status)}</option>)}
                  </select>
                </div>
                <div className="admin-order-details">
                  <div>
                    <span>Customer</span>
                    <strong>{order.customer_name}</strong>
                    <a href={`tel:${order.phone_number}`}>{order.phone_number}</a>
                  </div>
                  <div>
                    <span>Delivery address</span>
                    <strong>{order.delivery_address}</strong>
                    <small>{order.delivery_note || 'No delivery note'}</small>
                  </div>
                  <div>
                    <span>Order items</span>
                    {order.order_items.map((item) => (
                      <small key={item.id}>{item.quantity}× {item.products?.name ?? 'Removed product'}</small>
                    ))}
                  </div>
                  <div>
                    <span>Total</span>
                    <strong>${Number(order.total).toFixed(2)}</strong>
                    <small>Cash/Transfer on delivery</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
    </section>
  )
}
