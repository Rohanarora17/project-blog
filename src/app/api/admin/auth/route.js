import { NextResponse } from 'next/server';
import crypto from 'crypto';

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request) {
    try {
        const { password, action } = await request.json();

        // Logout
        if (action === 'logout') {
            const response = NextResponse.json({ message: 'Logged out' });
            response.cookies.set('admin_token', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 0,
                path: '/',
            });
            return response;
        }

        // Login
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminPassword) {
            return NextResponse.json(
                { error: 'Admin not configured' },
                { status: 503 }
            );
        }

        if (!password) {
            return NextResponse.json(
                { error: 'Password required' },
                { status: 400 }
            );
        }

        if (password !== adminPassword) {
            return NextResponse.json(
                { error: 'Invalid password' },
                { status: 401 }
            );
        }

        // Generate a session token
        const tokenHash = hashPassword(adminPassword + process.env.NEWSLETTER_SECRET);

        const response = NextResponse.json({ message: 'Authenticated' });
        response.cookies.set('admin_token', tokenHash, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
