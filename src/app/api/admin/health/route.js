import { NextResponse } from 'next/server';
import { getServiceHealth } from '@/lib/service-health';
import { getAdminBlogPostList } from '@/helpers/file-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const health = getServiceHealth();
        let postCount = null;

        try {
            const posts = await getAdminBlogPostList();
            postCount = posts.length;
        } catch (error) {
            console.warn('Unable to fetch post count for admin health:', error.message);
        }

        return NextResponse.json({
            ...health,
            postCount,
        });
    } catch (error) {
        console.error('Admin health error:', error);
        return NextResponse.json(
            { error: 'Failed to load service health.' },
            { status: 500 }
        );
    }
}
