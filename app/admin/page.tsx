'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import Link from 'next/link'

type Stats = {
  totalOrders: number
  totalRevenue: number
  totalClients: number
  pendingOrders: number
}

const STATUS: Record<string, { label: string; bg: string; color: string }> = {
  pending:    { label: 'En attente',   bg: '#fff3e8', color: '#c45f1a' },
  confirmed:  { label: 'Confirmée',    bg: '#dbeafe', color: '#1e40af' },
  delivering: { label: 'En livraison', bg: '#ede9fe', color: '#5b21b6' },
  delivered:  { label: 'Livrée',       bg: '#dcfce7', color: '#166534' },
  cancelled:  { label: 'Annulée',      bg: '#fee2e2', color: '#991b1b' },
}

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, totalClients: 0, pendingOrders: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const { count: totalOrders } = await supabase
        .from('orders').select('*', { count: 'exact', head: true })

      const { data: revenueData } = await supabase
        .from('orders').select('total_amount')

      const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0

      const { count: totalClients } = await supabase
        .from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client')

      const { count: pendingOrders } = await supabase
        .from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending')

      const { data: recent } = await supabase
        .from('orders')
        .select('id, created_at, status, total_amount, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({ totalOrders: totalOrders || 0, totalRevenue, totalClients: totalClients || 0, pendingOrders: pendingOrders || 0 })
      setRecentOrders(recent || [])
      setLoading(false)
    }
    fetchStats()
  }, [])

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

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 24px', background: '#f8faff', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>{today}</p>
        </div>
        <Link href="/admin/add-product" style={{
          background: '#fbbf24', color: '#1a1a1a',
          borderRadius: 8, padding: '8px 16px',
          fontWeight: 600, fontSize: 13, textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 6
        }}>
          + Ajouter un produit
        </Link>
      </div>

      {/* Cartes stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Commandes', value: stats.totalOrders, unit: '', accent: '#1d4ed8', bg: '#dbeafe', icon: '📦' },
          { label: "Chiffre d'affaires", value: stats.totalRevenue.toFixed(0), unit: ' MAD', accent: '#1d4ed8', bg: '#dbeafe', icon: '📈' },
          { label: 'Clients', value: stats.totalClients, unit: '', accent: '#1d4ed8', bg: '#dbeafe', icon: '👥' },
          { label: 'En attente', value: stats.pendingOrders, unit: '', accent: '#c45f1a', bg: '#fff3e8', icon: '⏳' },
        ].map((card) => (
          <div key={card.label} style={{
            background: '#fff', border: '0.5px solid #e5e7eb',
            borderRadius: 12, padding: '16px',
            borderTop: `3px solid ${card.accent}`, overflow: 'hidden'
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: card.bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 14, marginBottom: 10
            }}>
              {card.icon}
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 4px' }}>{card.label}</p>
            <p style={{ fontSize: 22, fontWeight: 600, color: card.accent, margin: 0 }}>
              {card.value}
              {card.unit && <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af', marginLeft: 3 }}>{card.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Dernières commandes */}
      <div style={{
        background: '#fff', border: '0.5px solid #e5e7eb',
        borderRadius: 12, overflow: 'hidden', marginBottom: 20
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '0.5px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: 0 }}>Dernières commandes</h2>
          <Link href="/admin/orders" style={{ fontSize: 12, color: '#1d4ed8', textDecoration: 'none' }}>
            Voir tout →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0', fontSize: 13 }}>Aucune commande</p>
        ) : (
          recentOrders.map((order) => {
            const st = STATUS[order.status] ?? { label: order.status, bg: '#f0f0f0', color: '#555' }
            return (
              <div key={order.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 18px', borderBottom: '0.5px solid #f3f4f6', gap: 12
              }}>
                <div>
                  <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#9ca3af', margin: 0 }}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p style={{ fontSize: 13, color: '#111', margin: '2px 0 0', fontWeight: 500 }}>
                    {order.profiles?.full_name || 'Client inconnu'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    padding: '3px 10px', borderRadius: 20,
                    background: st.bg, color: st.color
                  }}>
                    {st.label}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111', minWidth: 90, textAlign: 'right' }}>
                    {order.total_amount.toFixed(2)} MAD
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Accès rapide */}
      <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
        Accès rapide
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { href: '/admin/orders', icon: '📋', label: 'Commandes', sub: 'Gérer les statuts' },
          { href: '/admin/products', icon: '📦', label: 'Produits', sub: 'Catalogue' },
          { href: '/admin/clients', icon: '👥', label: 'Clients', sub: 'Niveaux fidélité' },
          { href: '/admin/add-product', icon: '➕', label: 'Ajouter', sub: 'Nouveau produit' },
        ].map((item) => (
          <Link key={item.href} href={item.href} style={{
            background: '#fff', border: '0.5px solid #e5e7eb',
            borderRadius: 12, padding: '14px', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#dbeafe', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 15, flexShrink: 0
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{item.label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{item.sub}</div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
