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
} from '@tabler/icons-react'

type Profile = {
  role: string
  full_name: string
  level?: { name: string }
}

const LEVEL_BADGE: Record<string, string> = {
  Bronze: 'badge-bronze',
  Argent: 'badge-silver',
  Or:     'badge-gold',
  Platine:'badge-platinum',
}

export default function Navbar() {
  const supabase  = createClient()
  const router    = useRouter()
  const pathname  = usePathname()
  const menuRef   = useRef<HTMLDivElement>(null)

  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // ── hooks (avant tout return conditionnel) ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // fermer menu si clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // fermer menu au changement de page
  useEffect(() => { setMenuOpen(false) }, [pathname])

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
    setMenuOpen(false)
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ── conditions de sortie APRÈS les hooks ──
  if (pathname === '/login' || pathname === '/signup') return null
  if (pathname.startsWith('/admin')) return null
  if (
    pathname.startsWith('/products') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/profile')
  ) return null

  if (loading) return <div style={{ height: 64, background: 'var(--color-bg)' }} />

  // ── Desktop NavLink ──
  const NavLink = ({ href, children, icon }: {
    href: string; children: React.ReactNode; icon?: React.ReactNode
  }) => {
    const active = pathname === href
    return (
      <Link href={href} className={`navbar-link ${active ? 'active' : ''}`}
        style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon}{children}
      </Link>
    )
  }

  // ── Mobile NavLink ──
  const MobileLink = ({ href, children, icon }: {
    href: string; children: React.ReactNode; icon?: React.ReactNode
  }) => {
    const active = pathname === href
    return (
      <Link
        href={href}
        onClick={() => setMenuOpen(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px', borderRadius: 12,
          color: active ? '#fff' : 'rgba(255,255,255,.75)',
          fontWeight: active ? 600 : 500, fontSize: 15,
          background: active ? 'rgba(255,255,255,.14)' : 'transparent',
          transition: 'background .15s',
        }}
      >
        {icon}{children}
      </Link>
    )
  }

  const isAdmin = profile?.role === 'admin'
  const navBg   = isAdmin
    ? 'rgba(10,16,14,0.97)'
    : 'linear-gradient(120deg,#0a3326 0%,#0E5C3F 55%,#137a52 100%)'

  return (
    <div ref={menuRef}>
      {/* ════════════ BARRE PRINCIPALE ════════════ */}
      <nav
        className={`navbar ${isAdmin ? 'navbar-admin' : 'navbar-client'} ${scrolled ? 'scrolled' : ''}`}
        style={{
          padding: '0 20px',
          justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 200,
        }}
      >
        {/* ── Logo ── */}
        <Link href={isAdmin ? '/admin' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image
            src="/logo.png"
            alt="Hannouty"
            width={44}
            height={44}
            style={{ objectFit: 'contain' }}
            priority
          />
          {isAdmin && (
            <span className="badge" style={{ background: 'var(--color-admin-accent)', color: '#0F172A' }}>
              ADMIN
            </span>
          )}
        </Link>

        {/* ── Liens desktop (cachés sur mobile) ── */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isAdmin ? (
            <>
              <NavLink href="/admin"          icon={<IconLayoutDashboard size={16}/>}>Dashboard</NavLink>
              <NavLink href="/admin/orders"   icon={<IconListDetails size={16}/>}>Commandes</NavLink>
              <NavLink href="/admin/products" icon={<IconPackage size={16}/>}>Produits</NavLink>
              <NavLink href="/admin/clients"  icon={<IconUsers size={16}/>}>Clients</NavLink>
            </>
          ) : (
            <>
              <NavLink href="/products">Produits</NavLink>
              {profile && <NavLink href="/orders">Mes commandes</NavLink>}
              {profile && <NavLink href="/profile">Mon profil</NavLink>}
            </>
          )}
        </div>

        {/* ── Actions desktop (cachées sur mobile) ── */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {isAdmin ? (
            <>
              <span style={{ fontSize: 13, color: 'var(--color-admin-muted)' }}>{profile?.full_name}</span>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                <IconLogout size={15}/>Déconnexion
              </button>
            </>
          ) : profile ? (
            <>
              {profile.level && (
                <span className={`badge ${LEVEL_BADGE[profile.level.name] ?? ''}`}>
                  {profile.level.name}
                </span>
              )}
              <Link href="/cart" className="btn-icon"
                style={{ position: 'relative', background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
                <IconShoppingCart size={20}/>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)' }}>
                <IconLogout size={15}/>Déconnexion
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-gold btn-md">Connexion</Link>
          )}
        </div>

        {/* ── Bouton hamburger (visible uniquement mobile) ── */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          style={{
            width: 40, height: 40, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.12)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', flexShrink: 0,
            transition: 'background .2s',
          }}
        >
          {menuOpen ? <IconX size={20}/> : <IconMenu2 size={20}/>}
        </button>
      </nav>

      {/* ════════════ MENU MOBILE DÉROULANT ════════════ */}
      <div
        style={{
          position: 'fixed',
          top: 64,
          left: 0, right: 0,
          zIndex: 199,
          background: isAdmin ? '#0a100d' : '#0a3326',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          overflow: 'hidden',
          maxHeight: menuOpen ? '520px' : '0px',
          transition: 'max-height .35s cubic-bezier(0.22,1,0.36,1)',
          boxShadow: menuOpen ? '0 10px 30px rgba(0,0,0,.4)' : 'none',
        }}
      >
        <div style={{ padding: '10px 12px 20px' }}>

          {/* Liens nav */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 14 }}>
            {isAdmin ? (
              <>
                <MobileLink href="/admin"          icon={<IconLayoutDashboard size={18}/>}>Dashboard</MobileLink>
                <MobileLink href="/admin/orders"   icon={<IconListDetails size={18}/>}>Commandes</MobileLink>
                <MobileLink href="/admin/products" icon={<IconPackage size={18}/>}>Produits</MobileLink>
                <MobileLink href="/admin/clients"  icon={<IconUsers size={18}/>}>Clients</MobileLink>
              </>
            ) : (
              <>
                <MobileLink href="/products"       icon={<IconPackage size={18}/>}>Produits</MobileLink>
                {profile && <MobileLink href="/cart"    icon={<IconShoppingCart size={18}/>}>Mon panier</MobileLink>}
                {profile && <MobileLink href="/orders"  icon={<IconListDetails size={18}/>}>Mes commandes</MobileLink>}
                {profile && <MobileLink href="/profile" icon={<IconUsers size={18}/>}>Mon profil</MobileLink>}
              </>
            )}
          </div>

          {/* Séparateur */}
          <div style={{ height: 1, background: 'rgba(255,255,255,.08)', marginBottom: 14 }}/>

          {/* Bas : utilisateur + déconnexion */}
          {profile ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Avatar initiales */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {profile.full_name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff' }}>
                    {profile.full_name}
                  </div>
                  {profile.level && (
                    <span className={`badge ${LEVEL_BADGE[profile.level.name] ?? ''}`}
                      style={{ fontSize: 10, marginTop: 2 }}>
                      {profile.level.name}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-danger btn-sm"
                style={{ flexShrink: 0 }}
              >
                <IconLogout size={15}/>Déconnexion
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="btn btn-gold btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>

      {/* ════════════ CSS RESPONSIVE ════════════ */}
      <style>{`
        /* Desktop : liens visibles, hamburger caché */
        @media (min-width: 769px) {
          .nav-desktop   { display: flex !important; }
          .nav-hamburger { display: none  !important; }
        }
        /* Mobile : liens cachés, hamburger visible */
        @media (max-width: 768px) {
          .nav-desktop   { display: none  !important; }
          .nav-hamburger { display: flex  !important; }
        }
      `}</style>
    </div>
  )
}