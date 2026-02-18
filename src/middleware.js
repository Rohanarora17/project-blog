import { NextResponse } from 'next/server';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Only protect /admin routes (but not /admin/login)
    if (
        pathname.startsWith('/admin') &&
        !pathname.startsWith('/admin/login')
    ) {
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            const loginUrl = new URL('/admin/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Validate token using Web Crypto (Edge-compatible)
        const password = process.env.ADMIN_PASSWORD || '';
        const secret = process.env.NEWSLETTER_SECRET || 'fallback-secret';
        const encoder = new TextEncoder();
        const data = encoder.encode(password + secret);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const expectedToken = hashArray
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');

        if (token !== expectedToken) {
            const loginUrl = new URL('/admin/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
