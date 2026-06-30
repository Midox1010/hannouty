'use client'

import { useState } from 'react'
import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconMail, IconLock, IconUser, IconEye, IconEyeOff, IconLoader2 } from '@tabler/icons-react'

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

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabel = ['', 'Faible', 'Moyen', 'Fort']
  const strengthColor = ['', 'var(--color-brand-red)', 'var(--color-brand-gold)', '#22c55e']

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
      setError(error.message.includes('already') ? 'Un compte existe déjà avec cet email.' : error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2500)
    }
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
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'var(--color-brand-gold)', opacity: 0.08 }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'var(--color-brand-gold)', opacity: 0.06 }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-brand-gold)', color: 'var(--color-brand-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>H</span>
          <span style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Hannouty</span>
        </div>

        {/* Contenu */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 'var(--space-md)' }}>
            Rejoignez<br />
            <span style={{ color: 'var(--color-brand-gold)' }}>la communauté</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 'var(--space-lg)' }}>
            Créez votre compte et commencez à accumuler des points pour débloquer des remises exclusives.
          </p>

          <p className="text-label" style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 'var(--space-sm)' }}>Programme fidélité</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            {[
              { emoji: '🥉', name: 'Bronze',  pct: '0%',  sub: "Dès l'inscription" },
              { emoji: '🥈', name: 'Argent',  pct: '5%',  sub: 'À partir de 120 MAD' },
              { emoji: '🥇', name: 'Or',      pct: '10%', sub: 'À partir de 300 MAD' },
              { emoji: '💎', name: 'Platine', pct: '15%', sub: 'À partir de 600 MAD' },
            ].map((lvl, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>{lvl.emoji} {lvl.name}</span>
                <span>
                  <span style={{ color: 'var(--color-brand-gold)', fontWeight: 700, fontSize: '0.875rem' }}>−{lvl.pct}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginLeft: 8 }}>{lvl.sub}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ position: 'relative', zIndex: 1, color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
          © 2026 Hannouty · Tous droits réservés
        </p>
      </div>

      {/* ── Panneau droit ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
        <div style={{ width: '100%', maxWidth: 420 }} className="animate-slide-up">

          {success ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto var(--space-lg)' }}>✅</div>
              <h2 style={{ marginBottom: 'var(--space-sm)' }}>Compte créé !</h2>
              <p className="text-muted">Vérifiez votre boîte mail pour confirmer votre adresse.</p>
              <p className="text-muted" style={{ marginTop: 'var(--space-sm)', fontSize: '0.8rem' }}>Redirection vers la connexion…</p>
            </div>
          ) : (
            <>
              <h1 style={{ marginBottom: 'var(--space-xs)', fontSize: '1.875rem' }}>Créer un compte</h1>
              <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>
                Rejoignez Hannouty gratuitement
              </p>

              {error && (
                <div className="alert alert-error animate-slide-up" style={{ marginBottom: 'var(--space-lg)' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

                {/* Nom */}
                <div className="form-group">
                  <label className="form-label">Nom complet</label>
                  <div className="form-input-icon">
                    <IconUser size={17} className="input-icon" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Votre nom complet"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

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
                      placeholder="Minimum 6 caractères"
                      required
                      minLength={6}
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

                  {/* Indicateur force */}
                  {password.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1, 2, 3].map(i => (
                          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, transition: 'background 0.3s', background: i <= strength ? strengthColor[strength] : 'var(--color-border)' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: strengthColor[strength] }}>
                        {strengthLabel[strength]}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: 'var(--space-xs)' }}
                >
                  {loading
                    ? <><IconLoader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} /> Création…</>
                    : 'Créer mon compte →'
                  }
                </button>
              </form>

              <div className="divider-text" style={{ marginBlock: 'var(--space-lg)' }}>ou</div>

              <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Déjà un compte ?{' '}
                <Link href="/login" style={{ color: 'var(--color-brand-green)', fontWeight: 700 }}>
                  Se connecter
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
