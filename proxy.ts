import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Récupère le rôle
  let role = 'client'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role || 'client'
  }

  // --- Routes ADMIN ---
  if (path.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    if (role !== 'admin') return NextResponse.redirect(new URL('/', request.url))
  }

  // --- Routes CLIENT protégées ---
  const clientRoutes = ['/orders', '/profile', '/cart']
  if (clientRoutes.some(r => path.startsWith(r))) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    // Si admin essaie d'accéder aux pages client → redirige vers admin
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
  }

  // --- Page login/signup : si déjà connecté ---
  if (path === '/login' || path === '/signup') {
    if (user && role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
    if (user && role === 'client') return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/cart/:path*',
    '/login',
    '/signup',
  ],
}