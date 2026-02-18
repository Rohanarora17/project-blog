import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { client, projectId } from '@/sanity/lib/client';

const WORDS_PER_MINUTE = 200;

function calculateReadingTime(content) {
  const words = content.trim().split(/\s+/).length;
  return `${Math.ceil(words / WORDS_PER_MINUTE)} min read`;
}

// ─── Sanity-backed functions ───────────────────────────────

const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  title,
  "slug": slug.current,
  abstract,
  publishedAt,
  tags,
  category,
  "readingTime": round(length(pt::text(body)) / 5 / ${WORDS_PER_MINUTE}) + " min read"
}`;

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  title,
  "slug": slug.current,
  abstract,
  publishedAt,
  tags,
  category,
  coverImage,
  body,
  "readingTime": round(length(pt::text(body)) / 5 / ${WORDS_PER_MINUTE}) + " min read"
}`;

const SLUGS_QUERY = `*[_type == "post"] { "slug": slug.current }`;

async function getSanityBlogPostList() {
  const posts = await client.fetch(POSTS_QUERY);
  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    abstract: post.abstract,
    publishedOn: post.publishedAt,
    tags: post.tags || [],
    category: post.category || '',
    readingTime: post.readingTime || '1 min read',
  }));
}

async function loadSanityBlogPost(slug) {
  const post = await client.fetch(POST_QUERY, { slug });
  if (!post) return null;
  return {
    slug: post.slug,
    frontmatter: {
      title: post.title,
      abstract: post.abstract,
      publishedOn: post.publishedAt,
      tags: post.tags || [],
      category: post.category || '',
    },
    content: post.body, // Portable Text array
    readingTime: post.readingTime || '1 min read',
    coverImage: post.coverImage,
    isSanity: true,
  };
}

async function getSanitySlugs() {
  const posts = await client.fetch(SLUGS_QUERY);
  return posts.map((p) => p.slug);
}

// ─── Local MDX-backed functions (fallback) ─────────────────

async function getLocalBlogPostList() {
  const fileNames = await readDirectory('/content');
  const blogPosts = [];

  for (const fileName of fileNames) {
    const rawContent = await readFile(`/content/${fileName}`);
    const { data: frontmatter, content } = matter(rawContent);

    blogPosts.push({
      slug: fileName.replace('.mdx', ''),
      ...frontmatter,
      readingTime: calculateReadingTime(content),
    });
  }

  return blogPosts.sort((p1, p2) =>
    new Date(p2.publishedOn) - new Date(p1.publishedOn)
  );
}

async function loadLocalBlogPost(slug) {
  const rawContent = await readFile(`/content/${slug}.mdx`);
  const { data: frontmatter, content } = matter(rawContent);

  return {
    frontmatter,
    content,
    readingTime: calculateReadingTime(content),
    isSanity: false,
  };
}

async function getLocalSlugs() {
  const fileNames = await readDirectory('/content');
  return fileNames.map((name) => name.replace('.mdx', ''));
}

// ─── Public API (auto-selects Sanity or local MDX) ─────────

const useSanity = !!projectId;

export async function getBlogPostList() {
  if (useSanity) {
    try {
      return await getSanityBlogPostList();
    } catch (err) {
      console.warn('Sanity fetch failed, falling back to local MDX:', err.message);
    }
  }
  return getLocalBlogPostList();
}

export async function loadBlogPost(slug) {
  if (useSanity) {
    try {
      const post = await loadSanityBlogPost(slug);
      if (post) return post;
    } catch (err) {
      console.warn('Sanity fetch failed, falling back to local MDX:', err.message);
    }
  }
  return loadLocalBlogPost(slug);
}

export async function getAllPostSlugs() {
  if (useSanity) {
    try {
      return await getSanitySlugs();
    } catch (err) {
      console.warn('Sanity fetch failed, falling back to local MDX:', err.message);
    }
  }
  return getLocalSlugs();
}

// ─── File system helpers ───────────────────────────────────

function readFile(localPath) {
  return fs.readFile(path.join(process.cwd(), localPath), 'utf8');
}

function readDirectory(localPath) {
  return fs.readdir(path.join(process.cwd(), localPath));
}
