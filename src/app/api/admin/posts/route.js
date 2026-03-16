import { NextResponse } from 'next/server';
import {
    canReadFromSanity,
    getAdminBlogPostList,
} from '@/helpers/file-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        if (!canReadFromSanity()) {
            return NextResponse.json(
                { error: 'Sanity is not configured for admin reads.' },
                { status: 503 }
            );
        }

        const posts = await getAdminBlogPostList();
        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch posts from Sanity.' },
            { status: 500 }
        );
    }
}
