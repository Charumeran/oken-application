import { NextResponse, type NextRequest } from 'next/server'

const SESSION_NAME = 'auth-session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 認証不要なパス
  const publicPaths = ['/', '/api/auth/login', '/api/auth/logout']
  const isPublicPath = publicPaths.includes(pathname)
  
  // セッションチェック
  const hasSession = request.cookies.has(SESSION_NAME)
  
  // 未認証でプライベートページにアクセスした場合
  if (!hasSession && !isPublicPath) {
    const loginUrl = new URL('/', request.url)
    return NextResponse.redirect(loginUrl)
  }
  
  // 認証済みでホームページにアクセスした場合はダッシュボードへリダイレクト
  if (hasSession && pathname === '/') {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}