import { NextResponse } from 'next/server';
import matter from 'gray-matter';
import { revalidatePath, revalidateTag } from 'next/cache';
import { writeClient } from '@/sanity/lib/client';
import { PUBLIC_CONTENT_TAG } from '@/lib/site-config';

function normalizeSlug(value) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { mode } = body;

        let title;
        let slug;
        let abstract;
        let category;
        let tags;
        let content;
        let publishedOn;

        if (mode === 'upload') {
            const { filename, content: rawContent } = body;

            if (!filename || !rawContent) {
                return NextResponse.json(
                    { error: 'Filename and content are required' },
                    { status: 400 }
                );
            }

            const { data: frontmatter, content: mdxBody } = matter(rawContent);

            title = frontmatter.title;
            slug = normalizeSlug(
                frontmatter.slug || filename.replace(/\.mdx?$/i, '')
            );
            abstract = frontmatter.abstract;
            category = frontmatter.category || '';
            tags = frontmatter.tags || [];
            content = mdxBody;
            publishedOn = frontmatter.publishedOn || new Date().toISOString();

            if (!title || !abstract || !slug) {
                return NextResponse.json(
                    {
                        error:
                            'MDX file must include title, abstract, and a valid slug or filename.',
                    },
                    { status: 400 }
                );
            }
        } else if (mode === 'write') {
            title = body.title;
            slug = normalizeSlug(body.slug || body.title || '');
            abstract = body.abstract;
            category = body.category || '';
            tags = body.tags || [];
            content = body.body;
            publishedOn = body.publishedOn || new Date().toISOString();

            if (!title || !slug || !abstract || !content) {
                return NextResponse.json(
                    { error: 'Title, slug, abstract, and content are required.' },
                    { status: 400 }
                );
            }
        } else {
            return NextResponse.json(
                { error: 'Invalid mode. Use "write" or "upload".' },
                { status: 400 }
            );
        }

        if (!writeClient) {
            return NextResponse.json(
                {
                    error:
                        'Sanity write access is not configured. Set SANITY_TOKEN to publish from the admin dashboard.',
                },
                { status: 503 }
            );
        }

        const existing = await writeClient.fetch(
            `*[_type == "post" && slug.current == $slug][0]{_id}`,
            { slug }
        );

        if (existing) {
            return NextResponse.json(
                { error: `A post with slug "${slug}" already exists in Sanity.` },
                { status: 409 }
            );
        }

        await writeClient.create({
            _type: 'post',
            title,
            slug: { _type: 'slug', current: slug },
            abstract,
            publishedAt: publishedOn,
            category,
            tags,
            mdxContent: content.trim(),
            body: [],
        });

        revalidateTag(PUBLIC_CONTENT_TAG);
        revalidatePath('/');
        revalidatePath(`/${slug}`);
        revalidatePath('/rss.xml');
        revalidatePath('/sitemap.xml');

        return NextResponse.json({
            message: 'Post created in Sanity successfully.',
            title,
            slug,
            source: 'sanity',
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: `Failed to create post: ${error.message}` },
            { status: 500 }
        );
    }
}
