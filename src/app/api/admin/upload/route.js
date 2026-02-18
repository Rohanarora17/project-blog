import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export async function POST(request) {
    try {
        const body = await request.json();
        const { mode } = body;

        let title, slug, abstract, category, tags, content, publishedOn;

        if (mode === 'upload') {
            // Parse uploaded MDX file
            const { filename, content: rawContent } = body;

            if (!filename || !rawContent) {
                return NextResponse.json(
                    { error: 'Filename and content are required' },
                    { status: 400 }
                );
            }

            const { data: frontmatter, content: mdxBody } = matter(rawContent);

            title = frontmatter.title;
            slug = filename.replace('.mdx', '');
            abstract = frontmatter.abstract;
            category = frontmatter.category || '';
            tags = frontmatter.tags || [];
            content = mdxBody;
            publishedOn = frontmatter.publishedOn || new Date().toISOString();

            if (!title || !abstract) {
                return NextResponse.json(
                    {
                        error:
                            'MDX file must have "title" and "abstract" in frontmatter',
                    },
                    { status: 400 }
                );
            }
        } else if (mode === 'write') {
            title = body.title;
            slug = body.slug;
            abstract = body.abstract;
            category = body.category || '';
            tags = body.tags || [];
            content = body.body;
            publishedOn = new Date().toISOString();

            if (!title || !slug || !abstract || !content) {
                return NextResponse.json(
                    { error: 'Title, slug, abstract, and content are required' },
                    { status: 400 }
                );
            }
        } else {
            return NextResponse.json(
                { error: 'Invalid mode. Use "write" or "upload"' },
                { status: 400 }
            );
        }

        // Build the MDX file content
        const frontmatterObj = {
            title,
            abstract,
            publishedOn,
        };
        if (category) frontmatterObj.category = category;
        if (tags && tags.length > 0) frontmatterObj.tags = tags;

        const mdxContent = matter.stringify(content, frontmatterObj);

        // Write to the /content directory
        const contentDir = path.join(process.cwd(), 'content');
        const filePath = path.join(contentDir, `${slug}.mdx`);

        // Check if file already exists
        try {
            await fs.access(filePath);
            return NextResponse.json(
                { error: `A post with slug "${slug}" already exists` },
                { status: 409 }
            );
        } catch {
            // File doesn't exist — good to proceed
        }

        await fs.mkdir(contentDir, { recursive: true });
        await fs.writeFile(filePath, mdxContent, 'utf8');

        return NextResponse.json({
            message: 'Post created successfully',
            title,
            slug,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to create post' },
            { status: 500 }
        );
    }
}
