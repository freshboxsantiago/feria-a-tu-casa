import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Usamos getUser() que es la forma segura de verificar la sesión en el servidor
  const { data: { user } } = await supabase.auth.getUser()

  // Proteger las rutas de administración
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // Si no hay usuario, redirigir al login
      return NextResponse.redirect(new URL('/register', request.url))
    }
    
    // OPCIONAL: Si quieres que SOLO TÚ seas admin, descomenta esto:
     if (user.email !== 'freshboxsantiago@gmail.com') {
       return NextResponse.redirect(new URL('/', request.url))
     }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas de /admin y sus sub-rutas
     */
    '/admin/:path*',
  ],
}