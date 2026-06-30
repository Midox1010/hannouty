'use client'
import { useEffect, useState } from 'react'
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
} from '@tabler/icons-react'

type Profile = {
  role: string
  full_name: string
  level?: { name: string }
}

const LEVEL_BADGE: Record<string, string> = {
  Bronze: 'badge-bronze',
  Argent: 'badge-silver',
  Or: 'badge-gold',
  Platine: 'badge-platinum',
}

export default function Navbar() {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  // ✅ Tous les hooks d'abord, sans exception
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ✅ Les conditions de sortie viennent APRÈS tous les hooks
  if (pathname === '/login' || pathname === '/signup') return null
  if (pathname.startsWith('/admin')) return null
  if (
    pathname.startsWith('/products') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/profile')
  ) return null

  if (loading) return <div style={{ height: 64, background: 'var(--color-bg)' }} />

  const NavLink = ({ href, children, icon }: { href: string; children: React.ReactNode; icon?: React.ReactNode }) => {
    const active = pathname === href
    return (
      <Link href={href} className={`navbar-link ${active ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon}{children}
      </Link>
    )
  }

  // ── NAVBAR ADMIN ──
  if (profile?.role === 'admin') {
    return (
      <nav className={`navbar navbar-admin ${scrolled ? 'scrolled' : ''}`} style={{ padding: '0 28px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src="/logo.png"
              alt="Hannouty"
              width={44}
              height={44}
              style={{ objectFit: 'contain', width: 44, height: 44 }}
              priority
            />
          </Link>
          <span className="badge" style={{ background: 'var(--color-admin-accent)', color: '#0F172A' }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <NavLink href="/admin" icon={<IconLayoutDashboard size={16} />}>Dashboard</NavLink>
          <NavLink href="/admin/orders" icon={<IconListDetails size={16} />}>Commandes</NavLink>
          <NavLink href="/admin/products" icon={<IconPackage size={16} />}>Produits</NavLink>
          <NavLink href="/admin/clients" icon={<IconUsers size={16} />}>Clients</NavLink>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: 'var(--color-admin-muted)' }}>{profile.full_name}</span>
          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            <IconLogout size={15} />Déconnexion
          </button>
        </div>
      </nav>
    )
  }

  // ── NAVBAR CLIENT ──
  return (
    <nav className={`navbar navbar-client ${scrolled ? 'scrolled' : ''}`} style={{ padding: '0 28px', justifyContent: 'space-between' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
        <Image
          src="/logo.png"
          alt="Hannouty"
          width={48}
          height={48}
          style={{ objectFit: 'contain', width: 48, height: 48 }}
          priority
        />
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
              <span className={`badge ${LEVEL_BADGE[profile.level.name] ?? ''}`}>{profile.level.name}</span>
            )}
            <Link href="/cart" className="btn-icon" style={{ position: 'relative', background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
              <IconShoppingCart size={20} />
            </Link>
            <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)' }}>
              <IconLogout size={15} />Déconnexion
            </button>
          </>
        ) : (
          <Link href="/login" className="btn btn-gold btn-md">Connexion</Link>
        )}
      </div>
    </nav>
  )
}