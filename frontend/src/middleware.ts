import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Pega no cookie de forma segura
  const token = request.cookies.get('zc_token')?.value;
  const path = request.nextUrl.pathname;
  
  // Verifica se a rota atual é pública (login)
  const isPublicPath = path === '/login';

  // Se o utilizador tentar aceder a uma rota protegida SEM token
  if (!isPublicPath && !token) {
    // Redireciona para o login de forma limpa, clonando o URL base
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se o utilizador já tem token e tenta aceder à página de login
  if (isPublicPath && token) {
    // Redireciona para o dashboard
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Caso contrário, deixa o pedido passar (ex: página protegida COM token, ou login SEM token)
  return NextResponse.next();
}

export const config = {
  // Aplica o middleware a todas as rotas, exceto ficheiros estáticos e rotas de API do Next.js
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};