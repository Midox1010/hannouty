'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'
import {
  IconUsers,
  IconShoppingBag,
  IconCoin,
  IconSearch,
  IconX,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react'

type Level = {
  id: string
  name: string
  discount_percent: number
}

type Client = {
  id: string
  full_name: string | null
  role: string
  level_id: string | null
  level: Level | null
  order_count: number
  total_spent: number
}

const LEVEL_BADGE: Record<string, string> = {
  Bronze:  'badge-bronze',
  Argent:  'badge-silver',
  Or:      'badge-gold',
  Platine: 'badge-platinum',
}

const STATUS: Record<string, { label: string; badgeClass: string }> = {
  pending:    { label: 'En attente',   badgeClass: 'badge-pending' },
  confirmed:  { label: 'Confirmée',    badgeClass: 'badge-confirmed' },
  delivering: { label: 'En livraison', badgeClass: 'badge-shipped' },
  delivered:  { label: 'Livrée',       badgeClass: 'badge-delivered' },
  cancelled:  { label: 'Annulée',      badgeClass: 'badge-cancelled' },
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [clientOrders, setClientOrders] = useState<Record<string, any[]>>({})
  const [loadingOrders, setLoadingOrders] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    setLoading(true)

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, level_id, levels(id, name, discount_percent)')
      .eq('role', 'client')
      .order('full_name')

    if (error || !profiles) {
      setLoading(false)
      return
    }

    const { data: orders } = await supabase
      .from('orders')
      .select('user_id, final_amount')

    const orderMap: Record<string, { count: number; total: number }> = {}
    if (orders) {
      for (const order of orders) {
        if (!orderMap[order.user_id]) orderMap[order.user_id] = { count: 0, total: 0 }
        orderMap[order.user_id].count++
        orderMap[order.user_id].total += order.final_amount ?? 0
      }
    }

    const enriched: Client[] = profiles.map((p: any) => ({
      id: p.id,
      full_name: p.full_name,
      role: p.role,
      level_id: p.level_id,
      level: p.levels ?? null,
      order_count: orderMap[p.id]?.count ?? 0,
      total_spent: orderMap[p.id]?.total ?? 0,
    }))

    setClients(enriched)
    setLoading(false)
  }

  async function toggleOrders(clientId: string) {
    if (expandedId === clientId) {
      setExpandedId(null)
      return
    }

    setExpandedId(clientId)

    if (clientOrders[clientId]) return

    setLoadingOrders(clientId)
    const { data } = await supabase
      .from('orders')
      .select('id, status, total_amount, discount_amount, final_amount, created_at')
      .eq('user_id', clientId)
      .order('created_at', { ascending: false })

    setClientOrders(prev => ({ ...prev, [clientId]: data ?? [] }))
    setLoadingOrders(null)
  }

  const filtered = clients.filter(c =>
    (c.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const totalClients = clients.length
  const totalCommandes = clients.reduce((s, c) => s + c.order_count, 0)
  const totalCA = clients.reduce((s, c) => s + c.total_spent, 0)

  return (
    <div className="container animate-fade-in" style={{ paddingBlock: 'var(--space-xl)' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1>Clients</h1>
        <p className="text-muted" style={{ marginTop: 4 }}>
          {totalClients} client{totalClients !== 1 ? 's' : ''} inscrit{totalClients !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Stats rapides ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
        }}
      >
        <div className="card card-stat">
          <div className="stat-icon" style={{ background: 'var(--color-brand-green-pale)', color: 'var(--color-brand-green)' }}>
            <IconUsers size={22} />
          </div>
          <div className="stat-value">{totalClients}</div>
          <div className="stat-label">Clients</div>
        </div>

        <div className="card card-stat">
          <div className="stat-icon" style={{ background: 'var(--color-brand-green-pale)', color: 'var(--color-brand-green)' }}>
            <IconShoppingBag size={22} />
          </div>
          <div className="stat-value">{totalCommandes}</div>
          <div className="stat-label">Commandes passées</div>
        </div>

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
            {totalCA.toFixed(0)}
            <span style={{ fontSize: '0.95rem', fontWeight: 600, marginLeft: 4, opacity: 0.85 }}>MAD</span>
          </div>
          <div className="stat-label" style={{ color: 'rgba(255,255,255,0.75)' }}>CA total clients</div>
        </div>
      </div>

      {/* ── Recherche ── */}
      <div className="search-bar" style={{ width: 320, marginBottom: 'var(--space-lg)' }}>
        <span className="search-icon"><IconSearch size={17} /></span>
        <input
          type="text"
          placeholder="Rechercher un client…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input"
        />
        {search && (
          <button className="clear-btn" onClick={() => setSearch('')}>
            <IconX size={16} />
          </button>
        )}
      </div>

      {/* ── Liste clients ── */}
      <div className="table-wrapper">
        {loading ? (
          <div className="flex-center" style={{ padding: 'var(--space-2xl)' }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><IconUsers size={40} /></div>
            <h3>Aucun client</h3>
            <p>{search ? 'Aucun client ne correspond à votre recherche' : 'Aucun client inscrit pour le moment'}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Niveau</th>
                <th>Commandes</th>
                <th>Total dépensé</th>
                <th style={{ textAlign: 'right' }}>Détails</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => {
                const badgeClass = client.level ? LEVEL_BADGE[client.level.name] ?? 'badge-bronze' : null
                const isOpen = expandedId === client.id
                const initials = (client.full_name ?? 'C')
                  .split(' ')
                  .map(w => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <>
                    <tr key={client.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                          <div className="avatar avatar-sm">{initials}</div>
                          <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {client.full_name ?? <span className="text-muted" style={{ fontStyle: 'italic' }}>Sans nom</span>}
                            </p>
                            <p className="text-muted" style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                              {client.id.slice(0, 8)}…
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {client.level && badgeClass ? (
                          <span className={`badge ${badgeClass}`}>
                            {client.level.name} · {client.level.discount_percent}%
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{client.order_count}</span>
                        <span className="text-muted" style={{ marginLeft: 4 }}>
                          commande{client.order_count !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{client.total_spent.toFixed(2)}</span>
                        <span className="text-muted" style={{ marginLeft: 4 }}>MAD</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {client.order_count > 0 && (
                          <button
                            onClick={() => toggleOrders(client.id)}
                            className="btn btn-outline btn-sm"
                          >
                            {isOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                            {isOpen ? 'Masquer' : 'Voir commandes'}
                          </button>
                        )}
                      </td>
                    </tr>

                    {isOpen && (
                      <tr key={`${client.id}-orders`}>
                        <td colSpan={5} style={{ background: 'var(--color-bg)', padding: 'var(--space-md)' }}>
                          <div className="table-wrapper">
                            {loadingOrders === client.id ? (
                              <div className="flex-center" style={{ padding: 'var(--space-lg)' }}>
                                <div className="spinner" />
                              </div>
                            ) : (clientOrders[client.id] ?? []).length === 0 ? (
                              <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                                Aucune commande
                              </p>
                            ) : (
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th>Réf.</th>
                                    <th>Date</th>
                                    <th>Statut</th>
                                    <th>Total</th>
                                    <th>Remise</th>
                                    <th>Net</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(clientOrders[client.id] ?? []).map((order: any) => {
                                    const st = STATUS[order.status] ?? { label: order.status, badgeClass: 'badge-pending' }
                                    return (
                                      <tr key={order.id}>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                                          #{order.id.slice(0, 8)}
                                        </td>
                                        <td style={{ fontSize: '0.8rem' }}>
                                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td><span className={`badge ${st.badgeClass}`}>{st.label}</span></td>
                                        <td style={{ fontSize: '0.8rem' }}>{(order.total_amount ?? 0).toFixed(2)} MAD</td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--color-brand-green)' }}>
                                          −{(order.discount_amount ?? 0).toFixed(2)} MAD
                                        </td>
                                        <td style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                          {(order.final_amount ?? 0).toFixed(2)} MAD
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
