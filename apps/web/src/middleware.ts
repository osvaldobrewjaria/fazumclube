import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware para rotas legadas
 * 
 * /admin/* → redirect neutro para /app/dashboard
 * 
 * IMPORTANTE: Este é o fallback server-side para requests sem JavaScript
 * (crawlers, curl, prefetch). O redirect inteligente acontece no client-side.
 * 
 * Nunca redireciona para um tenant específico como fallback.
 * Brewjaria é apenas um tenant, não um "default".
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rota legada /admin/* → fallback neutro
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    // Fallback server-side: sempre para /app/dashboard
    // O client-side fará o redirect inteligente se houver JS
    return NextResponse.redirect(new URL('/app/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
