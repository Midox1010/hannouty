'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  oldStatus: string
  newStatus: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending:    { label: 'En attente',   color: 'bg-orange-50 text-orange-700 border-orange-200',  icon: '⏳' },
  confirmed:  { label: 'Confirmée',    color: 'bg-blue-50 text-blue-700 border-blue-200',         icon: '✅' },
  delivering: { label: 'En livraison', color: 'bg-purple-50 text-purple-700 border-purple-200',   icon: '🚚' },
  delivered:  { label: 'Livrée',       color: 'bg-green-50 text-green-700 border-green-200',      icon: '📦' },
  cancelled:  { label: 'Annulée',      color: 'bg-red-50 text-red-600 border-red-200',            icon: '❌' },
}

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
    let userId: string | null = null

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      userId = user.id

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

      // Supabase Realtime — écouter les changements de statut
      const channel = supabase
        .channel('orders-realtime')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as { id: string; status: string }
            const old = payload.old as { id: string; status: string }

            // Mettre à jour le statut dans la liste
            setOrders(prev =>
              prev.map(o =>
                o.id === updated.id ? { ...o, status: updated.status } : o
              )
            )

            // Afficher une notification toast si le statut a changé
            if (old.status !== updated.status) {
              const toastId = crypto.randomUUID()
              setToasts(prev => [...prev, {
                id: toastId,
                orderId: updated.id,
                oldStatus: old.status,
                newStatus: updated.status,
              }])
              // Supprimer le toast après 5 secondes
              setTimeout(() => removeToast(toastId), 5000)
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    load()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Toasts notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => {
          const newStatus = STATUS_CONFIG[toast.newStatus] ?? { label: toast.newStatus, icon: '•' }
          return (
            <div
              key={toast.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-lg px-4 py-3 flex items-start gap-3 min-w-[300px] animate-slide-in"
            >
              <span className="text-2xl">{newStatus.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Commande mise à jour</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  #{toast.orderId.slice(0, 8).toUpperCase()} → <span className="font-medium text-gray-700">{newStatus.label}</span>
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-300 hover:text-gray-500 text-lg leading-none mt-0.5"
              >×</button>
            </div>
          )
        })}
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Mes commandes</h1>
            {!loading && (
              <p className="text-sm text-gray-400 mt-0.5">{orders.length} commande{orders.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          {/* Indicateur temps réel */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Mise à jour en temps réel
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">🛍️</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Aucune commande</h2>
            <p className="text-sm text-gray-400 mb-6">Parcourez notre catalogue et passez votre première commande</p>
            <Link href="/products"
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors">
              Voir les produits
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const status = STATUS_CONFIG[order.status] ?? { label: order.status, color: 'bg-gray-50 text-gray-600 border-gray-200', icon: '•' }
              const isExpanded = expandedId === order.id
              const itemsLabel = order.order_items
                .map(i => `${i.products?.name ?? 'Produit'} ×${i.quantity}`)
                .join(' · ')

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-colors">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="w-full text-left p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-mono text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}>
                            {status.icon} {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">{itemsLabel}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-gray-900">{order.final_amount.toFixed(2)} <span className="text-sm font-normal text-gray-400">MAD</span></p>
                        {order.discount_amount > 0 && (
                          <p className="text-xs text-green-600 mt-0.5">Économie : {order.discount_amount.toFixed(2)} MAD</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{isExpanded ? '▲ Réduire' : '▼ Détails'}</p>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-50 px-5 pb-5 pt-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Articles commandés</p>
                      <div className="space-y-2">
                        {order.order_items.map(item => (
                          <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">
                                {item.products?.image_url ? (
                                  <img src={item.products.image_url} className="w-full h-full object-contain rounded-lg" alt="" />
                                ) : '🛒'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.products?.name ?? 'Produit'}</p>
                                <p className="text-xs text-gray-400">{item.unit_price.toFixed(2)} MAD × {item.quantity}</p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{item.subtotal.toFixed(2)} MAD</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Sous-total</span><span>{order.total_amount.toFixed(2)} MAD</span>
                        </div>
                        {order.discount_amount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Réduction fidélité</span><span>−{order.discount_amount.toFixed(2)} MAD</span>
                          </div>
                        )}
                        <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                          <span>Total</span><span>{order.final_amount.toFixed(2)} MAD</span>
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
    </div>
  )
}
