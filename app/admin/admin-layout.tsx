'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import {
  IconLayoutDashboard,
  IconListDetails,
  IconPackage,
  IconUsers,
  IconPlus,
  IconLogout,
} from '@tabler/icons-react'

const NAV_LINKS = [
  { href: '/admin',           icon: IconLayoutDashboard, label: 'Dashboard'  },
  { href: '/admin/orders',    icon: IconListDetails,     label: 'Commandes'  },
  { href: '/admin/products',  icon: IconPackage,         label: 'Produits'   },
  { href: '/admin/clients',   icon: IconUsers,           label: 'Clients'    },
  { href: '/admin/add-product', icon: IconPlus,          label: 'Ajouter un produit' },
]

function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()
      if (data?.role !== 'admin') { router.push('/products'); return }
      setFullName(data?.full_name ?? 'Admin')
    }
    load()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: 'var(--color-admin-surface)',
      borderRight: '1px solid var(--color-admin-border)',
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
        borderBottom: '1px solid var(--color-admin-border)',
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
          <p style={{ color: 'var(--color-admin-text)', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Hannouty
          </p>
          <p style={{ color: 'var(--color-admin-muted)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Admin
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <p style={{
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--color-admin-muted)',
          padding: '4px 12px', marginBottom: 4,
        }}>
          Navigation
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
                color: isActive ? 'var(--color-brand-gold)' : 'var(--color-admin-muted)',
                background: isActive ? 'rgba(244,197,66,0.10)' : 'transparent',
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
      </nav>

      {/* ── Profil + Déconnexion ── */}
      <div style={{
        borderTop: '1px solid var(--color-admin-border)',
        paddingTop: 'var(--space-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--color-brand-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
          }}>
            {fullName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p style={{ color: 'var(--color-admin-text)', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>{fullName}</p>
            <p style={{ color: 'var(--color-admin-muted)', fontSize: '0.7rem' }}>Administrateur</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 'var(--radius-md)',
            background: 'rgba(229,56,59,0.08)', border: '1px solid rgba(229,56,59,0.2)',
            color: '#E5383B', fontSize: '0.875rem', fontWeight: 600,
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--color-admin-bg)',
    }}>
      <AdminSidebar />
      <main style={{
        flex: 1,
        overflowX: 'hidden',
        background: 'var(--color-bg)',
      }}>
        {children}
      </main>
    </div>
  )
}
