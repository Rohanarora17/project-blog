const DEFAULT_SITE_URL = 'https://project-blog-sigma-ten.vercel.app';

export const PUBLIC_REVALIDATE_SECONDS = 300;
export const PUBLIC_CONTENT_TAG = 'blog-content';
export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;
export const ADMIN_STUDIO_ENABLED =
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_STUDIO === 'true';

export function normalizeSiteUrl(siteUrl = DEFAULT_SITE_URL) {
    return siteUrl.replace(/\/+$/, '');
}

export const SITE_URL = normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
);

export const SITE_ORIGIN = new URL(SITE_URL);
