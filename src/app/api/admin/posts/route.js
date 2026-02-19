import { NextResponse } from 'next/server';
import { getBlogPostList } from '@/helpers/file-helpers';

export const dynamic = 'force-dynamic';

// This route is protected by `src/middleware.js` which verifies the `admin_token` cookie.
export async function GET() {
    try {
        const posts = await getBlogPostList();
        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json([], { status: 500 });
    }
}
