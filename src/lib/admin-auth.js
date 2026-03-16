import crypto from 'crypto';
import {
    ADMIN_SESSION_COOKIE,
    ADMIN_SESSION_TTL_SECONDS,
} from '@/lib/site-config';

function getAdminSessionSecret() {
    return (
        process.env.ADMIN_SESSION_SECRET ||
        process.env.NEWSLETTER_SECRET ||
        process.env.ADMIN_PASSWORD ||
        ''
    );
}

function toBase64Url(input) {
    return Buffer.from(input).toString('base64url');
}

function fromBase64Url(input) {
    return Buffer.from(input, 'base64url').toString('utf8');
}

function signValue(value) {
    return crypto
        .createHmac('sha256', getAdminSessionSecret())
        .update(value)
        .digest('base64url');
}

export function createAdminSessionToken() {
    const now = Math.floor(Date.now() / 1000);
    const payload = toBase64Url(
        JSON.stringify({
            iat: now,
            exp: now + ADMIN_SESSION_TTL_SECONDS,
        })
    );

    const signature = signValue(payload);
    return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token) {
    if (!token || !getAdminSessionSecret()) {
        return false;
    }

    const [payload, signature] = token.split('.');

    if (!payload || !signature) {
        return false;
    }

    const expectedSignature = signValue(payload);
    const provided = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (
        provided.length !== expected.length ||
        !crypto.timingSafeEqual(provided, expected)
    ) {
        return false;
    }

    try {
        const session = JSON.parse(fromBase64Url(payload));
        return typeof session.exp === 'number' && session.exp > Date.now() / 1000;
    } catch {
        return false;
    }
}

export function getAdminSessionCookieOptions() {
    return {
        name: ADMIN_SESSION_COOKIE,
        options: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: ADMIN_SESSION_TTL_SECONDS,
            path: '/',
        },
    };
}
