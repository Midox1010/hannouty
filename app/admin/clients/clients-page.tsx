'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'
import Link from 'next/link'

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

const LEVEL_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Bronze:  { bg: 'bg-orange-50',  text: 'text-orange-700', dot: 'bg-orange-400' },
  Argent:  { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400'   },
  Or:      { bg: 'bg-yellow-50',  text: 'text-yellow-700', dot: 'bg-yellow-400' },
  Platine: { bg: 'bg-indigo-50',  text: 'text-indigo-700', dot: 'bg-indigo-400' },
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

    // Récupère les profils clients avec leur niveau
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, level_id, levels(id, name, discount_percent)')
      .eq('role', 'client')
      .order('full_name')

    if (error || !profiles) {
      setLoading(false)
      return
    }

    // Récupère le nombre de commandes et total par client
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

    if (clientOrders[clientId]) return // déjà chargé

    setLoadingOrders(clientId)
    const { data } = await supabase
      .from('orders')
      .select('id, status, total_amount, discount_amount, final_amount, created_at')
      .eq('user_id', clientId)
      .order('created_at', { ascending: false })

    setClientOrders(prev => ({ ...prev, [clientId]: data ?? [] }))
    setLoadingOrders(null)
  }

  const STATUS_LABELS: Record<string, { label: string; style: string }> = {
    pending:    { label: 'En attente',  style: 'bg-orange-50 text-orange-700' },
    confirmed:  { label: 'Confirmée',   style: 'bg-blue-50 text-blue-700'    },
    delivering: { label: 'En livraison',style: 'bg-purple-50 text-purple-700'},
    delivered:  { label: 'Livrée',      style: 'bg-green-50 text-green-700'  },
    cancelled:  { label: 'Annulée',     style: 'bg-red-50 text-red-600'      },
  }

  const filtered = clients.filter(c =>
    (c.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const totalClients = clients.length
  const totalCommandes = clients.reduce((s, c) => s + c.order_count, 0)
  const totalCA = clients.reduce((s, c) => s + c.total_spent, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gray-900 h-14 flex items-center justify-between px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-white text-lg font-medium">🔧 Hannouty</span>
          <span className="bg-orange-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <div className="flex gap-1">
          {[
            { label: 'Dashboard', href: '/admin' },
            { label: 'Commandes', href: '/admin/orders' },
            { label: 'Produits', href: '/admin/products' },
            { label: 'Clients', href: '/admin/clients' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm px-4 py-1.5 rounded-md transition-colors ${
                link.href === '/admin/clients'
                  ? 'bg-white/12 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="w-32" />
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-gray-900">Clients</h1>
          <p className="text-sm text-gray-400 mt-0.5">{totalClients} client{totalClients !== 1 ? 's' : ''} inscrits</p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Clients</p>
            <p className="text-3xl font-medium text-gray-900">{totalClients}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Commandes passées</p>
            <p className="text-3xl font-medium text-gray-900">{totalCommandes}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">CA total clients</p>
            <p className="text-3xl font-medium text-gray-900">
              {totalCA.toFixed(2)} <span className="text-base font-normal text-gray-400">MAD</span>
            </p>
          </div>
        </div>

        {/* Recherche */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
          />
        </div>

        {/* Liste */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              Chargement des clients...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-sm">
                {search ? 'Aucun client ne correspond à votre recherche' : 'Aucun client inscrit pour le moment'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">Client</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">Niveau</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">Commandes</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">Total dépensé</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(client => {
                  const levelStyle = client.level
                    ? LEVEL_STYLES[client.level.name] ?? LEVEL_STYLES['Bronze']
                    : null
                  const initials = (client.full_name ?? 'C')
                    .split(' ')
                    .map(w => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <>
                      <tr key={client.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 text-sm font-medium flex items-center justify-center flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {client.full_name ?? <span className="text-gray-400 italic">Sans nom</span>}
                              </p>
                              <p className="text-xs text-gray-400 font-mono mt-0.5">{client.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {client.level && levelStyle ? (
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${levelStyle.bg} ${levelStyle.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${levelStyle.dot}`} />
                              {client.level.name}
                              <span className="opacity-60">· {client.level.discount_percent}%</span>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-gray-900">{client.order_count}</span>
                          <span className="text-xs text-gray-400 ml-1">commande{client.order_count !== 1 ? 's' : ''}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-gray-900">{client.total_spent.toFixed(2)}</span>
                          <span className="text-xs text-gray-400 ml-1">MAD</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {client.order_count > 0 && (
                            <button
                              onClick={() => toggleOrders(client.id)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                            >
                              {expandedId === client.id ? 'Masquer' : 'Voir commandes'}
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Commandes expandées */}
                      {expandedId === client.id && (
                        <tr key={`${client.id}-orders`}>
                          <td colSpan={5} className="px-5 pb-4 pt-0 bg-gray-50/50">
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                              {loadingOrders === client.id ? (
                                <div className="py-6 text-center text-sm text-gray-400">Chargement...</div>
                              ) : (clientOrders[client.id] ?? []).length === 0 ? (
                                <div className="py-6 text-center text-sm text-gray-400">Aucune commande</div>
                              ) : (
                                <table className="w-full">
                                  <thead>
                                    <tr className="bg-gray-100 border-b border-gray-200">
                                      <th className="text-left text-xs font-medium text-gray-400 px-4 py-2.5 uppercase tracking-wider">Ref.</th>
                                      <th className="text-left text-xs font-medium text-gray-400 px-4 py-2.5 uppercase tracking-wider">Date</th>
                                      <th className="text-left text-xs font-medium text-gray-400 px-4 py-2.5 uppercase tracking-wider">Statut</th>
                                      <th className="text-left text-xs font-medium text-gray-400 px-4 py-2.5 uppercase tracking-wider">Total</th>
                                      <th className="text-left text-xs font-medium text-gray-400 px-4 py-2.5 uppercase tracking-wider">Remise</th>
                                      <th className="text-left text-xs font-medium text-gray-400 px-4 py-2.5 uppercase tracking-wider">Net</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 bg-white">
                                    {(clientOrders[client.id] ?? []).map((order: any) => {
                                      const s = STATUS_LABELS[order.status] ?? { label: order.status, style: 'bg-gray-100 text-gray-500' }
                                      return (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                          <td className="px-4 py-2.5 text-xs font-mono text-gray-500">#{order.id.slice(0, 8)}</td>
                                          <td className="px-4 py-2.5 text-xs text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                          </td>
                                          <td className="px-4 py-2.5">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.style}`}>{s.label}</span>
                                          </td>
                                          <td className="px-4 py-2.5 text-xs text-gray-700">{(order.total_amount ?? 0).toFixed(2)} MAD</td>
                                          <td className="px-4 py-2.5 text-xs text-green-600">-{(order.discount_amount ?? 0).toFixed(2)} MAD</td>
                                          <td className="px-4 py-2.5 text-xs font-medium text-gray-900">{(order.final_amount ?? 0).toFixed(2)} MAD</td>
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
    </div>
  )
}
