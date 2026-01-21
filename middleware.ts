// File: middleware.ts
// Purpose: Root middleware for route protection and authentication
// Protects /dashboard routes and redirects authenticated users away from /login

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/properties', '/leads', '/clients', '/showings', '/settings']

  // Login routes that should redirect authenticated users to dashboard
  const loginRoutes = ['/login']

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Check if current route is a login route (not signup)
  const isLoginRoute = loginRoutes.some(route => pathname.includes(route))

  // If no user and trying to access protected route, redirect to login
  if (!user && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectedFrom', pathname)
    return Response.redirect(loginUrl)
  }

  // If user is authenticated and trying to access login, redirect to dashboard
  // But allow signup even if authenticated (they can create another account or see the form)
  if (user && isLoginRoute) {
    return Response.redirect(new URL('/dashboard', request.url))
  }

  // For all other cases (including home page), continue normally
  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
