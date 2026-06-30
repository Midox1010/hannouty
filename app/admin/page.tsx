'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import Link from 'next/link'
import {
  IconPackage,
  IconCoin,
  IconUsers,
  IconClock,
  IconArrowRight,
  IconUser,
  IconListDetails,
  IconShoppingBag,
  IconPlus,
} from '@tabler/icons-react'

type Stats = {
  totalOrders: number
  totalRevenue: number
  totalClients: number
  pendingOrders: number
}

const STATUS: Record<string, { label: string; badgeClass: string }> = {
  pending:    { label: 'En attente',   badgeClass: 'badge-pending' },
  confirmed:  { label: 'Confirmée',    badgeClass: 'badge-confirmed' },
  delivering: { label: 'En livraison', badgeClass: 'badge-shipped' },
  delivered:  { label: 'Livrée',       badgeClass: 'badge-delivered' },
  cancelled:  { label: 'Annulée',      badgeClass: 'badge-cancelled' },
}

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, totalClients: 0, pendingOrders: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [firstName, setFirstName] = useState('Admin')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        if (profile?.full_name) {
          setFirstName(profile.full_name.split(' ')[0])
        }
      }

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
        .select('id, created_at, status, total_amount, profiles!orders_user_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({ totalOrders: totalOrders || 0, totalRevenue, totalClients: totalClients || 0, pendingOrders: pendingOrders || 0 })
      setRecentOrders(recent || [])
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBlock: 'var(--space-xl)' }}>

      {/* ── Header ── */}
      <div className="flex-between" style={{ marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1>Bonjour, {firstName}</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>
            Voici un aperçu de l'activité de votre boutique
          </p>
        </div>
        <Link href="/admin/add-product" className="btn btn-gold btn-md">
          <IconPlus size={18} />
          Ajouter un produit
        </Link>
      </div>

      {/* ── Cartes stats ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
        }}
      >
        {/* Commandes */}
        <div className="card card-stat">
          <div className="stat-icon" style={{ background: 'var(--color-brand-green-pale)', color: 'var(--color-brand-green)' }}>
            <IconPackage size={22} />
          </div>
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-label">Commandes</div>
        </div>

        {/* Chiffre d'affaires — fond plein bleu */}
        <div
          className="card card-stat"
          style={{
            background: 'linear-gradient(135deg, var(--color-brand-green) 0%, var(--color-brand-green-mid) 100%)',
            border: 'none',
          }}
        >
          <div className="stat-icon" style={{ background: 'var(--color-brand-gold)', color: 'var(--color-brand-green)' }}>
            <IconCoin size={22} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-brand-gold)' }}>
            {stats.totalRevenue.toFixed(0)}
            <span style={{ fontSize: '0.95rem', fontWeight: 600, marginLeft: 4, opacity: 0.85 }}>MAD</span>
          </div>
          <div className="stat-label" style={{ color: 'rgba(255,255,255,0.75)' }}>Chiffre d'affaires</div>
        </div>

        {/* Clients */}
        <div className="card card-stat">
          <div className="stat-icon" style={{ background: 'var(--color-brand-green-pale)', color: 'var(--color-brand-green)' }}>
            <IconUsers size={22} />
          </div>
          <div className="stat-value">{stats.totalClients}</div>
          <div className="stat-label">Clients</div>
        </div>

        {/* En attente — fond jaune pâle */}
        <div
          className="card card-stat"
          style={{ background: '#FEF6E2', border: '1px solid var(--color-brand-gold)' }}
        >
          <div className="stat-icon" style={{ background: 'var(--color-brand-gold)', color: 'var(--color-brand-green)' }}>
            <IconClock size={22} />
          </div>
          <div className="stat-value" style={{ color: 'var(--color-brand-gold-deep)' }}>{stats.pendingOrders}</div>
          <div className="stat-label">En attente</div>
        </div>
      </div>

      {/* ── Dernières commandes ── */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div
          className="flex-between"
          style={{
            padding: 'var(--space-md) var(--space-lg)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h3 style={{ fontSize: '1rem' }}>Dernières commandes</h3>
          <Link href="/admin/orders" className="navbar-link" style={{ color: 'var(--color-brand-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            Voir tout <IconArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><IconShoppingBag size={40} /></div>
            <h3>Aucune commande</h3>
            <p>Les nouvelles commandes apparaîtront ici</p>
          </div>
        ) : (
          recentOrders.map((order) => {
            const st = STATUS[order.status] ?? { label: order.status, badgeClass: 'badge-pending' }
            return (
              <div
                key={order.id}
                className="flex-between"
                style={{
                  padding: 'var(--space-md) var(--space-lg)',
                  borderBottom: '1px solid var(--color-border)',
                  gap: 'var(--space-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <div className="avatar avatar-sm">
                    <IconUser size={16} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {order.profiles?.full_name || 'Client inconnu'}
                    </p>
                    <p className="text-muted" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <span className={`badge ${st.badgeClass}`}>{st.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-brand-green)', minWidth: 90, textAlign: 'right' }}>
                    {order.total_amount.toFixed(2)} MAD
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Accès rapide ── */}
      <p className="text-label" style={{ marginBottom: 'var(--space-md)' }}>Accès rapide</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-md)' }}>
        {[
          { href: '/admin/orders', icon: <IconListDetails size={18} />, label: 'Commandes', sub: 'Gérer les statuts' },
          { href: '/admin/products', icon: <IconPackage size={18} />, label: 'Produits', sub: 'Catalogue' },
          { href: '/admin/clients', icon: <IconUsers size={18} />, label: 'Clients', sub: 'Niveaux fidélité' },
          { href: '/admin/add-product', icon: <IconPlus size={18} />, label: 'Ajouter', sub: 'Nouveau produit' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card"
            style={{
              padding: 'var(--space-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
            }}
          >
            <div className="stat-icon" style={{ background: 'var(--color-brand-green-pale)', color: 'var(--color-brand-green)', margin: 0, width: 38, height: 38 }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.label}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.sub}</div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
