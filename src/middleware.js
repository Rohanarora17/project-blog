import { NextResponse } from 'next/server';
import { verifyAdminSessionToken } from '@/lib/admin-auth-edge';
import {
    ADMIN_SESSION_COOKIE,
    ADMIN_STUDIO_ENABLED,
} from '@/lib/site-config';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Protect /admin and /api/admin routes, but exclude login pages/APIs
    const isProtected =
        (pathname.startsWith('/admin') ||
            pathname.startsWith('/api/admin') ||
            pathname.startsWith('/studio')) &&
        !pathname.startsWith('/admin/login') &&
        !pathname.startsWith('/api/admin/auth');

    if (isProtected) {
        if (pathname.startsWith('/studio') && !ADMIN_STUDIO_ENABLED) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }

        const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
        const isValid = await verifyAdminSessionToken(token);

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
    matcher: ['/admin/:path*', '/api/admin/:path*', '/studio/:path*'],
};
