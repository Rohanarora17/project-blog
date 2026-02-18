import { NextResponse } from 'next/server';
import { getBlogPostList } from '@/helpers/file-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const posts = await getBlogPostList();
        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json([], { status: 500 });
    }
}
