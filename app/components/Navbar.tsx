'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'

type Profile = {
  role: string
  full_name: string
  level?: { name: string }
}

const LEVEL_STYLES: Record<string, string> = {
  Bronze: 'linear-gradient(135deg,#cd7f32,#a0522d)',
  Argent: 'linear-gradient(135deg,#b8b9bd,#7c7d80)',
  Or: 'linear-gradient(135deg,#f7cc3a,#c98f04)',
  Platine: 'linear-gradient(135deg,#e9e9ea,#9a9a9a)',
}

export default function Navbar() {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('role, full_name, levels(name)')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    fetchProfile()

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null)
        setLoading(false)
      } else {
        fetchProfile()
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <div style={{ height: 64, background: 'var(--cream, #FAF8F4)' }} />
  }

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const active = pathname === href
    return (
      <Link
        href={href}
        style={{
          position: 'relative',
          color: active ? '#fff' : 'rgba(255,255,255,0.78)',
          fontWeight: 500,
          fontSize: 14,
          padding: '6px 2px',
          transition: 'color .2s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = active ? '#fff' : 'rgba(255,255,255,0.78)')}
      >
        {children}
        <span
          style={{
            position: 'absolute',
            left: 0,
            bottom: -4,
            height: 2,
            width: '100%',
            borderRadius: 2,
            background: '#f2b705',
            transform: active ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform .25s ease',
          }}
        />
      </Link>
    )
  }

  // ==================== NAVBAR ADMIN ====================
  if (profile?.role === 'admin') {
    return (
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(15,20,18,0.92)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,.35)' : 'none',
          transition: 'box-shadow .3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            🛠️ Hannouty
          </span>
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: '#1a1a1a',
            background: 'linear-gradient(135deg,#f7cc3a,#c98f04)',
            padding: '3px 10px', borderRadius: 999, letterSpacing: '0.04em',
          }}>
            ADMIN
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <NavLink href="/admin">Dashboard</NavLink>
          <NavLink href="/admin/orders">Commandes</NavLink>
          <NavLink href="/admin/products">Produits</NavLink>
          <NavLink href="/admin/clients">Clients</NavLink>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{profile.full_name}</span>
          <button
            onClick={handleLogout}
            style={{
              fontSize: 13, fontWeight: 600, color: '#fff',
              background: 'rgba(220,38,38,0.85)', border: 'none',
              padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
              transition: 'transform .15s ease, background .2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.85)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Déconnexion
          </button>
        </div>
      </nav>
    )
  }

  // ==================== NAVBAR CLIENT ====================
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled
          ? 'linear-gradient(120deg, #0a3326 0%, #0E5C3F 55%, #137a52 100%)'
          : 'linear-gradient(120deg, #0E5C3F 0%, #137a52 60%, #189564 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 12s ease infinite',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: scrolled ? '0 6px 28px rgba(10,51,38,0.35)' : '0 2px 10px rgba(10,51,38,0.15)',
        transition: 'box-shadow .3s ease',
      }}
    >
      <Link href="/" style={{
        display: 'flex', alignItems: 'center', gap: 7,
        fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
      }}>
        <span style={{ fontSize: 21 }}>🛒</span>
        Hannouty
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
        <NavLink href="/products">Produits</NavLink>
        {profile && (
          <>
            <NavLink href="/orders">Mes commandes</NavLink>
            <NavLink href="/profile">Mon profil</NavLink>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {profile ? (
          <>
            {profile.level && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#fff',
                background: LEVEL_STYLES[profile.level.name] ?? 'rgba(255,255,255,0.18)',
                padding: '4px 12px', borderRadius: 999,
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                letterSpacing: '0.02em',
              }}>
                {profile.level.name}
              </span>
            )}
            <Link
              href="/cart"
              style={{
                position: 'relative', fontSize: 19, color: '#fff',
                width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, background: 'rgba(255,255,255,0.1)',
                transition: 'background .2s ease, transform .2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1.06)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              🛒
            </Link>
            <button
              onClick={handleLogout}
              style={{
                fontSize: 13, fontWeight: 600, color: '#fff',
                background: 'transparent', border: '1.5px solid rgba(255,255,255,0.35)',
                padding: '7px 15px', borderRadius: 10, cursor: 'pointer',
                transition: 'all .2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#fca5a5' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#fff' }}
            >
              Déconnexion
            </button>
          </>
        ) : (
          <Link
            href="/login"
            style={{
              fontSize: 13.5, fontWeight: 700, color: '#1a1a1a',
              background: 'linear-gradient(135deg,#f7cc3a,#f2b705)',
              padding: '9px 20px', borderRadius: 10,
              boxShadow: '0 4px 14px rgba(242,183,5,0.4)',
              transition: 'transform .2s ease, box-shadow .2s ease',
              display: 'inline-block',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(242,183,5,0.55)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(242,183,5,0.4)' }}
          >
            Connexion
          </Link>
        )}
      </div>
    </nav>
  )
}
