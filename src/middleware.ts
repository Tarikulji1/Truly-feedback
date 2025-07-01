export { default } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

 
export async function middleware(request: NextRequest) {

    const token = await getToken({req: request});
    const url = request.nextUrl;

    if (token && 
        (
          url.pathname === '/' ||
          url.pathname.startsWith('/sign-up') ||
          url.pathname.startsWith('/verify') ||
            url.pathname.startsWith('/sign-in')
        )
    ) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!token && url.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

  return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/',
    '/sign-up',
    '/verify/:path*',
    '/sign-in',
    '/dashboard/:path*',
],
}