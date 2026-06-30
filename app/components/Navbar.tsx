'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import {
  IconShoppingCart,
  IconLayoutDashboard,
  IconListDetails,
  IconPackage,
  IconUsers,
  IconLogout,
  IconMenu2,
  IconX,
  IconHome,
  IconUser,
} from '@tabler/icons-react'

type Profile = {
  role: string
  full_name: string
  level?: { name: string }
}

const LEVEL_BADGE: Record<string, string> = {
  Bronze:  'badge-bronze',
  Argent:  'badge-silver',
  Or:      'badge-gold',
  Platine: 'badge-platinum',
}

const LEVEL_GRADIENT: Record<string, string> = {
  Bronze:  'linear-gradient(135deg,#cd7f32,#a0522d)',
  Argent:  'linear-gradient(135deg,#b8b9bd,#7c7d80)',
  Or:      'linear-gradient(135deg,#f7cc3a,#c98f04)',
  Platine: 'linear-gradient(135deg,#e9e9ea,#9a9a9a)',
}

export default function Navbar() {
  const supabase = createClient()
  const router   = useRouter()
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLDivElement>(null)

  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [sideOpen, setSideOpen] = useState(false)

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* fermer sidebar si clic en dehors */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSideOpen(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  /* fermer sidebar au changement de page */
  useEffect(() => { setSideOpen(false) }, [pathname])

  /* bloquer le scroll body quand sidebar ouverte */
  useEffect(() => {
    document.body.style.overflow = sideOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sideOpen])

  /* fetch profile */
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setProfile(null); setLoading(false); return }
      const { data } = await supabase
        .from('profiles')
        .select('role, full_name, levels(name)')
        .eq('id', user.id)
        .single()
      setProfile(data as any)
      setLoading(false)
    }
    fetchProfile()
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') { setProfile(null); setLoading(false) }
      else fetchProfile()
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    setSideOpen(false)
    await supabase.auth.signOut()
    router.push('/login')
  }

  /* cacher navbar sur login/signup */
  if (pathname === '/login' || pathname === '/signup') return null
  if (pathname.startsWith('/admin')) return null

  if (loading) return <div style={{ height: 64, background: 'var(--color-bg)' }} />

  const isAdmin = profile?.role === 'admin'

  /* lien sidebar */
  const SideLink = ({
    href, icon, children
  }: { href: string; icon: React.ReactNode; children: React.ReactNode }) => {
    const active = pathname === href
    return (
      <Link
        href={href}
        onClick={() => setSideOpen(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '13px 18px', borderRadius: 14,
          color: active ? '#fff' : 'rgba(255,255,255,.78)',
          fontWeight: active ? 700 : 500,
          fontSize: 15,
          background: active
            ? 'linear-gradient(120deg,rgba(255,255,255,.18),rgba(255,255,255,.10))'
            : 'transparent',
          borderLeft: active ? '3px solid #f2b705' : '3px solid transparent',
          transition: 'all .18s ease',
          textDecoration: 'none',
        }}
      >
        <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>{icon}</span>
        {children}
      </Link>
    )
  }

  return (
    <>
      {/* ══════════════════════════════════════
          BARRE PRINCIPALE — toujours visible
          ══════════════════════════════════════ */}
      <nav
        className={`navbar navbar-client ${scrolled ? 'scrolled' : ''}`}
        style={{
          padding: '0 16px',
          justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 300,
        }}
      >
        {/* ── Gauche : hamburger 3 traits TOUJOURS visible ── */}
        <button
          onClick={() => setSideOpen(o => !o)}
          aria-label="Menu"
          style={{
            width: 42, height: 42, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.12)', borderRadius: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0,
            transition: 'background .2s, transform .2s',
            transform: sideOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          <IconMenu2 size={22} />
        </button>

        {/* ── Centre : logo ── */}
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        }}>
          <Image
            src="/logo.png"
            alt="Hannouty"
            width={44}
            height={44}
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>

        {/* ── Droite : panier + badge niveau ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {profile?.level && (
            <span
              className={`badge ${LEVEL_BADGE[profile.level.name] ?? ''}`}
              style={{ fontSize: 11 }}
            >
              {profile.level.name}
            </span>
          )}
          {profile ? (
            <Link
              href="/cart"
              style={{
                width: 42, height: 42, display: 'flex', alignItems: 'center',
                justifyContent: 'center', borderRadius: 11,
                background: 'rgba(255,255,255,.12)', color: '#fff',
                transition: 'background .2s',
              }}
            >
              <IconShoppingCart size={21} />
            </Link>
          ) : (
            <Link href="/login" className="btn btn-gold btn-sm">
              Connexion
            </Link>
          )}
        </div>
      </nav>

      {/* ══════════════════════════════════════
          OVERLAY sombre derrière le sidebar
          ══════════════════════════════════════ */}
      <div
        onClick={() => setSideOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 398,
          background: 'rgba(0,0,0,.45)',
          backdropFilter: 'blur(3px)',
          opacity: sideOpen ? 1 : 0,
          pointerEvents: sideOpen ? 'all' : 'none',
          transition: 'opacity .3s ease',
        }}
      />

      {/* ══════════════════════════════════════
          SIDEBAR — glisse depuis la gauche
          ══════════════════════════════════════ */}
      <div
        ref={sidebarRef}
        style={{
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          width: 280,
          zIndex: 399,
          background: 'linear-gradient(180deg,#0a3326 0%,#0E5C3F 60%,#0a3326 100%)',
          boxShadow: sideOpen ? '8px 0 32px rgba(0,0,0,.45)' : 'none',
          transform: sideOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .32s cubic-bezier(0.22,1,0.36,1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── En-tête sidebar ── */}
        <div style={{
          padding: '18px 18px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,.10)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/logo.png" alt="Hannouty" width={36} height={36}
              style={{ objectFit: 'contain' }} />
            <span style={{
              fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
            }}>Hannouty</span>
          </div>
          <button
            onClick={() => setSideOpen(false)}
            style={{
              width: 34, height: 34, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,.12)', borderRadius: 9,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
            }}
          >
            <IconX size={18} />
          </button>
        </div>

        {/* ── Profil utilisateur ── */}
        {profile && (
          <div style={{
            margin: '14px 14px 4px',
            padding: '14px 16px',
            background: 'rgba(255,255,255,.07)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,.10)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: profile.level
                  ? LEVEL_GRADIENT[profile.level.name] ?? 'rgba(255,255,255,.2)'
                  : 'rgba(255,255,255,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, fontWeight: 800, color: '#fff', flexShrink: 0,
              }}>
                {profile.full_name?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  {profile.full_name}
                </div>
                {profile.level && (
                  <span className={`badge ${LEVEL_BADGE[profile.level.name] ?? ''}`}
                    style={{ fontSize: 10, marginTop: 3, display: 'inline-flex' }}>
                    {profile.level.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Liens de navigation ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
          <p style={{
            fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,.4)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '8px 18px 4px',
          }}>Navigation</p>

          <SideLink href="/"         icon={<IconHome size={20}/>}>Accueil</SideLink>
          <SideLink href="/products" icon={<IconPackage size={20}/>}>Produits</SideLink>

          {profile && (
            <>
              <SideLink href="/cart"    icon={<IconShoppingCart size={20}/>}>Mon panier</SideLink>
              <SideLink href="/orders"  icon={<IconListDetails size={20}/>}>Mes commandes</SideLink>
              <SideLink href="/profile" icon={<IconUser size={20}/>}>Mon profil</SideLink>
            </>
          )}
        </div>

        {/* ── Bas : déconnexion ou connexion ── */}
        <div style={{
          padding: '14px 14px 28px',
          borderTop: '1px solid rgba(255,255,255,.10)',
        }}>
          {profile ? (
            <button
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10,
                padding: '13px', borderRadius: 14, border: 'none',
                background: 'rgba(229,56,59,.85)', color: '#fff',
                fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
                transition: 'background .2s',
              }}
            >
              <IconLogout size={18} />
              Déconnexion
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setSideOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '13px', borderRadius: 14,
                background: 'linear-gradient(135deg,#f7cc3a,#f2b705)',
                color: '#1a1a1a', fontSize: 14.5, fontWeight: 700,
                boxShadow: '0 4px 14px rgba(242,183,5,.4)',
              }}
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </>
  )
}