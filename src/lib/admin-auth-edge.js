function getAdminSessionSecret() {
    return (
        process.env.ADMIN_SESSION_SECRET ||
        process.env.NEWSLETTER_SECRET ||
        process.env.ADMIN_PASSWORD ||
        ''
    );
}

function base64UrlToBase64(value) {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4;

    if (padding === 0) {
        return normalized;
    }

    return normalized + '='.repeat(4 - padding);
}

function decodeBase64Url(value) {
    return atob(base64UrlToBase64(value));
}

function bytesToBase64(bytes) {
    let output = '';

    bytes.forEach((byte) => {
        output += String.fromCharCode(byte);
    });

    return btoa(output);
}

function toBase64Url(bytes) {
    return bytesToBase64(bytes)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function signValue(value) {
    const secret = getAdminSessionSecret();

    if (!secret) {
        return '';
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(value)
    );

    return toBase64Url(new Uint8Array(signature));
}

export async function verifyAdminSessionToken(token) {
    if (!token || !getAdminSessionSecret()) {
        return false;
    }

    const [payload, signature] = token.split('.');

    if (!payload || !signature) {
        return false;
    }

    const expectedSignature = await signValue(payload);

    if (signature !== expectedSignature) {
        return false;
    }

    try {
        const session = JSON.parse(decodeBase64Url(payload));
        return typeof session.exp === 'number' && session.exp > Date.now() / 1000;
    } catch {
        return false;
    }
}
