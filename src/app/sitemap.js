import { getBlogPostList } from '@/helpers/file-helpers';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rustwithrohan.com';

export default async function sitemap() {
    const posts = await getBlogPostList();

    const blogPosts = posts.map((post) => ({
        url: `${SITE_URL}/${post.slug}`,
        lastModified: new Date(post.publishedOn),
        changeFrequency: 'monthly',
        priority: 0.8,
    }));

    return [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        ...blogPosts,
    ];
}
