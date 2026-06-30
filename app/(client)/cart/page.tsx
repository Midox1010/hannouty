'use client'

import { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  IconShoppingCart,
  IconMinus,
  IconPlus,
  IconTrash,
  IconArrowLeft,
  IconTrophy,
} from '@tabler/icons-react'

const LEVEL_BADGE: Record<string, string> = {
  Bronze: 'badge-bronze',
  Argent: 'badge-silver',
  Or: 'badge-gold',
  Platine: 'badge-platinum',
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [levelName, setLevelName] = useState<string | null>(null)
  const [discountPercent, setDiscountPercent] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  // Charger le niveau de fidélité réel du client au montage
  useEffect(() => {
    async function loadLevel() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('levels(name, discount_percent)')
        .eq('id', user.id)
        .single()

      const level = (profile as any)?.levels
      if (level) {
        setLevelName(level.name)
        setDiscountPercent(level.discount_percent ?? 0)
      }
    }
    loadLevel()
  }, [])

  const subtotal = totalPrice
  const discountAmount = (subtotal * discountPercent) / 100
  const total = subtotal - discountAmount

  async function handleOrder() {
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('level_id, levels(discount_percent)')
        .eq('id', user.id)
        .single()

      const discount = (profile as any)?.levels?.discount_percent ?? 0
      const disc = (subtotal * discount) / 100
      const finalAmount = subtotal - disc

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          total_amount: subtotal,
          discount_amount: disc,
          final_amount: finalAmount,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      clearCart()
      router.push('/orders')
    } catch (e: any) {
      setError(e.message ?? 'Une erreur est survenue')
    }
    setLoading(false)
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBlock: 'var(--space-xl)' }}>
      <h1 style={{ marginBottom: 'var(--space-xl)' }}>Mon panier</h1>

      {cart.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><IconShoppingCart size={40} /></div>
          <h3>Votre panier est vide</h3>
          <p>Ajoutez des produits pour commencer vos achats</p>
          <Link href="/products" className="btn btn-primary btn-md" style={{ marginTop: 'var(--space-md)' }}>
            Voir les produits
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: 'var(--space-lg)',
          }}
        >
          {/* ── Articles ── */}
          <div className="card">
            <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--color-border)' }}>
              <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                {cart.length} article{cart.length !== 1 ? 's' : ''}
              </p>
            </div>

            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-img flex-center">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <IconShoppingCart size={24} style={{ color: 'var(--color-text-muted)' }} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</p>
                  <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: 2 }}>
                    {item.price.toFixed(2)} MAD / unité
                  </p>
                </div>

                <div className="qty-control">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn">
                    <IconMinus size={14} />
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn">
                    <IconPlus size={14} />
                  </button>
                </div>

                <div style={{ minWidth: 80, textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    {(item.price * item.quantity).toFixed(2)} MAD
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="btn-icon-sm"
                  style={{ background: 'transparent', color: 'var(--color-text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-brand-red)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                >
                  <IconTrash size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* ── Récapitulatif ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="card price-summary">
              <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Résumé</p>

              <div className="price-row">
                <span className="label">Sous-total</span>
                <span className="value">{subtotal.toFixed(2)} MAD</span>
              </div>

              {discountAmount > 0 && (
                <div className="price-row discount">
                  <span className="label">Réduction fidélité {levelName ? `(${levelName})` : ''}</span>
                  <span className="value">−{discountAmount.toFixed(2)} MAD</span>
                </div>
              )}

              <div className="price-row total">
                <span className="label">Total</span>
                <span className="value">{total.toFixed(2)} MAD</span>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button
                onClick={handleOrder}
                disabled={loading}
                className="btn btn-primary btn-md"
                style={{ width: '100%' }}
              >
                {loading ? 'Commande en cours…' : 'Passer la commande'}
              </button>

              <Link
                href="/products"
                className="text-muted flex-center"
                style={{ fontSize: '0.8rem', gap: 4, marginTop: 4 }}
              >
                <IconArrowLeft size={14} />
                Continuer mes achats
              </Link>
            </div>

            <div className="alert alert-success" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.8125rem' }}>
                <IconTrophy size={16} /> Programme fidélité
              </p>
              <p style={{ fontSize: '0.8125rem', margin: 0 }}>
                {levelName ? (
                  <>Vous êtes niveau <strong>{levelName}</strong> — cette commande sera comptabilisée dans votre progression.</>
                ) : (
                  'Cette commande sera comptabilisée dans votre progression de niveau.'
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
