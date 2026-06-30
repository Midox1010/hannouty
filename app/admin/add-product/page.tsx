'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { IconPackage, IconCheck } from '@tabler/icons-react'

export default function AddProductPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    image_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [user, setUser] = useState<any>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    checkUser()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.from('products').insert({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      image_url: formData.image_url || null,
      is_active: true,
    })

    if (error) {
      setMessage({ type: 'error', text: 'Erreur : ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'Produit ajouté avec succès !' })
      setFormData({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        image_url: '',
      })
    }

    setLoading(false)
  }

  if (!user) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBlock: 'var(--space-xl)', maxWidth: 600 }}>

      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1>Ajouter un produit</h1>
        <p className="text-muted" style={{ marginTop: 4 }}>
          Renseignez les informations du nouveau produit
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-xl)' }}>

        <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
          <label className="form-label">
            Nom du produit<span className="required">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
            rows={3}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label">
              Prix (MAD)<span className="required">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="form-input"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Stock</label>
            <input
              type="number"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
          <label className="form-label">URL de l'image</label>
          <input
            type="text"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="form-input"
            placeholder="https://..."
          />
          <p className="form-hint">Optionnel — une icône par défaut sera utilisée sinon</p>
        </div>

        {formData.image_url && (
          <div style={{ marginBottom: 'var(--space-lg)', display: 'flex', justifyContent: 'center' }}>
            <img
              src={formData.image_url}
              alt="Aperçu"
              style={{
                width: 100, height: 100, objectFit: 'cover',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
              }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.3)' }} />
              Ajout en cours…
            </>
          ) : (
            <>
              <IconPackage size={18} />
              Ajouter le produit
            </>
          )}
        </button>

        {message && (
          <div
            className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}
            style={{ marginTop: 'var(--space-lg)' }}
          >
            {message.type === 'success' && <IconCheck size={18} />}
            {message.text}
          </div>
        )}
      </form>
    </div>
  )
}
