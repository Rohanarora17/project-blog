import { getBlogPostList } from '@/helpers/file-helpers';
import {
    PUBLIC_REVALIDATE_SECONDS,
    SITE_URL,
} from '@/lib/site-config';

export const revalidate = PUBLIC_REVALIDATE_SECONDS;

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
