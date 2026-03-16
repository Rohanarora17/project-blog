import { projectId, writeClient } from '@/sanity/lib/client';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resend } from '@/lib/resend';
import { SITE_URL, ADMIN_STUDIO_ENABLED } from '@/lib/site-config';

export function getServiceHealth() {
    return {
        siteUrl: SITE_URL,
        studioEnabled: ADMIN_STUDIO_ENABLED,
        services: {
            sanityRead: Boolean(projectId),
            sanityWrite: Boolean(writeClient),
            supabasePublic: Boolean(supabase),
            supabaseAdmin: Boolean(supabaseAdmin),
            resend: Boolean(resend),
            adminPassword: Boolean(process.env.ADMIN_PASSWORD),
        },
    };
}
