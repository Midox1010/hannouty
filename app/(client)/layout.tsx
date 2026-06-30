'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { CartProvider } from '@/app/context/CartContext'
import { useCart } from '@/app/context/CartContext'
import {
  IconShoppingBag,
  IconShoppingCart,
  IconClipboardList,
  IconUser,
  IconLogout,
} from '@tabler/icons-react'

const NAV_LINKS = [
  { href: '/products', icon: IconShoppingBag,    label: 'Produits'       },
  { href: '/orders',   icon: IconClipboardList,  label: 'Mes commandes'  },
  { href: '/profile',  icon: IconUser,           label: 'Mon profil'     },
]

const LEVEL_BADGE: Record<string, string> = {
  Bronze:  'badge-bronze',
  Argent:  'badge-silver',
  Or:      'badge-gold',
  Platine: 'badge-platinum',
}

function ClientSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { totalItems } = useCart()
  const [profile, setProfile] = useState<{ full_name: string; level?: { name: string } } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('profiles')
        .select('full_name, role, levels(name)')
        .eq('id', user.id)
        .single()
      if (data?.role === 'admin') { router.push('/admin'); return }
      setProfile(data as any)
      setLoading(false)
    }
    load()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = (profile?.full_name ?? '?')
    .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: 'linear-gradient(180deg, var(--color-brand-green) 0%, var(--color-brand-green-mid) 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--space-lg)',
      gap: 'var(--space-sm)',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
      flexShrink: 0,
    }}>

      {/* ── Logo + Nom ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        paddingBottom: 'var(--space-lg)',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        marginBottom: 'var(--space-sm)',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 4, flexShrink: 0,
        }}>
          <Image src="/logo.png" alt="Hannouty" width={44} height={44} style={{ objectFit: 'contain', width: '100%', height: '100%' }} priority />
        </div>
        <div>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Hannouty
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Épicerie en ligne
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <p style={{
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
          padding: '4px 12px', marginBottom: 4,
        }}>
          Menu
        </p>

        {NAV_LINKS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-brand-gold)' : 'rgba(255,255,255,0.75)',
                background: isActive ? 'rgba(244,197,66,0.12)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--color-brand-gold)' : '2px solid transparent',
                transition: 'all 0.15s',
                textDecoration: 'none',
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}

        {/* Panier avec compteur */}
        <Link
          href="/cart"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            fontWeight: pathname === '/cart' ? 600 : 500,
            color: pathname === '/cart' ? 'var(--color-brand-gold)' : 'rgba(255,255,255,0.75)',
            background: pathname === '/cart' ? 'rgba(244,197,66,0.12)' : 'transparent',
            borderLeft: pathname === '/cart' ? '2px solid var(--color-brand-gold)' : '2px solid transparent',
            transition: 'all 0.15s',
            textDecoration: 'none',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconShoppingCart size={18} />
            Mon panier
          </span>
          {totalItems > 0 && (
            <span style={{
              background: 'var(--color-brand-gold)',
              color: 'var(--color-brand-green)',
              fontSize: '0.7rem', fontWeight: 800,
              width: 20, height: 20, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {totalItems}
            </span>
          )}
        </Link>
      </nav>

      {/* ── Niveau fidélité ── */}
      {profile?.level && (
        <div style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          marginBottom: 'var(--space-sm)',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
            Niveau fidélité
          </p>
          <span className={`badge ${LEVEL_BADGE[profile.level.name] ?? 'badge-bronze'}`}>
            {profile.level.name}
          </span>
        </div>
      )}

      {/* ── Profil + Déconnexion ── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.12)',
        paddingTop: 'var(--space-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)',
      }}>
        {!loading && profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'var(--color-brand-gold)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-brand-green)', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>
                {profile.full_name}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>Client</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s', width: '100%',
          }}
        >
          <IconLogout size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <ClientSidebar />
      <main style={{ flex: 1, overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <ClientLayoutInner>{children}</ClientLayoutInner>
    </CartProvider>
  )
}
