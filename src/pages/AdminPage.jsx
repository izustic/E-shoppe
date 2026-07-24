import { useEffect, useState } from 'react'
import AdminLogin from '../components/admin/AdminLogin'
import AdminOrders from '../components/admin/AdminOrders'
import AdminProducts from '../components/admin/AdminProducts'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [tab, setTab] = useState('orders')

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  if (!isSupabaseConfigured) {
    return (
      <main className="page-main">
        <div className="empty-state">
          <h1>Admin setup required</h1>
          <p>Add the Supabase URL and anon key to the environment before using staff administration.</p>
          <code>VITE_SUPABASE_URL · VITE_SUPABASE_ANON_KEY</code>
        </div>
      </main>
    )
  }

  if (loading) return <main className="page-main"><div className="empty-state"><p>Checking staff session…</p></div></main>
  if (!session) return <AdminLogin />

  return (
    <main className="page-main admin-page">
      <section className="page-section">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Store operations</p>
            <h1>Trolley Dey Admin</h1>
            <p>{session.user.email}</p>
          </div>
          <button className="text-button danger-text" type="button" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
        <div className="admin-tabs" role="tablist" aria-label="Admin sections">
          <button className={tab === 'orders' ? 'active' : ''} type="button" role="tab" aria-selected={tab === 'orders'} onClick={() => setTab('orders')}>Orders</button>
          <button className={tab === 'products' ? 'active' : ''} type="button" role="tab" aria-selected={tab === 'products'} onClick={() => setTab('products')}>Products</button>
        </div>
        {tab === 'orders' ? <AdminOrders /> : <AdminProducts />}
      </section>
    </main>
  )
}
