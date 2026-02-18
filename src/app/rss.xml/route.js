import RSS from 'rss';

import {
  BLOG_TITLE,
  BLOG_DESCRIPTION,
} from '@/constants';
import { getBlogPostList } from '@/helpers/file-helpers';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rustwithrohan.com';

export async function GET() {
  const feed = new RSS({
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    site_url: SITE_URL,
    feed_url: `${SITE_URL}/rss.xml`,
    language: 'en',
    copyright: `${new Date().getFullYear()} ${BLOG_TITLE}`,
  });

  const blogPosts = await getBlogPostList();

  blogPosts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.abstract,
      date: post.publishedOn,
      url: `${SITE_URL}/${post.slug}`,
      categories: post.tags || [],
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}