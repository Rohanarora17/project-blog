import { PUBLIC_REVALIDATE_SECONDS, SITE_URL } from '@/lib/site-config';

export const revalidate = PUBLIC_REVALIDATE_SECONDS;

export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
