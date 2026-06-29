'use client'

import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const router = useRouter()
  const supabase = createClient()

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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6">
        <Link href="/products" className="flex items-center gap-2 font-semibold text-gray-900 text-base">
          🛒 Hannouty
        </Link>
        <div className="flex gap-1">
          {[
            { label: 'Produits', href: '/products' },
            { label: 'Mes commandes', href: '/orders' },
            { label: 'Mon profil', href: '/profile' },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="text-sm px-4 py-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative w-9 h-9 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center text-lg">
            🛒
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <Link href="/login"
            className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            Déconnexion
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mon panier</h1>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">🛒</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Votre panier est vide</h2>
            <p className="text-sm text-gray-400 mb-6">Ajoutez des produits pour commencer vos achats</p>
            <Link href="/products"
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors">
              Voir les produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-[1fr_320px] gap-4">
            {/* Articles */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-900">{cart.length} article{cart.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    {/* Image */}
                    <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="max-w-full max-h-full object-contain" />
                      ) : (
                        <span className="text-2xl text-gray-200">🛒</span>
                      )}
                    </div>

                    {/* Nom + prix unitaire */}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.price.toFixed(2)} MAD / unité</p>
                    </div>

                    {/* Contrôle quantité */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-medium transition-colors"
                      >−</button>
                      <span className="text-sm font-semibold text-gray-900 w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-medium transition-colors"
                      >+</button>
                    </div>

                    {/* Total ligne */}
                    <div className="text-right min-w-[70px]">
                      <p className="text-sm font-bold text-gray-900">{(item.price * item.quantity).toFixed(2)} MAD</p>
                    </div>

                    {/* Supprimer */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                    >×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-semibold text-gray-900 mb-4">Résumé</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} MAD</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Réduction fidélité</span>
                      <span>−{discountAmount.toFixed(2)} MAD</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>{total.toFixed(2)} MAD</span>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-500 mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  onClick={handleOrder}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
                >
                  {loading ? 'Commande en cours…' : 'Passer la commande'}
                </button>

                <Link href="/products" className="block text-center text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors">
                  ← Continuer mes achats
                </Link>
              </div>

              {/* Encart fidélité */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <p className="text-xs font-semibold text-green-800 mb-1">🏆 Programme fidélité</p>
                <p className="text-xs text-green-700">
                  Cette commande sera comptabilisée dans votre progression de niveau.
                  Atteignez le niveau Argent pour bénéficier de 5% de remise.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
