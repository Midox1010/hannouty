import type { Metadata } from 'next'
import './globals.css'
import Navbar from './components/Navbar'
import { CartProvider } from './context/CartContext'

export const metadata: Metadata = {
  title: 'Hannouty - Supermarché en ligne',
  description: 'Vos produits alimentaires livrés à domicile',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hannouty',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                if (e.message && (e.message.includes('Loading chunk') || e.message.includes('Failed to fetch'))) {
                  window.location.href = window.location.href;
                }
              });
              window.addEventListener('unhandledrejection', function(e) {
                var msg = e.reason && e.reason.message;
                if (msg && (msg.includes('Loading chunk') || msg.includes('Failed to fetch') || msg.includes('dynamically imported module'))) {
                  window.location.href = window.location.href;
                }
              });
            `,
          }}
        />
        <CartProvider>
          <Navbar />
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
EOF

cat > /mnt/user-data/outputs/Navbar.tsx << 'EOF'
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
  IconPlus,
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

/* ─────────────────────────────────────────────
   Routes où la navbar est complètement cachée.
   Ajoutez ici toute future page sans navbar.
───────────────────────────────────────────── */
const NO_NAVBAR_ROUTES = ['/login', '/signup']

/* ─────────────────────────────────────────────
   Routes admin : sidebar sombre séparé.
   Tout ce qui commence par /admin est géré
   par le sidebar admin, pas le sidebar client.
───────────────────────────────────────────── */
const ADMIN_PREFIX = '/admin'

export default function Navbar() {
  const supabase   = createClient()
  const router     = useRouter()
  const pathname   = usePathname()
  const sidebarRef = useRef<HTMLDivElement>(null)

  const [profile,  setProfile]  = useState<Profile | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [sideOpen, setSideOpen] = useState(false)

  /* ── Scroll shadow ── */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* ── Fermer sidebar si clic en dehors ── */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node))
        setSideOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  /* ── Fermer sidebar au changement de page ── */
  useEffect(() => { setSideOpen(false) }, [pathname])

  /* ── Bloquer scroll body quand sidebar ouvert ── */
  useEffect(() => {
    document.body.style.overflow = sideOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sideOpen])

  /* ── Fetch profile ── */
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

  /* ══════════════════════════════════════════
     RÈGLE UNIQUE ET DÉFINITIVE :
     1. Page dans NO_NAVBAR_ROUTES → rien
     2. Page admin → sidebar admin sombre
     3. Tout le reste → sidebar client vert
     (fonctionne pour toute future page)
  ══════════════════════════════════════════ */
  const isNoNavbar = NO_NAVBAR_ROUTES.includes(pathname)
  const isAdmin    = pathname.startsWith(ADMIN_PREFIX)
  const isClient   = !isNoNavbar && !isAdmin

  /* Pas de navbar du tout */
  if (isNoNavbar) return null

  if (loading) {
    return (
      <div style={{
        height: 60,
        background: isAdmin
          ? 'rgba(15,23,42,0.95)'
          : 'linear-gradient(120deg,#0a3326,#0E5C3F)',
      }} />
    )
  }

  /* ── Lien sidebar client ── */
  const ClientLink = ({ href, icon, children }: {
    href: string; icon: React.ReactNode; children: React.ReactNode
  }) => {
    const active = pathname === href || pathname.startsWith(href + '/')
    return (
      <Link href={href} onClick={() => setSideOpen(false)} style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '13px 18px', borderRadius: 14,
        color: active ? '#fff' : 'rgba(255,255,255,.78)',
        fontWeight: active ? 700 : 500, fontSize: 15,
        background: active ? 'rgba(255,255,255,.14)' : 'transparent',
        borderLeft: active ? '3px solid #f2b705' : '3px solid transparent',
        transition: 'all .18s ease', textDecoration: 'none',
      }}>
        <span style={{ opacity: active ? 1 : 0.7, flexShrink: 0 }}>{icon}</span>
        {children}
      </Link>
    )
  }

  /* ── Lien sidebar admin ── */
  const AdminLink = ({ href, icon, children }: {
    href: string; icon: React.ReactNode; children: React.ReactNode
  }) => {
    const active = pathname === href
    return (
      <Link href={href} onClick={() => setSideOpen(false)} style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 16px', borderRadius: 12,
        color: active ? '#f2b705' : 'var(--color-admin-muted)',
        fontWeight: active ? 700 : 500, fontSize: 14.5,
        background: active ? 'rgba(242,183,5,.1)' : 'transparent',
        borderLeft: active ? '3px solid #f2b705' : '3px solid transparent',
        transition: 'all .18s ease', textDecoration: 'none',
      }}>
        <span style={{ flexShrink: 0 }}>{icon}</span>
        {children}
      </Link>
    )
  }

  /* ════════════════════════════════════════════
     RENDU ADMIN
  ════════════════════════════════════════════ */
  if (isAdmin) {
    return (
      <>
        {/* Barre admin */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 300,
          height: 60, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 16px',
          background: 'rgba(15,23,42,0.97)',
          borderBottom: '1px solid var(--color-admin-border)',
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,.5)' : 'none',
          transition: 'box-shadow .3s',
        }}>
          {/* Hamburger */}
          <button onClick={() => setSideOpen(o => !o)} style={{
            width: 42, height: 42, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.08)', borderRadius: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', transition: 'background .2s',
          }}>
            <IconMenu2 size={22} />
          </button>

          {/* Logo centré */}
          <Link href="/admin" style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Image src="/logo.png" alt="Hannouty" width={36} height={36}
              style={{ objectFit: 'contain' }} priority />
            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
              Hannouty
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#0F172A',
              background: 'linear-gradient(135deg,#f7cc3a,#c98f04)',
              padding: '2px 8px', borderRadius: 999,
            }}>ADMIN</span>
          </Link>

          {/* Nom utilisateur */}
          <span style={{ fontSize: 13, color: 'var(--color-admin-muted)' }}>
            {profile?.full_name}
          </span>
        </nav>

        {/* Overlay */}
        <div onClick={() => setSideOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 398,
          background: 'rgba(0,0,0,.55)',
          opacity: sideOpen ? 1 : 0,
          pointerEvents: sideOpen ? 'all' : 'none',
          transition: 'opacity .3s ease',
        }} />

        {/* Sidebar admin */}
        <div ref={sidebarRef} style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: 260,
          zIndex: 399,
          background: 'var(--color-admin-surface)',
          borderRight: '1px solid var(--color-admin-border)',
          boxShadow: sideOpen ? '8px 0 32px rgba(0,0,0,.5)' : 'none',
          transform: sideOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .32s cubic-bezier(0.22,1,0.36,1)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-admin-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Image src="/logo.png" alt="Hannouty" width={34} height={34}
                style={{ objectFit: 'contain' }} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Hannouty</div>
                <div style={{ fontSize: 11, color: 'var(--color-admin-muted)' }}>Administration</div>
              </div>
            </div>
            <button onClick={() => setSideOpen(false)} style={{
              width: 32, height: 32, border: 'none', cursor: 'pointer',
              background: 'rgba(255,255,255,.08)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>
              <IconX size={17} />
            </button>
          </div>

          {/* Liens */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
            <p style={{
              fontSize: 10, fontWeight: 700, color: 'var(--color-admin-muted)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '6px 16px 8px',
            }}>Navigation</p>
            <AdminLink href="/admin"          icon={<IconLayoutDashboard size={19}/>}>Dashboard</AdminLink>
            <AdminLink href="/admin/orders"   icon={<IconListDetails size={19}/>}>Commandes</AdminLink>
            <AdminLink href="/admin/products" icon={<IconPackage size={19}/>}>Produits</AdminLink>
            <AdminLink href="/admin/clients"  icon={<IconUsers size={19}/>}>Clients</AdminLink>
            <AdminLink href="/admin/add-product" icon={<IconPlus size={19}/>}>Ajouter un produit</AdminLink>
          </div>

          {/* Profil + déconnexion */}
          <div style={{
            padding: '14px', borderTop: '1px solid var(--color-admin-border)',
          }}>
            {profile && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#f7cc3a,#c98f04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800, color: '#1a1a1a', flexShrink: 0,
                }}>
                  {profile.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff' }}>
                    {profile.full_name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-admin-muted)' }}>
                    Administrateur
                  </div>
                </div>
              </div>
            )}
            <button onClick={handleLogout} style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
              padding: '12px', borderRadius: 12, border: 'none',
              background: 'rgba(229,56,59,.15)', color: '#f87171',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              transition: 'background .2s',
            }}>
              <IconLogout size={17}/> Déconnexion
            </button>
          </div>
        </div>
      </>
    )
  }

  /* ════════════════════════════════════════════
     RENDU CLIENT (toutes les autres pages)
  ════════════════════════════════════════════ */
  return (
    <>
      {/* Barre client */}
      <nav className={`navbar navbar-client ${scrolled ? 'scrolled' : ''}`} style={{
        padding: '0 16px', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 300,
      }}>
        {/* Hamburger — toujours visible */}
        <button onClick={() => setSideOpen(o => !o)} aria-label="Menu" style={{
          width: 42, height: 42, border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,.12)', borderRadius: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', flexShrink: 0, transition: 'background .2s',
        }}>
          <IconMenu2 size={22} />
        </button>

        {/* Logo centré */}
        <Link href="/" style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center',
        }}>
          <Image src="/logo.png" alt="Hannouty" width={44} height={44}
            style={{ objectFit: 'contain' }} priority />
        </Link>

        {/* Droite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {profile?.level && (
            <span className={`badge ${LEVEL_BADGE[profile.level.name] ?? ''}`}
              style={{ fontSize: 11 }}>
              {profile.level.name}
            </span>
          )}
          {profile ? (
            <Link href="/cart" style={{
              width: 42, height: 42, display: 'flex', alignItems: 'center',
              justifyContent: 'center', borderRadius: 11,
              background: 'rgba(255,255,255,.12)', color: '#fff',
            }}>
              <IconShoppingCart size={21} />
            </Link>
          ) : (
            <Link href="/login" className="btn btn-gold btn-sm">Connexion</Link>
          )}
        </div>
      </nav>

      {/* Overlay */}
      <div onClick={() => setSideOpen(false)} style={{
        position: 'fixed', inset: 0, zIndex: 398,
        background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(3px)',
        opacity: sideOpen ? 1 : 0,
        pointerEvents: sideOpen ? 'all' : 'none',
        transition: 'opacity .3s ease',
      }} />

      {/* Sidebar client */}
      <div ref={sidebarRef} style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
        zIndex: 399,
        background: 'linear-gradient(180deg,#0a3326 0%,#0E5C3F 60%,#0a3326 100%)',
        boxShadow: sideOpen ? '8px 0 32px rgba(0,0,0,.45)' : 'none',
        transform: sideOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .32s cubic-bezier(0.22,1,0.36,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 18px 14px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,.10)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image src="/logo.png" alt="Hannouty" width={36} height={36}
              style={{ objectFit: 'contain' }} />
            <span style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Hannouty</span>
          </div>
          <button onClick={() => setSideOpen(false)} style={{
            width: 34, height: 34, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,.12)', borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <IconX size={18} />
          </button>
        </div>

        {/* Profil */}
        {profile && (
          <div style={{
            margin: '14px 14px 4px', padding: '14px 16px',
            background: 'rgba(255,255,255,.07)', borderRadius: 16,
            border: '1px solid rgba(255,255,255,.10)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                background: profile.level
                  ? LEVEL_GRADIENT[profile.level.name] ?? 'rgba(255,255,255,.2)'
                  : 'rgba(255,255,255,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 17, fontWeight: 800, color: '#fff',
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

        {/* Liens */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
          <p style={{
            fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,.4)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '8px 18px 4px',
          }}>Navigation</p>
          <ClientLink href="/"         icon={<IconHome size={20}/>}>Accueil</ClientLink>
          <ClientLink href="/products" icon={<IconPackage size={20}/>}>Produits</ClientLink>
          {profile && <>
            <ClientLink href="/cart"    icon={<IconShoppingCart size={20}/>}>Mon panier</ClientLink>
            <ClientLink href="/orders"  icon={<IconListDetails size={20}/>}>Mes commandes</ClientLink>
            <ClientLink href="/profile" icon={<IconUser size={20}/>}>Mon profil</ClientLink>
          </>}
        </div>

        {/* Bas */}
        <div style={{ padding: '14px 14px 28px', borderTop: '1px solid rgba(255,255,255,.10)' }}>
          {profile ? (
            <button onClick={handleLogout} style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10,
              padding: '13px', borderRadius: 14, border: 'none',
              background: 'rgba(229,56,59,.85)', color: '#fff',
              fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
            }}>
              <IconLogout size={18}/> Déconnexion
            </button>
          ) : (
            <Link href="/login" onClick={() => setSideOpen(false)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, padding: '13px', borderRadius: 14,
              background: 'linear-gradient(135deg,#f7cc3a,#f2b705)',
              color: '#1a1a1a', fontSize: 14.5, fontWeight: 700,
              boxShadow: '0 4px 14px rgba(242,183,5,.4)',
            }}>
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </>
  )
}