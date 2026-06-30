'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)

  const router   = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/products'), 800)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Panneau gauche décoratif ── */}
      <div className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1B2A6B 0%, #0f1a45 100%)' }}>

        {/* Cercles décoratifs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: '#F4C542' }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-10"
          style={{ background: '#F4C542' }} />
        <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full opacity-5"
          style={{ background: '#ffffff' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg"
              style={{ background: '#F4C542', color: '#1B2A6B' }}>H</div>
            <span className="text-white text-2xl font-bold tracking-tight">Hannouty</span>
          </div>
          <p className="text-white/50 text-sm ml-13">Votre supermarché en ligne</p>
        </div>

        {/* Contenu central */}
        <div className="relative z-10">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'rgba(244,197,66,0.15)', border: '1px solid rgba(244,197,66,0.3)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F4C542" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <h2 className="text-white text-3xl font-bold leading-tight mb-3">
              Bienvenue sur<br />
              <span style={{ color: '#F4C542' }}>Hannouty</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed">
              Faites vos courses en ligne et profitez de notre programme de fidélité exclusif.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[
              { icon: '🛒', text: 'Catalogue de produits frais et locaux' },
              { icon: '🏆', text: 'Programme fidélité Bronze → Platine' },
              { icon: '🚚', text: 'Livraison rapide à domicile' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-xl">{f.icon}</span>
                <span className="text-white/75 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs">© 2026 Hannouty · Tous droits réservés</p>
        </div>
      </div>

      {/* ── Panneau droit : formulaire ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12"
        style={{ background: '#f8fafc' }}>

        {/* Logo mobile */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black"
            style={{ background: '#F4C542', color: '#1B2A6B' }}>H</div>
          <span className="text-xl font-bold" style={{ color: '#1B2A6B' }}>Hannouty</span>
        </div>

        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B2A6B', letterSpacing: '-0.02em' }}>
              Connexion
            </h1>
            <p className="text-gray-500 text-sm">Entrez vos identifiants pour accéder à votre compte</p>
          </div>

          {/* Success state */}
          {success && (
            <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 animate-pulse"
              style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-sm font-semibold text-green-800">Connexion réussie !</p>
                <p className="text-xs text-green-600">Redirection en cours…</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 p-4 rounded-2xl flex items-center gap-3"
              style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <span className="text-lg">⚠️</span>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#1B2A6B' }}>
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm transition-all"
                  style={{
                    background: '#fff',
                    border: '1.5px solid #e2e8f0',
                    color: '#1B2A6B',
                    outline: 'none',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#1B2A6B'; e.target.style.boxShadow = '0 0 0 3px rgba(27,42,107,0.1)' }}
                  onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#1B2A6B' }}>
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm transition-all"
                  style={{
                    background: '#fff',
                    border: '1.5px solid #e2e8f0',
                    color: '#1B2A6B',
                    outline: 'none',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#1B2A6B'; e.target.style.boxShadow = '0 0 0 3px rgba(27,42,107,0.1)' }}
                  onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPwd
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-4 rounded-2xl font-bold text-sm transition-all relative overflow-hidden"
              style={{
                background: loading || success ? '#94a3b8' : '#F4C542',
                color: '#1B2A6B',
                boxShadow: loading || success ? 'none' : '0 4px 14px rgba(244,197,66,0.4)',
                transform: 'translateY(0)',
                cursor: loading || success ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!loading && !success) (e.target as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'translateY(0)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Connexion en cours…
                </span>
              ) : success ? '✓ Connecté !' : 'Se connecter →'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
          </div>

          {/* Lien inscription */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <Link href="/signup"
                className="font-bold transition-colors"
                style={{ color: '#1B2A6B' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = '#F4C542'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = '#1B2A6B'}
              >
                Créer un compte
              </Link>
            </p>
          </div>

          {/* Retour boutique */}
          <div className="text-center mt-4">
            <Link href="/products" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              ← Continuer sans compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
