import { NextResponse } from 'next/server';
import crypto from 'crypto';
import {
    createAdminSessionToken,
    getAdminSessionCookieOptions,
} from '@/lib/admin-auth';

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map();

function getClientIp(request) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    return forwardedFor?.split(',')[0]?.trim() || 'unknown';
}

function compareSecrets(provided, expected) {
    const providedBuffer = Buffer.from(provided || '');
    const expectedBuffer = Buffer.from(expected || '');

    if (providedBuffer.length !== expectedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

function getAttemptState(ipAddress) {
    const now = Date.now();
    const currentState = loginAttempts.get(ipAddress);

    if (!currentState || currentState.expiresAt < now) {
        const nextState = {
            count: 0,
            expiresAt: now + BLOCK_WINDOW_MS,
        };

        loginAttempts.set(ipAddress, nextState);
        return nextState;
    }

    return currentState;
}

export async function POST(request) {
    try {
        const { password, action } = await request.json();
        const { name: cookieName, options: cookieOptions } =
            getAdminSessionCookieOptions();

        // Logout
        if (action === 'logout') {
            const response = NextResponse.json({ message: 'Logged out' });
            response.cookies.set(cookieName, '', {
                ...cookieOptions,
                maxAge: 0,
            });
            return response;
        }

        // Login
        const adminPassword = process.env.ADMIN_PASSWORD;
        const ipAddress = getClientIp(request);
        const attemptState = getAttemptState(ipAddress);

        if (!adminPassword) {
            return NextResponse.json(
                { error: 'Admin not configured' },
                { status: 503 }
            );
        }

        if (attemptState.count >= MAX_LOGIN_ATTEMPTS) {
            return NextResponse.json(
                { error: 'Too many failed attempts. Please try again later.' },
                { status: 429 }
            );
        }

        if (!password) {
            return NextResponse.json(
                { error: 'Password required' },
                { status: 400 }
            );
        }

        if (!compareSecrets(password, adminPassword)) {
            attemptState.count += 1;
            return NextResponse.json(
                { error: 'Invalid password' },
                { status: 401 }
            );
        }

        loginAttempts.delete(ipAddress);
        const token = createAdminSessionToken();

        const response = NextResponse.json({ message: 'Authenticated' });
        response.cookies.set(cookieName, token, cookieOptions);

        return response;
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
