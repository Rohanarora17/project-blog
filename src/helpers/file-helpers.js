import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import React from 'react';

function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export async function getBlogPostList() {
  const fileNames = await readDirectory('/content');

  const blogPosts = [];

  for (let fileName of fileNames) {
    const rawContent = await readFile(
      `/content/${fileName}`
    );

    const { data: frontmatter, content } = matter(rawContent);

    blogPosts.push({
      slug: fileName.replace('.mdx', ''),
      readingTime: calculateReadingTime(content),
      ...frontmatter,
    });
  }

  return blogPosts.sort((p1, p2) =>
    p1.publishedOn < p2.publishedOn ? 1 : -1
  );
}

export async function getAllPostSlugs() {
  const fileNames = await readDirectory('/content');
  return fileNames.map((fileName) => fileName.replace('.mdx', ''));
}

export const loadBlogPost = React.cache(
  async function loadBlogPost(slug) {
    let rawContent;

    try {
      rawContent = await readFile(
        `/content/${slug}.mdx`
      );
    } catch (err) {
      return null;
    }

    const { data: frontmatter, content } =
      matter(rawContent);

    return {
      frontmatter,
      content,
      readingTime: calculateReadingTime(content),
    };
  }
);

function readFile(localPath) {
  return fs.readFile(
    path.join(process.cwd(), localPath),
    'utf8'
  );
}

function readDirectory(localPath) {
  return fs.readdir(
    path.join(process.cwd(), localPath)
  );
}
