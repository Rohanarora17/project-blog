import { NextResponse } from 'next/server';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Protect /admin and /api/admin routes, but exclude login pages/APIs
    const isProtected =
        (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) &&
        !pathname.startsWith('/admin/login') &&
        !pathname.startsWith('/api/admin/auth');

    if (isProtected) {
        const token = request.cookies.get('admin_token')?.value;

        // Validate token using Web Crypto
        const password = process.env.ADMIN_PASSWORD || '';
        const secret = process.env.NEWSLETTER_SECRET || 'fallback-secret';

        let isValid = false;
        if (token) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password + secret);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const expectedToken = hashArray
                .map((b) => b.toString(16).padStart(2, '0'))
                .join('');
            isValid = (token === expectedToken);


        }

        if (!isValid) {
            // Return 401 for API routes
            if (pathname.startsWith('/api/')) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
            // Redirect for UI routes
            const loginUrl = new URL('/admin/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
