'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'
import Link from 'next/link'
import {
  IconPackage,
  IconSearch,
  IconX,
  IconPlus,
  IconPencil,
  IconTrash,
  IconCheck,
} from '@tabler/icons-react'

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
    <div className="container animate-fade-in" style={{ paddingBlock: 'var(--space-xl)' }}>

      {/* ── Header ── */}
      <div className="flex-between" style={{ marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1>Produits</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>
            {products.length} produit{products.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <Link href="/admin/add-product" className="btn btn-gold btn-md">
          <IconPlus size={18} />
          Ajouter un produit
        </Link>
      </div>

      {/* ── Message flash ── */}
      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 'var(--space-lg)' }}>
          {message.text}
        </div>
      )}

      {/* ── Recherche ── */}
      <div className="search-bar" style={{ width: 320, marginBottom: 'var(--space-lg)' }}>
        <span className="search-icon"><IconSearch size={17} /></span>
        <input
          type="text"
          placeholder="Rechercher un produit…"
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

      {/* ── Table ── */}
      <div className="table-wrapper">
        {loading ? (
          <div className="flex-center" style={{ padding: 'var(--space-2xl)' }}>
            <div className="spinner spinner-lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><IconPackage size={40} /></div>
            <h3>Aucun produit</h3>
            <p>{search ? 'Aucun produit ne correspond à votre recherche' : 'Aucun produit pour le moment'}</p>
            {!search && (
              <Link href="/admin/add-product" className="btn btn-gold btn-sm" style={{ marginTop: 8 }}>
                Ajouter le premier produit
              </Link>
            )}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix</th>
                <th>Stock</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id}>
                  {editingId === product.id ? (
                    <td colSpan={5} style={{ padding: 'var(--space-lg)' }}>
                      <div
                        className="card"
                        style={{
                          padding: 'var(--space-lg)',
                          background: 'var(--color-brand-green-pale)',
                          border: '1px solid var(--color-brand-green-light)',
                        }}
                      >
                        <p style={{ fontWeight: 600, color: 'var(--color-brand-green)', marginBottom: 'var(--space-md)' }}>
                          Modifier le produit
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                          <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Nom</label>
                            <input
                              type="text"
                              value={editForm.name || ''}
                              onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                              className="form-input"
                            />
                          </div>
                          <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Description</label>
                            <textarea
                              value={editForm.description || ''}
                              onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                              rows={2}
                              className="form-textarea"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Prix (MAD)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.price ?? ''}
                              onChange={e => setEditForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                              className="form-input"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Stock</label>
                            <input
                              type="number"
                              value={editForm.stock_quantity ?? ''}
                              onChange={e => setEditForm(f => ({ ...f, stock_quantity: parseInt(e.target.value) }))}
                              className="form-input"
                            />
                          </div>
                          <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">URL image</label>
                            <input
                              type="text"
                              value={editForm.image_url || ''}
                              onChange={e => setEditForm(f => ({ ...f, image_url: e.target.value }))}
                              placeholder="https://..."
                              className="form-input"
                            />
                          </div>
                          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="checkbox"
                              id={`active-${product.id}`}
                              checked={editForm.is_active ?? true}
                              onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))}
                              style={{ width: 16, height: 16, accentColor: 'var(--color-brand-green)' }}
                            />
                            <label htmlFor={`active-${product.id}`} style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                              Produit actif (visible dans le catalogue)
                            </label>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                          <button
                            onClick={() => saveEdit(product.id)}
                            disabled={saving}
                            className="btn btn-primary btn-sm"
                          >
                            {saving ? 'Enregistrement…' : 'Enregistrer'}
                          </button>
                          <button onClick={cancelEdit} className="btn btn-ghost btn-sm">
                            Annuler
                          </button>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }}
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                          ) : (
                            <div
                              className="flex-center"
                              style={{
                                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                                background: 'var(--color-brand-green-pale)', color: 'var(--color-brand-green)',
                                flexShrink: 0,
                              }}
                            >
                              <IconPackage size={18} />
                            </div>
                          )}
                          <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{product.name}</p>
                            {product.description && (
                              <p className="text-muted" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 240 }}>
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{product.price.toFixed(2)}</span>
                        <span className="text-muted" style={{ marginLeft: 4 }}>MAD</span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 600,
                          color: (product.stock_quantity ?? 0) === 0
                            ? 'var(--color-brand-red)'
                            : (product.stock_quantity ?? 0) < 5
                            ? 'var(--color-brand-gold-deep)'
                            : 'var(--color-text-primary)',
                        }}>
                          {product.stock_quantity ?? 0}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${product.is_active ? 'badge-delivered' : ''}`} style={!product.is_active ? { background: 'var(--color-border)', color: 'var(--color-text-muted)' } : {}}>
                          {product.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
                          <button onClick={() => startEdit(product)} className="btn btn-outline btn-sm">
                            <IconPencil size={14} />
                            Modifier
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer "${product.name}" ?`)) deleteProduct(product.id)
                            }}
                            disabled={deletingId === product.id}
                            className="btn btn-danger btn-sm"
                          >
                            <IconTrash size={14} />
                            {deletingId === product.id ? '…' : 'Supprimer'}
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
  )
}
