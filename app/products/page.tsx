'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase/client'
import { useCart } from '../context/CartContext'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [added, setAdded] = useState<Record<string, boolean>>({})
  const { addToCart } = useCart()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('id, name, description, price, image_url')
        .eq('is_active', true)
        .order('name')
      if (data) setProducts(data)
      setLoading(false)
    }
    load()
  }, [])

  function handleAdd(product: Product) {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    })
    setAdded(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1500)
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen" style={{ background: '#FAF8F4' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>

        <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#16201c', letterSpacing: '-0.02em' }}>Nos produits</h1>
            {!loading && (
              <p style={{ fontSize: 13, color: '#94a39a', marginTop: 3 }}>
                {filtered.length} produit{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#fff', border: '1.5px solid #ece8e0',
              borderRadius: 14, padding: '10px 16px', width: 260,
              transition: 'border-color .2s ease, box-shadow .2s ease',
            }}
          >
            <span style={{ color: '#94a39a', fontSize: 14 }}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher un produit…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, fontSize: 13.5, color: '#16201c', background: 'transparent', border: 'none', outline: 'none' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 18, border: '1px solid #ece8e0', overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 140 }} />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ height: 14, width: '70%', borderRadius: 6 }} />
                  <div className="skeleton" style={{ height: 11, width: '50%', borderRadius: 6 }} />
                  <div className="skeleton" style={{ height: 32, marginTop: 6, borderRadius: 10 }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '96px 0', color: '#94a39a' }}>
            <p style={{ fontSize: 38, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 14 }}>Aucun produit trouvé pour « {search} »</p>
            <button
              onClick={() => setSearch('')}
              style={{ marginTop: 12, fontSize: 13.5, color: '#0E5C3F', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {filtered.map((product, i) => (
              <div
                key={product.id}
                className="animate-fade-up"
                style={{
                  animationDelay: `${Math.min(i * 0.04, 0.4)}s`,
                  background: '#fff', borderRadius: 18,
                  border: '1px solid #ece8e0', overflow: 'hidden',
                  transition: 'transform .25s var(--ease), box-shadow .25s ease, border-color .25s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 16px 32px rgba(14,92,63,0.12)'
                  e.currentTarget.style.borderColor = '#cdeede'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = '#ece8e0'
                }}
              >
                <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1faf5', overflow: 'hidden' }}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'contain' }}
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <span style={{ fontSize: 36, opacity: 0.25 }}>🛒</span>
                  )}
                </div>

                <div style={{ padding: 16 }}>
                  <p style={{
                    fontWeight: 700, color: '#16201c', fontSize: 13.5, marginBottom: 3,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {product.name}
                  </p>
                  <p style={{
                    fontSize: 11.5, color: '#94a39a', marginBottom: 12,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {product.description ?? 'Aucune description'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 16.5, fontWeight: 800, color: '#0a3326' }}>
                      {product.price.toFixed(2)}
                      <span style={{ fontSize: 11, fontWeight: 500, color: '#94a39a', marginLeft: 3 }}>MAD</span>
                    </span>
                    <button
                      onClick={() => handleAdd(product)}
                      style={{
                        fontSize: 11.5, fontWeight: 700, padding: '8px 16px', borderRadius: 10,
                        border: 'none', cursor: 'pointer',
                        transition: 'all .2s var(--ease)',
                        background: added[product.id]
                          ? 'linear-gradient(135deg,#e3f5ec,#cdeede)'
                          : 'linear-gradient(135deg,#137a52,#0E5C3F)',
                        color: added[product.id] ? '#0E5C3F' : '#fff',
                        boxShadow: added[product.id] ? 'none' : '0 4px 12px rgba(14,92,63,0.3)',
                        transform: added[product.id] ? 'scale(1.04)' : 'scale(1)',
                      }}
                    >
                      {added[product.id] ? '✓ Ajouté' : '+ Ajouter'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
