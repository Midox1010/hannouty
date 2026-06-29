'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  stock_quantity: number | null
  image_url: string | null
  is_active: boolean
  category_id: string | null
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Product>>({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [search, setSearch] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name')

    if (!error && data) setProducts(data)
    setLoading(false)
  }

  function startEdit(product: Product) {
    setEditingId(product.id)
    setEditForm({
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      stock_quantity: product.stock_quantity ?? 0,
      image_url: product.image_url ?? '',
      is_active: product.is_active,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({})
  }

  async function saveEdit(id: string) {
    setSaving(true)
    const { error } = await supabase
      .from('products')
      .update({
        name: editForm.name,
        description: editForm.description || null,
        price: Number(editForm.price),
        stock_quantity: Number(editForm.stock_quantity) || 0,
        image_url: editForm.image_url || null,
        is_active: editForm.is_active,
      })
      .eq('id', id)

    if (error) {
      showMessage('error', 'Erreur lors de la modification : ' + error.message)
    } else {
      showMessage('success', 'Produit modifié avec succès')
      setEditingId(null)
      await fetchProducts()
    }
    setSaving(false)
  }

  async function deleteProduct(id: string) {
    setDeletingId(id)
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      showMessage('error', 'Erreur lors de la suppression : ' + error.message)
    } else {
      showMessage('success', 'Produit supprimé')
      setProducts(prev => prev.filter(p => p.id !== id))
    }
    setDeletingId(null)
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

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
                link.href === '/admin/products'
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">Produits</h1>
            <p className="text-sm text-gray-400 mt-0.5">{products.length} produit{products.length !== 1 ? 's' : ''} au total</p>
          </div>
          <Link
            href="/admin/add-product"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            + Ajouter un produit
          </Link>
        </div>

        {/* Message flash */}
        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Recherche */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
              Chargement des produits...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-sm">
                {search ? 'Aucun produit ne correspond à votre recherche' : 'Aucun produit pour le moment'}
              </p>
              {!search && (
                <Link href="/admin/add-product" className="mt-3 text-sm text-orange-500 hover:underline">
                  Ajouter le premier produit →
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">Produit</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">Prix</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">Stock</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">Statut</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    {editingId === product.id ? (
                      /* Mode édition */
                      <td colSpan={5} className="px-5 py-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                          <p className="text-sm font-medium text-orange-800 mb-4">Modifier le produit</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
                              <input
                                type="text"
                                value={editForm.name || ''}
                                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                              <textarea
                                value={editForm.description || ''}
                                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                rows={2}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Prix (MAD)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editForm.price || ''}
                                onChange={e => setEditForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
                              <input
                                type="number"
                                value={editForm.stock_quantity || ''}
                                onChange={e => setEditForm(f => ({ ...f, stock_quantity: parseInt(e.target.value) }))}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-600 mb-1">URL image</label>
                              <input
                                type="text"
                                value={editForm.image_url || ''}
                                onChange={e => setEditForm(f => ({ ...f, image_url: e.target.value }))}
                                placeholder="https://..."
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                              />
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`active-${product.id}`}
                                checked={editForm.is_active ?? true}
                                onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))}
                                className="w-4 h-4 accent-orange-500"
                              />
                              <label htmlFor={`active-${product.id}`} className="text-sm text-gray-700">Produit actif (visible dans le catalogue)</label>
                            </div>
                          </div>
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={() => saveEdit(product.id)}
                              disabled={saving}
                              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                              {saving ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      /* Mode lecture */
                      <>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 flex-shrink-0 text-lg">
                                📦
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              {product.description && (
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-gray-900">{product.price.toFixed(2)}</span>
                          <span className="text-xs text-gray-400 ml-1">MAD</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-sm font-medium ${
                            (product.stock_quantity ?? 0) === 0
                              ? 'text-red-500'
                              : (product.stock_quantity ?? 0) < 5
                              ? 'text-orange-500'
                              : 'text-gray-900'
                          }`}>
                            {product.stock_quantity ?? 0}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                            product.is_active
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${product.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {product.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEdit(product)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Supprimer "${product.name}" ?`)) deleteProduct(product.id)
                              }}
                              disabled={deletingId === product.id}
                              className="text-xs text-red-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              {deletingId === product.id ? '...' : 'Supprimer'}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
