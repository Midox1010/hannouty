'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { IconMail, IconLock, IconEye, IconEyeOff, IconLoader2 } from '@tabler/icons-react'

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

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    // On vérifie le rôle AVANT de rediriger
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    setSuccess(true)

    const destination = profile?.role === 'admin' ? '/admin' : '/products'
    setTimeout(() => router.push(destination), 800)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)' }}>

      {/* ── Panneau gauche ── */}
      <div
        className="animate-fade-in"
        style={{
          width: '44%',
          background: 'linear-gradient(145deg, var(--color-brand-green) 0%, var(--color-brand-green-mid) 100%)',
          padding: 'var(--space-2xl)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Cercles déco */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'var(--color-brand-gold)', opacity: 0.08 }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'var(--color-brand-gold)', opacity: 0.06 }} />

        {/* Logo — petit, en haut */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, flexShrink: 0,
          }}>
            <Image src="/logo.png" alt="Hannouty" width={36} height={36} style={{ objectFit: 'contain', width: '100%', height: '100%' }} priority />
          </span>
          <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Hannouty</span>
        </div>

        {/* Logo — grand format, bien visible, centré */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 180, height: 180, borderRadius: 'var(--radius-xl)', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          }}>
            <Image src="/logo.png" alt="Hannouty - Votre épicerie en ligne" width={150} height={150} style={{ objectFit: 'contain', width: '100%', height: '100%' }} priority />
          </div>
        </div>

        {/* Contenu */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 'var(--space-md)' }}>
            Bienvenue sur<br />
            <span style={{ color: 'var(--color-brand-gold)' }}>Hannouty</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 'var(--space-lg)' }}>
            Faites vos courses en ligne et profitez de notre programme de fidélité exclusif.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {[
              { icon: '🛒', text: 'Catalogue de produits frais et locaux' },
              { icon: '🏆', text: 'Programme fidélité Bronze → Platine' },
              { icon: '🚚', text: 'Livraison rapide à domicile' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '1.1rem' }}>{f.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ position: 'relative', zIndex: 1, color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
          © 2026 Hannouty · Tous droits réservés
        </p>
      </div>

      {/* ── Panneau droit (formulaire) ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
        <div style={{ width: '100%', maxWidth: 420 }} className="animate-slide-up">

          <h1 style={{ marginBottom: 'var(--space-xs)', fontSize: '1.875rem' }}>Connexion</h1>
          <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>
            Entrez vos identifiants pour accéder à votre compte
          </p>

          {/* Success */}
          {success && (
            <div className="alert alert-success animate-slide-up" style={{ marginBottom: 'var(--space-lg)' }}>
              ✅ Connexion réussie ! Redirection…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-error animate-slide-up" style={{ marginBottom: 'var(--space-lg)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <div className="form-input-icon">
                <IconMail size={17} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <div className="form-input-icon">
                <IconLock size={17} className="input-icon" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="form-input"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 2 }}
                >
                  {showPwd ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 'var(--space-xs)' }}
            >
              {loading
                ? <><IconLoader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Connexion…</>
                : success ? '✓ Connecté !'
                : 'Se connecter →'
              }
            </button>
          </form>

          <div className="divider-text" style={{ marginBlock: 'var(--space-lg)' }}>ou</div>

          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            Pas encore de compte ?{' '}
            <Link href="/signup" style={{ color: 'var(--color-brand-green)', fontWeight: 700 }}>
              Créer un compte
            </Link>
          </p>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-sm)' }}>
            <Link href="/products" className="text-muted" style={{ fontSize: '0.8125rem' }}>
              ← Continuer sans compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}