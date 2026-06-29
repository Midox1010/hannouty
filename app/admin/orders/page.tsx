'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'

type OrderItem = {
  id: string
  quantity: number
  unit_price: number
  products: { name: string; image_url: string }
}

type Order = {
  id: string
  user_id: string
  created_at: string
  status: string
  total_amount: number
  discount_amount: number
  final_amount: number
  order_items: OrderItem[]
  client_name?: string
}

const STATUSES = [
  { value: 'pending',    label: 'En attente',   bg: '#fff3e8', color: '#c45f1a' },
  { value: 'confirmed',  label: 'Confirmée',    bg: '#dbeafe', color: '#1e40af' },
  { value: 'delivering', label: 'En livraison', bg: '#ede9fe', color: '#5b21b6' },
  { value: 'delivered',  label: 'Livrée',       bg: '#dcfce7', color: '#166534' },
  { value: 'cancelled',  label: 'Annulée',      bg: '#fee2e2', color: '#991b1b' },
]

export default function AdminOrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  

  useEffect(() => {
    const fetchOrders = async () => {
      // 1. Récupérer les commandes
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id, user_id, created_at, status,
          total_amount, discount_amount, final_amount,
          order_items (
            id, quantity, unit_price,
            products ( name, image_url )
          )
        `)
        .order('created_at', { ascending: false })

      if (error || !ordersData) {
        console.error('Erreur commandes:', error)
        setLoading(false)
        return
      }

      // 2. Extraire les user_ids uniques non-null
      const userIds = [...new Set(ordersData.map(o => o.user_id).filter(Boolean))]
      console.log('[DEBUG] user_ids dans orders:', userIds)

      // 3. Récupérer les profils
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)

      console.log('[DEBUG] profils récupérés:', profilesData)
      console.log('[DEBUG] erreur profils:', profilesError)

      // 4. Map id → full_name
      const profileMap: Record<string, string> = {}
      profilesData?.forEach(p => {
        profileMap[p.id] = p.full_name
      })

      // 5. Enrichir
      const enriched = ordersData.map(o => ({
        ...o,
        client_name: profileMap[o.user_id] || 'Client inconnu',
      }))

      setOrders(enriched as any)
      setLoading(false)
    }

    fetchOrders()
  }, [])

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    const { error } = await supabase
      .from('orders').update({ status: newStatus }).eq('id', orderId)
    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    }
    setUpdating(null)
  }

  const getStatus = (value: string) =>
    STATUSES.find(s => s.value === value) ?? { label: value, bg: '#f0f0f0', color: '#555' }

  const filtered = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid #dbeafe', borderTopColor: '#1d4ed8',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '28px 24px', background: '#f8faff', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>
          Commandes
          <span style={{ fontSize: 13, fontWeight: 400, color: '#9ca3af', marginLeft: 8 }}>
            ({filtered.length} / {orders.length})
          </span>
        </h1>

      </div>

      {/* Filtres statut */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        <button
          onClick={() => setFilterStatus('all')}
          style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
            border: '0.5px solid',
            background: filterStatus === 'all' ? '#1d4ed8' : '#fff',
            color: filterStatus === 'all' ? '#fff' : '#6b7280',
            borderColor: filterStatus === 'all' ? '#1d4ed8' : '#e5e7eb',
            cursor: 'pointer'
          }}
        >
          Toutes ({orders.length})
        </button>
        {STATUSES.map(s => {
          const count = orders.filter(o => o.status === s.value).length
          const active = filterStatus === s.value
          return (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: '0.5px solid',
                background: active ? s.bg : '#fff',
                color: active ? s.color : '#6b7280',
                borderColor: active ? s.color : '#e5e7eb',
                cursor: 'pointer'
              }}
            >
              {s.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#9ca3af', padding: '60px 0', fontSize: 14 }}>
          Aucune commande
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(order => {
            const st = getStatus(order.status)
            const isOpen = expanded === order.id
            const isUpdating = updating === order.id

            return (
              <div key={order.id} style={{
                background: '#fff', border: '0.5px solid #e5e7eb',
                borderRadius: 12, overflow: 'hidden'
              }}>
                {/* En-tête commande */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', gap: 12
                }}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#9ca3af', margin: 0 }}>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '3px 0 2px' }}>
                      {order.client_name}
                    </p>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {/* Select statut */}
                    <select
                      value={order.status}
                      disabled={isUpdating}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      style={{
                        fontSize: 11, fontWeight: 600,
                        padding: '4px 8px', borderRadius: 20,
                        border: `0.5px solid ${st.color}`,
                        background: st.bg, color: st.color,
                        cursor: 'pointer', opacity: isUpdating ? 0.5 : 1
                      }}
                    >
                      {STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>

                    <span style={{ fontSize: 14, fontWeight: 600, color: '#111', minWidth: 90, textAlign: 'right' }}>
                      {(order.final_amount ?? order.total_amount).toFixed(2)} MAD
                    </span>

                    <button
                      onClick={() => setExpanded(isOpen ? null : order.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 12 }}
                    >
                      {isOpen ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {/* Détail produits */}
                {isOpen && (
                  <div style={{
                    borderTop: '0.5px solid #f3f4f6',
                    background: '#f8faff', padding: '16px 18px'
                  }}>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 14, fontFamily: 'monospace' }}>
                      user_id: {order.user_id}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {order.order_items.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {item.products?.image_url ? (
                            <img
                              src={item.products.image_url}
                              alt={item.products.name}
                              style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '0.5px solid #e5e7eb' }}
                            />
                          ) : (
                            <div style={{
                              width: 48, height: 48, borderRadius: 8,
                              background: '#f3f4f6', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: 20
                            }}>🛒</div>
                          )}
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 500, color: '#111', margin: 0 }}>
                              {item.products?.name ?? 'Produit supprimé'}
                            </p>
                            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
                              {item.quantity} × {item.unit_price.toFixed(2)} MAD
                            </p>
                          </div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>
                            {(item.quantity * item.unit_price).toFixed(2)} MAD
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Récap montants */}
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '0.5px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
                        <span>Sous-total</span>
                        <span>{order.total_amount.toFixed(2)} MAD</span>
                      </div>
                      {order.discount_amount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#166534', marginBottom: 4 }}>
                          <span>Réduction fidélité</span>
                          <span>−{order.discount_amount.toFixed(2)} MAD</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: '#111' }}>
                        <span>Total</span>
                        <span>{(order.final_amount ?? order.total_amount).toFixed(2)} MAD</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
