'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [showPwd, setShowPwd]   = useState(false)

  const router   = useRouter()
  const supabase = createClient()

  const passwordStrength = (pwd: string) => {
    if (pwd.length === 0) return 0
    if (pwd.length < 6)   return 1
    if (pwd.length < 10)  return 2
    return 3
  }
  const strength = passwordStrength(password)
  const strengthLabel = ['', 'Faible', 'Moyen', 'Fort']
  const strengthColor = ['', '#ef4444', '#F4C542', '#22c55e']

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      setError(error.message.includes('already') ? 'Un compte existe déjà avec cet email.' : 'Erreur : ' + error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2500)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Panneau gauche décoratif ── */}
      <div className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1B2A6B 0%, #0f1a45 100%)' }}>

        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10" style={{ background: '#F4C542' }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-10" style={{ background: '#F4C542' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg"
              style={{ background: '#F4C542', color: '#1B2A6B' }}>H</div>
            <span className="text-white text-2xl font-bold tracking-tight">Hannouty</span>
          </div>
        </div>

        {/* Contenu central */}
        <div className="relative z-10">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'rgba(244,197,66,0.15)', border: '1px solid rgba(244,197,66,0.3)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F4C542" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <h2 className="text-white text-3xl font-bold leading-tight mb-3">
              Rejoignez<br />
              <span style={{ color: '#F4C542' }}>la communauté</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed">
              Créez votre compte et commencez à accumuler des points pour débloquer des remises exclusives.
            </p>
          </div>

          {/* Niveaux fidélité */}
          <div className="space-y-2">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Programme fidélité</p>
            {[
              { emoji: '🥉', name: 'Bronze',  pct: '0%',  desc: 'Dès l\'inscription' },
              { emoji: '🥈', name: 'Argent',  pct: '5%',  desc: 'À partir de 120 MAD' },
              { emoji: '🥇', name: 'Or',      pct: '10%', desc: 'À partir de 300 MAD' },
              { emoji: '💎', name: 'Platine', pct: '15%', desc: 'À partir de 600 MAD' },
            ].map((lvl, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-white/80 text-sm flex items-center gap-2">
                  <span>{lvl.emoji}</span> {lvl.name}
                </span>
                <div className="text-right">
                  <span className="font-bold text-sm" style={{ color: '#F4C542' }}>−{lvl.pct}</span>
                  <span className="text-white/30 text-xs ml-2">{lvl.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

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

          {/* Success */}
          {success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl"
                style={{ background: '#f0fdf4', border: '2px solid #bbf7d0' }}>
                ✅
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1B2A6B' }}>Compte créé !</h2>
              <p className="text-gray-500 text-sm mb-1">Vérifiez votre boîte mail pour confirmer votre adresse.</p>
              <p className="text-gray-400 text-xs">Redirection vers la connexion…</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B2A6B', letterSpacing: '-0.02em' }}>
                  Créer un compte
                </h1>
                <p className="text-gray-500 text-sm">Rejoignez Hannouty gratuitement</p>
              </div>

              {error && (
                <div className="mb-5 p-4 rounded-2xl flex items-center gap-3"
                  style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <span className="text-lg">⚠️</span>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-5">

                {/* Nom complet */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1B2A6B' }}>
                    Nom complet
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Votre nom complet"
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm transition-all"
                      style={{ background: '#fff', border: '1.5px solid #e2e8f0', color: '#1B2A6B', outline: 'none' }}
                      onFocus={e => { e.target.style.borderColor = '#1B2A6B'; e.target.style.boxShadow = '0 0 0 3px rgba(27,42,107,0.1)' }}
                      onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#1B2A6B' }}>
                    Adresse email
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm transition-all"
                      style={{ background: '#fff', border: '1.5px solid #e2e8f0', color: '#1B2A6B', outline: 'none' }}
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
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 6 caractères"
                      required
                      minLength={6}
                      className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm transition-all"
                      style={{ background: '#fff', border: '1.5px solid #e2e8f0', color: '#1B2A6B', outline: 'none' }}
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

                  {/* Indicateur force */}
                  {password.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex gap-1.5">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                            style={{ background: i <= strength ? strengthColor[strength] : '#e2e8f0' }} />
                        ))}
                      </div>
                      <p className="text-xs font-medium" style={{ color: strengthColor[strength] }}>
                        {strengthLabel[strength]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-sm transition-all"
                  style={{
                    background: loading ? '#94a3b8' : '#F4C542',
                    color: '#1B2A6B',
                    boxShadow: loading ? 'none' : '0 4px 14px rgba(244,197,66,0.4)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Création du compte…
                    </span>
                  ) : 'Créer mon compte →'}
                </button>
              </form>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
                <span className="text-xs text-gray-400">ou</span>
                <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Déjà un compte ?{' '}
                  <Link href="/login" className="font-bold" style={{ color: '#1B2A6B' }}>
                    Se connecter
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
