'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  IconUser,
  IconMail,
  IconPhone,
  IconShoppingBag,
  IconCoin,
  IconTrophy,
  IconLogout,
} from '@tabler/icons-react'

type Profile = {
  full_name: string | null
  level_id: string | null
  levels: {
    name: string
    discount_percent: number
  } | null
}

type Stats = {
  order_count: number
  total_spent: number
}

const LEVELS = [
  { name: 'Bronze',  emoji: '🥉', discount: 0,  threshold: 0,   badgeClass: 'badge-bronze'   },
  { name: 'Argent',  emoji: '🥈', discount: 5,  threshold: 120, badgeClass: 'badge-silver'   },
  { name: 'Or',      emoji: '🥇', discount: 10, threshold: 300, badgeClass: 'badge-gold'     },
  { name: 'Platine', emoji: '💎', discount: 15, threshold: 600, badgeClass: 'badge-platinum' },
]

const LOYALTY_CARD_CLASS: Record<string, string> = {
  Bronze: 'bronze', Argent: 'silver', Or: 'gold', Platine: 'platinum',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [stats, setStats] = useState<Stats>({ order_count: 0, total_spent: 0 })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email ?? '')

      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name, level_id, levels(name, discount_percent)')
        .eq('id', user.id)
        .single()

      if (prof) setProfile(prof as any)

      const { data: orders } = await supabase
        .from('orders')
        .select('final_amount')
        .eq('user_id', user.id)

      if (orders) {
        setStats({
          order_count: orders.length,
          total_spent: orders.reduce((s, o) => s + (o.final_amount ?? 0), 0),
        })
      }

      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  const levelName = profile?.levels?.name ?? 'Bronze'
  const currentLevelIdx = LEVELS.findIndex(l => l.name === levelName)
  const currentLevel = LEVELS[currentLevelIdx] ?? LEVELS[0]
  const nextLevel = LEVELS[currentLevelIdx + 1] ?? null
  const progressPercent = nextLevel
    ? Math.min(100, Math.round((stats.total_spent / nextLevel.threshold) * 100))
    : 100

  const initials = (profile?.full_name ?? email)
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div className="container animate-fade-in" style={{ paddingBlock: 'var(--space-xl)' }}>

      {/* Header */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1>Mon profil</h1>
        <p className="text-muted" style={{ marginTop: 4 }}>Gérez vos informations personnelles et suivez votre fidélité</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', alignItems: 'start' }}>

        {/* Carte infos personnelles */}
        <div className="card" style={{ overflow: 'hidden' }}>

          {/* En-tête avatar */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-brand-green) 0%, var(--color-brand-green-mid) 100%)',
            padding: 'var(--space-xl) var(--space-lg)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
          }}>
            <div className="avatar avatar-lg" style={{
              background: 'var(--color-brand-gold)',
              color: 'var(--color-brand-green)',
              fontSize: '1.5rem',
              border: '3px solid rgba(255,255,255,0.3)',
            }}>
              {initials}
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.2 }}>
                {profile?.full_name ?? 'Sans nom'}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginTop: 2 }}>{email}</p>
              <span className={`badge ${currentLevel.badgeClass}`} style={{ marginTop: 8, display: 'inline-flex' }}>
                {currentLevel.emoji} {currentLevel.name}
              </span>
            </div>
          </div>

          {/* Infos */}
          <div style={{ padding: 'var(--space-md) var(--space-lg)' }}>
            {[
              { icon: IconUser,  label: 'Nom complet', value: profile?.full_name, muted: !profile?.full_name },
              { icon: IconMail,  label: 'Email',        value: email },
              { icon: IconPhone, label: 'Téléphone',    value: null, muted: true },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-md) 0',
                borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-muted)' }}>
                  <row.icon size={16} />
                  <span style={{ fontSize: '0.875rem' }}>{row.label}</span>
                </div>
                <span style={{
                  fontSize: '0.875rem', fontWeight: 500,
                  color: row.muted ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                  fontStyle: row.muted ? 'italic' : 'normal',
                }}>
                  {row.value ?? 'Non renseigné'}
                </span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-md)', padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)',
          }}>
            <div className="card card-stat" style={{ padding: 'var(--space-md)', boxShadow: 'none' }}>
              <div className="stat-icon" style={{ background: 'var(--color-brand-green-pale)', color: 'var(--color-brand-green)', width: 36, height: 36, margin: 0 }}>
                <IconShoppingBag size={18} />
              </div>
              <div className="stat-value" style={{ fontSize: '1.75rem', marginTop: 6 }}>{stats.order_count}</div>
              <div className="stat-label">Commandes</div>
            </div>
            <div className="card card-stat" style={{ padding: 'var(--space-md)', boxShadow: 'none' }}>
              <div className="stat-icon" style={{ background: 'var(--color-brand-green-pale)', color: 'var(--color-brand-green)', width: 36, height: 36, margin: 0 }}>
                <IconCoin size={18} />
              </div>
              <div className="stat-value" style={{ fontSize: '1.5rem', marginTop: 6 }}>
                {stats.total_spent.toFixed(0)}
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-muted)', marginLeft: 3 }}>MAD</span>
              </div>
              <div className="stat-label">Total dépensé</div>
            </div>
          </div>

          {/* Déconnexion */}
          <div style={{ padding: 'var(--space-md) var(--space-lg)', borderTop: '1px solid var(--color-border)' }}>
            <button onClick={handleLogout} className="btn btn-danger btn-md" style={{ width: '100%' }}>
              <IconLogout size={16} />
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Carte fidélité */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

          {/* Loyalty card visuelle */}
          <div className={`loyalty-card ${LOYALTY_CARD_CLASS[currentLevel.name] ?? 'bronze'}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
              <div>
                <p className="level-name">Niveau fidélité</p>
                <p style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, marginTop: 4 }}>
                  {currentLevel.emoji} {currentLevel.name}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: 2 }}>Remise</p>
                <p className="level-discount">{currentLevel.discount}%</p>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: 8 }}>
              {profile?.full_name ?? email}
            </p>

            {nextLevel ? (
              <>
                <p style={{ fontSize: '0.75rem', opacity: 0.65, marginBottom: 6 }}>
                  Progression vers {nextLevel.emoji} {nextLevel.name}
                </p>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    background: 'rgba(255,255,255,0.8)',
                    width: `${progressPercent}%`,
                    transition: 'width 0.6s var(--ease-out)',
                  }} />
                </div>
                <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: 6 }}>
                  {stats.total_spent.toFixed(0)} / {nextLevel.threshold} MAD · encore {Math.max(0, nextLevel.threshold - stats.total_spent).toFixed(0)} MAD
                </p>
              </>
            ) : (
              <p style={{ fontSize: '0.875rem', fontWeight: 600, opacity: 0.9 }}>🎉 Niveau maximum atteint !</p>
            )}
          </div>

          {/* Niveaux */}
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-md)' }}>
              <IconTrophy size={18} style={{ color: 'var(--color-brand-gold)' }} />
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>Niveaux disponibles</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LEVELS.map((lvl, i) => {
                const isActive = i === currentLevelIdx
                const isDone = i < currentLevelIdx
                return (
                  <div key={lvl.name} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 'var(--radius-md)',
                    background: isActive ? 'var(--color-brand-green-pale)' : 'var(--color-bg)',
                    border: `1px solid ${isActive ? 'var(--color-brand-green-light)' : 'var(--color-border)'}`,
                    opacity: i > currentLevelIdx ? 0.5 : 1,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '1.1rem' }}>{lvl.emoji}</span>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--color-brand-green)' : 'var(--color-text-primary)' }}>
                          {lvl.name}
                          {isActive && <span style={{ marginLeft: 6, fontSize: '0.7rem', background: 'var(--color-brand-green)', color: '#fff', padding: '1px 6px', borderRadius: 99 }}>Actuel</span>}
                          {isDone && <span style={{ marginLeft: 6, fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>✓</span>}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {lvl.threshold === 0 ? "Dès l'inscription" : `À partir de ${lvl.threshold} MAD`}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      fontWeight: 700, fontSize: '0.875rem',
                      color: isActive ? 'var(--color-brand-green)' : 'var(--color-text-muted)',
                    }}>
                      {lvl.discount > 0 ? `-${lvl.discount}%` : '—'}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="alert alert-info" style={{ marginTop: 'var(--space-md)', fontSize: '0.8rem' }}>
              💡 Chaque commande augmente votre niveau et débloque des remises supplémentaires.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
