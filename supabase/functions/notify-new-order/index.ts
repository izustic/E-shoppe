import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const escapeHtml = (value: unknown) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId } = await request.json()
    if (!orderId) throw new Error('An orderId is required.')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: order, error } = await supabase
      .from('orders')
      .select('id, customer_name, phone_number, delivery_address, delivery_note, total, payment_method, order_items(quantity, price_at_order_time, products(name))')
      .eq('id', orderId)
      .single()

    if (error || !order) throw error ?? new Error('Order not found.')

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const ownerEmail = Deno.env.get('OWNER_NOTIFICATION_EMAIL')
    const fromEmail = Deno.env.get('NOTIFICATION_FROM_EMAIL') ?? 'Trolley Dey <orders@example.com>'

    if (!resendApiKey || !ownerEmail) {
      throw new Error('Notification secrets are not configured.')
    }

    const items = order.order_items
      .map((item) => `${item.quantity}× ${escapeHtml(item.products?.name ?? 'Product')} — ₦${Number(item.price_at_order_time).toFixed(2)}`)
      .join('<br>')

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'trolley-dey-orders/1.0',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [ownerEmail],
        subject: `New Trolley Dey order ${order.id.slice(0, 8).toUpperCase()}`,
        html: `
          <h2>New grocery order</h2>
          <p><strong>Customer:</strong> ${escapeHtml(order.customer_name)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(order.phone_number)}</p>
          <p><strong>Address:</strong> ${escapeHtml(order.delivery_address)}</p>
          <p><strong>Note:</strong> ${escapeHtml(order.delivery_note || 'None')}</p>
          <p><strong>Items:</strong><br>${items}</p>
          <p><strong>Total:</strong> ₦${Number(order.total).toFixed(2)}</p>
          <p><strong>Payment:</strong> Cash/Transfer on delivery</p>
        `,
      }),
    })

    if (!response.ok) throw new Error(await response.text())

    return new Response(JSON.stringify({ notified: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Notification failed.'
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
