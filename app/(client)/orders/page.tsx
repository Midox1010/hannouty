'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  IconShoppingBag,
  IconPackage,
  IconTruck,
  IconCheck,
  IconX,
  IconClock,
  IconChevronDown,
  IconChevronUp,
  IconBell,
} from '@tabler/icons-react'

type OrderItem = {
  id: string
  quantity: number
  unit_price: number
  subtotal: number
  products: { name: string; image_url: string | null } | null
}

type Order = {
  id: string
  status: string
  total_amount: number
  discount_amount: number
  final_amount: number
  created_at: string
  order_items: OrderItem[]
}

type Toast = {
  id: string
  orderId: string
  newStatus: string
}

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; stepperIcon: React.ReactNode }> = {
  pending:    { label: 'En attente',   badgeClass: 'badge-pending',   stepperIcon: <IconClock size={14} /> },
  confirmed:  { label: 'Confirmée',    badgeClass: 'badge-confirmed', stepperIcon: <IconCheck size={14} /> },
  delivering: { label: 'En livraison', badgeClass: 'badge-shipped',   stepperIcon: <IconTruck size={14} /> },
  delivered:  { label: 'Livrée',       badgeClass: 'badge-delivered', stepperIcon: <IconPackage size={14} /> },
  cancelled:  { label: 'Annulée',      badgeClass: 'badge-cancelled', stepperIcon: <IconX size={14} /> },
}

const STEPPER_STEPS = ['pending', 'confirmed', 'delivering', 'delivered']

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const router = useRouter()
  const supabase = createClient()

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('orders')
        .select(`
          id, status, total_amount, discount_amount, final_amount, created_at,
          order_items(id, quantity, unit_price, subtotal, products(name, image_url))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setOrders(data as any)
      setLoading(false)

      const channel = supabase
        .channel('orders-realtime')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const updated = payload.new as { id: string; status: string }
            const old = payload.old as { id: string; status: string }

            setOrders(prev =>
              prev.map(o => o.id === updated.id ? { ...o, status: updated.status } : o)
            )

            if (old.status !== updated.status) {
              const toastId = crypto.randomUUID()
              setToasts(prev => [...prev, { id: toastId, orderId: updated.id, newStatus: updated.status }])
              setTimeout(() => removeToast(toastId), 5000)
            }
          }
        )
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    load()
  }, [])

  return (
    <div className="container animate-fade-in" style={{ paddingBlock: 'var(--space-xl)' }}>

      {/* ── Toasts ── */}
      <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(toast => {
          const st = STATUS_CONFIG[toast.newStatus] ?? { label: toast.newStatus, badgeClass: '' }
          return (
            <div
              key={toast.id}
              className="card animate-slide-right"
              style={{ padding: 'var(--space-md)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)', minWidth: 300, boxShadow: 'var(--shadow-lg)' }}
            >
              <div
                style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: 'var(--color-brand-green-pale)',
                  color: 'var(--color-brand-green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <IconBell size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>Commande mise à jour</p>
                <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 2 }}>
                  #{toast.orderId.slice(0, 8).toUpperCase()} →{' '}
                  <span className={`badge ${st.badgeClass}`}>{st.label}</span>
                </p>
              </div>
              <button onClick={() => removeToast(toast.id)} className="btn-icon-sm" style={{ background: 'none', color: 'var(--color-text-muted)' }}>
                <IconX size={14} />
              </button>
            </div>
          )
        })}
      </div>

      {/* ── Header ── */}
      <div className="flex-between" style={{ marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1>Mes commandes</h1>
          {!loading && (
            <p className="text-muted" style={{ marginTop: 4 }}>
              {orders.length} commande{orders.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Mise à jour en temps réel
        </div>
      </div>

      {/* ── Contenu ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ padding: 'var(--space-lg)' }}>
              <div className="skeleton" style={{ height: 14, width: '30%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 12, width: '50%' }} />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><IconShoppingBag size={40} /></div>
          <h3>Aucune commande</h3>
          <p>Parcourez notre catalogue et passez votre première commande</p>
          <Link href="/products" className="btn btn-primary btn-md" style={{ marginTop: 'var(--space-md)' }}>
            Voir les produits
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {orders.map(order => {
            const status = STATUS_CONFIG[order.status] ?? { label: order.status, badgeClass: '', stepperIcon: null }
            const isExpanded = expandedId === order.id
            const isCancelled = order.status === 'cancelled'
            const currentStep = STEPPER_STEPS.indexOf(order.status)

            return (
              <div key={order.id} className="card" style={{ overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-lg)' }}
                >
                  <div className="flex-between" style={{ gap: 'var(--space-md)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`badge ${status.badgeClass}`}>{status.label}</span>
                      </div>
                      <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {order.order_items.map(i => `${i.products?.name ?? 'Produit'} ×${i.quantity}`).join(' · ')}
                      </p>
                      <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-brand-green)' }}>
                        {order.final_amount.toFixed(2)}
                        <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 3 }}>MAD</span>
                      </p>
                      {order.discount_amount > 0 && (
                        <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: 2 }}>
                          Économie : {order.discount_amount.toFixed(2)} MAD
                        </p>
                      )}
                      <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 6, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                        {isExpanded ? <><IconChevronUp size={13} /> Réduire</> : <><IconChevronDown size={13} /> Détails</>}
                      </p>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--space-lg)', background: 'var(--color-bg)' }}>

                    {/* Stepper */}
                    {!isCancelled && (
                      <div className="order-stepper" style={{ marginBottom: 'var(--space-lg)' }}>
                        {STEPPER_STEPS.map((step, idx) => {
                          const isDone = idx < currentStep
                          const isActive = idx === currentStep
                          const st = STATUS_CONFIG[step]
                          return (
                            <div key={step} className={`step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                              <div className="step-dot">{isDone ? <IconCheck size={14} /> : st.stepperIcon}</div>
                              <span className="step-label">{st.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Articles */}
                    <p className="text-label" style={{ marginBottom: 'var(--space-md)' }}>Articles commandés</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                      {order.order_items.map(item => (
                        <div key={item.id} className="flex-between" style={{ padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--color-border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 'var(--radius-md)',
                              background: 'var(--color-surface)',
                              border: '1px solid var(--color-border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              overflow: 'hidden', flexShrink: 0,
                            }}>
                              {item.products?.image_url ? (
                                <img src={item.products.image_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
                              ) : (
                                <IconShoppingBag size={16} style={{ color: 'var(--color-text-muted)' }} />
                              )}
                            </div>
                            <div>
                              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.products?.name ?? 'Produit'}</p>
                              <p className="text-muted" style={{ fontSize: '0.75rem' }}>{item.unit_price.toFixed(2)} MAD × {item.quantity}</p>
                            </div>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{item.subtotal.toFixed(2)} MAD</span>
                        </div>
                      ))}
                    </div>

                    {/* Récap prix */}
                    <div className="price-summary" style={{ marginTop: 'var(--space-lg)' }}>
                      <div className="price-row">
                        <span className="label">Sous-total</span>
                        <span className="value">{order.total_amount.toFixed(2)} MAD</span>
                      </div>
                      {order.discount_amount > 0 && (
                        <div className="price-row discount">
                          <span className="label">Réduction fidélité</span>
                          <span className="value">−{order.discount_amount.toFixed(2)} MAD</span>
                        </div>
                      )}
                      <div className="price-row total">
                        <span className="label">Total</span>
                        <span className="value">{order.final_amount.toFixed(2)} MAD</span>
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
