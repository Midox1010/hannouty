'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'

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
  { name: 'Bronze',  emoji: '🥉', discount: 0,  threshold: 0   },
  { name: 'Argent',  emoji: '🥈', discount: 5,  threshold: 120 },
  { name: 'Or',      emoji: '🥇', discount: 10, threshold: 300 },
  { name: 'Platine', emoji: '💎', discount: 15, threshold: 600 },
]

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement...</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Mon profil</h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Carte infos */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-4 p-5 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 text-xl font-semibold flex items-center justify-center flex-shrink-0">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-base">{profile?.full_name ?? 'Sans nom'}</p>
                <p className="text-sm text-gray-400 mt-0.5">{email}</p>
              </div>
            </div>

            <div className="px-5 py-2">
              {[
                { label: 'Nom complet', value: profile?.full_name, muted: !profile?.full_name },
                { label: 'Email', value: email },
                { label: 'Téléphone', value: null, muted: true },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400">{row.label}</span>
                  <span className={`text-sm font-medium ${row.muted ? 'text-gray-300 italic font-normal' : 'text-gray-900'}`}>
                    {row.value ?? 'Non renseigné'}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 pt-2">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Commandes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.order_count}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Total dépensé</p>
                <p className="text-xl font-bold text-gray-900">{stats.total_spent.toFixed(0)} <span className="text-sm font-normal text-gray-400">MAD</span></p>
              </div>
            </div>

            <div className="px-4 pb-4">
              <button onClick={handleLogout}
                className="w-full text-sm text-red-500 border border-red-200 hover:bg-red-50 py-2.5 rounded-xl transition-colors font-medium">
                Se déconnecter
              </button>
            </div>
          </div>

          {/* Carte niveau */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{currentLevel.emoji}</span>
                <div>
                  <p className="text-xs text-gray-400">Niveau actuel</p>
                  <p className="text-xl font-bold text-gray-900">{currentLevel.name}</p>
                </div>
              </div>
              <div className="bg-green-50 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-full">
                {currentLevel.discount}% de remise
              </div>
            </div>

            {nextLevel ? (
              <>
                <p className="text-xs text-gray-400 mb-2">
                  Progression vers {nextLevel.emoji} {nextLevel.name} ({nextLevel.discount}%)
                </p>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {stats.total_spent.toFixed(0)} MAD / {nextLevel.threshold} MAD
                  &nbsp;·&nbsp; encore {Math.max(0, nextLevel.threshold - stats.total_spent).toFixed(0)} MAD
                </p>
              </>
            ) : (
              <p className="text-sm text-green-600 font-medium">🎉 Niveau maximum atteint !</p>
            )}

            <div className="grid grid-cols-4 gap-2 mt-5">
              {LEVELS.map((lvl, i) => (
                <div key={lvl.name}
                  className={`text-center py-2.5 px-1 rounded-xl border text-xs font-medium transition-colors ${
                    i === currentLevelIdx
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : i < currentLevelIdx
                      ? 'bg-gray-50 border-gray-100 text-gray-400'
                      : 'border-gray-100 text-gray-300'
                  }`}>
                  <div className="text-lg mb-1">{lvl.emoji}</div>
                  {lvl.name}
                </div>
              ))}
            </div>

            <div className="mt-4 bg-green-50 rounded-xl p-3 text-xs text-green-700">
              <p className="font-medium mb-0.5">Comment progresser ?</p>
              <p className="text-green-600">Chaque commande passée augmente votre niveau de fidélité et débloque des remises supplémentaires.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
