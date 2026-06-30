'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useCart } from '../../context/CartContext'
import { IconSearch, IconX, IconShoppingBag, IconCheck, IconPlus } from '@tabler/icons-react'

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
    <div className="container animate-fade-in" style={{ paddingBlock: 'var(--space-xl)' }}>

      {/* ── Header + recherche ── */}
      <div className="flex-between" style={{ marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1>Nos produits</h1>
          {!loading && (
            <p className="text-muted" style={{ marginTop: 4 }}>
              {filtered.length} produit{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="search-bar" style={{ width: 280 }}>
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
      </div>

      {/* ── Grille produits ── */}
      {loading ? (
        <div className="grid-products">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: 140 }} />
              <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 14, width: '70%' }} />
                <div className="skeleton" style={{ height: 11, width: '50%' }} />
                <div className="skeleton" style={{ height: 32, marginTop: 6 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state animate-fade-in">
          <div className="empty-icon"><IconShoppingBag size={40} /></div>
          <h3>Aucun produit trouvé</h3>
          <p>Aucun résultat pour « {search} »</p>
          <button onClick={() => setSearch('')} className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}>
            Réinitialiser la recherche
          </button>
        </div>
      ) : (
        <div className="grid-products">
          {filtered.map((product, i) => (
            <div
              key={product.id}
              className="card card-product animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
            >
              <div className="product-image-wrap">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="product-image"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div
                    className="product-image flex-center"
                    style={{ background: 'var(--color-brand-green-pale)', color: 'var(--color-brand-green)' }}
                  >
                    <IconShoppingBag size={36} style={{ opacity: 0.4 }} />
                  </div>
                )}
              </div>

              <div className="product-body">
                <p className="product-name" style={{
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {product.name}
                </p>
                <p className="text-muted" style={{
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {product.description ?? 'Aucune description'}
                </p>

                <div className="product-footer flex-between">
                  <span className="product-price">
                    {product.price.toFixed(2)}
                    <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--color-text-muted)', marginLeft: 3 }}>
                      MAD
                    </span>
                  </span>

                  <button
                    onClick={() => handleAdd(product)}
                    className={`btn btn-sm ${added[product.id] ? 'btn-outline' : 'btn-gold'}`}
                  >
                    {added[product.id] ? (
                      <>
                        <IconCheck size={14} /> Ajouté
                      </>
                    ) : (
                      <>
                        <IconPlus size={14} /> Ajouter
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
