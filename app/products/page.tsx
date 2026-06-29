'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase/client'
import { useCart } from '../context/CartContext'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Nos produits</h1>
            {!loading && (
              <p className="text-sm text-gray-400 mt-0.5">{filtered.length} produit{filtered.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 w-56">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-36 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-8 bg-gray-100 rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">Aucun produit trouvé pour "{search}"</p>
            <button onClick={() => setSearch('')} className="mt-3 text-sm text-green-600 hover:underline">
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map(product => (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="h-36 flex items-center justify-center bg-gray-50 overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="max-h-32 max-w-full object-contain"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <span className="text-4xl text-gray-200">🛒</span>
                  )}
                </div>

                <div className="p-4">
                  <p className="font-semibold text-gray-900 text-sm mb-0.5 line-clamp-1">{product.name}</p>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-1">
                    {product.description ?? 'Aucune description'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      {product.price.toFixed(2)}
                      <span className="text-xs font-normal text-gray-400 ml-1">MAD</span>
                    </span>
                    <button
                      onClick={() => handleAdd(product)}
                      className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                        added[product.id]
                          ? 'bg-green-100 text-green-700'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
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
