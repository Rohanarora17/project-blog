import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { unstable_cache } from 'next/cache';
import { client, projectId, writeClient } from '@/sanity/lib/client';
import {
    PUBLIC_CONTENT_TAG,
    PUBLIC_REVALIDATE_SECONDS,
} from '@/lib/site-config';

const WORDS_PER_MINUTE = 200;
const LOCAL_CONTENT_DIR = '/content';
const isLocalContentEnabled =
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_LOCAL_CONTENT === 'true';

const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  title,
  "slug": slug.current,
  abstract,
  publishedAt,
  tags,
  category,
  "readingTime": coalesce(round(length(pt::text(body)) / 5 / ${WORDS_PER_MINUTE}), 0) + " min read"
}`;

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  title,
  "slug": slug.current,
  abstract,
  publishedAt,
  tags,
  category,
  coverImage{
    ...,
    asset->{
      _id,
      url,
      metadata {
        dimensions
      }
    }
  },
  body[]{
    ...,
    _type == "image" => {
      ...,
      asset->{
        _id,
        url,
        metadata {
          dimensions
        }
      }
    }
  },
  mdxContent,
  "readingTime": coalesce(round(length(pt::text(body)) / 5 / ${WORDS_PER_MINUTE}), 0) + " min read"
}`;

const SLUGS_QUERY = `*[_type == "post"] | order(publishedAt desc) { "slug": slug.current }`;

function calculateReadingTime(content) {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))} min read`;
}

function assertSanityClient() {
    if (!client) {
        throw new Error(
            'Sanity client is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET.'
        );
    }

    return client;
}

function normalizePostSummary(post) {
    return {
        slug: post.slug,
        title: post.title,
        abstract: post.abstract,
        publishedOn: post.publishedAt,
        tags: post.tags || [],
        category: post.category || '',
        readingTime: normalizeReadingTime(post.readingTime),
    };
}

function normalizeReadingTime(readingTime) {
    if (!readingTime || readingTime === '0 min read') {
        return '1 min read';
    }

    return readingTime;
}

async function getSanityBlogPostList() {
    const sanityClient = assertSanityClient();
    const posts = await sanityClient.fetch(POSTS_QUERY);
    return posts.map(normalizePostSummary);
}

async function loadSanityBlogPost(slug) {
    const sanityClient = assertSanityClient();
    const post = await sanityClient.fetch(POST_QUERY, { slug });

    if (!post) {
        return null;
    }

    return {
        slug: post.slug,
        frontmatter: {
            title: post.title,
            abstract: post.abstract,
            publishedOn: post.publishedAt,
            tags: post.tags || [],
            category: post.category || '',
        },
        content: post.mdxContent || post.body,
        readingTime: normalizeReadingTime(post.readingTime),
        coverImage: post.coverImage,
        isSanity: true,
    };
}

async function getSanitySlugs() {
    const sanityClient = assertSanityClient();
    const posts = await sanityClient.fetch(SLUGS_QUERY);
    return posts.map((post) => post.slug);
}

async function getLocalBlogPostList() {
    const fileNames = await readDirectory(LOCAL_CONTENT_DIR);
    const blogPosts = [];

    for (const fileName of fileNames) {
        const rawContent = await readFile(`${LOCAL_CONTENT_DIR}/${fileName}`);
        const { data: frontmatter, content } = matter(rawContent);

        blogPosts.push({
            slug: fileName.replace('.mdx', ''),
            ...frontmatter,
            readingTime: calculateReadingTime(content),
        });
    }

    return blogPosts.sort(
        (left, right) => new Date(right.publishedOn) - new Date(left.publishedOn)
    );
}

async function loadLocalBlogPost(slug) {
    try {
        const rawContent = await readFile(`${LOCAL_CONTENT_DIR}/${slug}.mdx`);
        const { data: frontmatter, content } = matter(rawContent);

        return {
            frontmatter,
            content,
            readingTime: calculateReadingTime(content),
            isSanity: false,
        };
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }

        throw error;
    }
}

async function getLocalSlugs() {
    const fileNames = await readDirectory(LOCAL_CONTENT_DIR);
    return fileNames.map((name) => name.replace('.mdx', ''));
}

async function getPublicBlogPostList() {
    try {
        return await getSanityBlogPostList();
    } catch (error) {
        if (isLocalContentEnabled) {
            console.warn(
                'Sanity fetch failed, falling back to local content:',
                error.message
            );
            return getLocalBlogPostList();
        }

        throw error;
    }
}

async function getPublicBlogPost(slug) {
    try {
        const post = await loadSanityBlogPost(slug);

        if (post) {
            return post;
        }
    } catch (error) {
        if (!isLocalContentEnabled) {
            throw error;
        }

        console.warn(
            'Sanity post fetch failed, falling back to local content:',
            error.message
        );
    }

    if (isLocalContentEnabled) {
        return loadLocalBlogPost(slug);
    }

    return null;
}

async function getPublicPostSlugs() {
    try {
        return await getSanitySlugs();
    } catch (error) {
        if (isLocalContentEnabled) {
            console.warn(
                'Sanity slug fetch failed, falling back to local content:',
                error.message
            );
            return getLocalSlugs();
        }

        throw error;
    }
}

const getCachedBlogPostList = unstable_cache(
    async () => getPublicBlogPostList(),
    ['public-blog-post-list'],
    {
        revalidate: PUBLIC_REVALIDATE_SECONDS,
        tags: [PUBLIC_CONTENT_TAG],
    }
);

const getCachedBlogPost = unstable_cache(
    async (slug) => getPublicBlogPost(slug),
    ['public-blog-post'],
    {
        revalidate: PUBLIC_REVALIDATE_SECONDS,
        tags: [PUBLIC_CONTENT_TAG],
    }
);

const getCachedPostSlugs = unstable_cache(
    async () => getPublicPostSlugs(),
    ['public-blog-post-slugs'],
    {
        revalidate: PUBLIC_REVALIDATE_SECONDS,
        tags: [PUBLIC_CONTENT_TAG],
    }
);

export async function getBlogPostList() {
    return getCachedBlogPostList();
}

export async function loadBlogPost(slug) {
    return getCachedBlogPost(slug);
}

export async function getAllPostSlugs() {
    return getCachedPostSlugs();
}

export async function getAdminBlogPostList() {
    return getSanityBlogPostList();
}

export async function loadAdminBlogPost(slug) {
    return loadSanityBlogPost(slug);
}

export function canReadFromSanity() {
    return Boolean(projectId);
}

export function canWriteToSanity() {
    return Boolean(writeClient);
}

function readFile(localPath) {
    return fs.readFile(path.join(process.cwd(), localPath), 'utf8');
}

async function readDirectory(localPath) {
    try {
        return await fs.readdir(path.join(process.cwd(), localPath));
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }

        throw error;
    }
}
