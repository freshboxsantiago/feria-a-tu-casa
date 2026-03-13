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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // IMPORTANTE: Usar getUser() es más seguro, pero asegúrate de que no haya errores de red
  const { data: { user }, error } = await supabase.auth.getUser()

  // Si intentas entrar a /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Si no hay usuario O hay un error en la sesión, rebotar a registro
    if (error || !user) {
      return NextResponse.redirect(new URL('/register', request.url))
    }

    // SEGURIDAD EXTRA: Solo tu correo maestro puede entrar
    // Reemplaza esto con tu correo real
    if (user.email !== 'freshboxsantiago@gmail.com') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}