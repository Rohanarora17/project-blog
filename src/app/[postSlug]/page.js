import React from 'react';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

import { BLOG_TITLE } from '@/constants';
import { loadBlogPost, getAllPostSlugs } from '@/helpers/file-helpers';
import CodeSnippet from '@/components/CodeSnippet';
import DivisionGroupsDemo from '@/components/DivisionGroupsDemo';
import CircularColorsDemo from '@/components/CircularColorsDemo';

import BlogHero from '@/components/BlogHero';

import styles from './postSlug.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rustwithrohan.com';

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ postSlug: slug }));
}

export async function generateMetadata({ params }) {
  const blogPostData = await loadBlogPost(
    params.postSlug
  );

  if (!blogPostData) {
    return null;
  }

  const { frontmatter } = blogPostData;

  return {
    title: frontmatter.title,
    description: frontmatter.abstract,
    openGraph: {
      title: `${frontmatter.title} • ${BLOG_TITLE}`,
      description: frontmatter.abstract,
      type: 'article',
      publishedTime: frontmatter.publishedOn,
      url: `${SITE_URL}/${params.postSlug}`,
      tags: frontmatter.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.abstract,
    },
    alternates: {
      canonical: `${SITE_URL}/${params.postSlug}`,
    },
  };
}

async function BlogPost({ params }) {
  const blogPostData = await loadBlogPost(
    params.postSlug
  );

  if (!blogPostData) {
    notFound();
  }

  const { frontmatter, content, readingTime } = blogPostData;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: frontmatter.title,
    description: frontmatter.abstract,
    datePublished: frontmatter.publishedOn,
    author: {
      '@type': 'Person',
      name: 'Rohan',
      url: 'https://github.com/Rohanarora17',
    },
    publisher: {
      '@type': 'Organization',
      name: BLOG_TITLE,
    },
    url: `${SITE_URL}/${params.postSlug}`,
    wordCount: content.trim().split(/\s+/).length,
    timeRequired: `PT${readingTime}M`,
  };

  return (
    <article className={styles.wrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogHero
        title={frontmatter.title}
        publishedOn={frontmatter.publishedOn}
        readingTime={readingTime}
      />
      <div className={styles.page}>
        <MDXRemote
          source={content}
          components={{
            pre: CodeSnippet,
            DivisionGroupsDemo,
            CircularColorsDemo,
          }}
        />
      </div>
    </article>
  );
}

export default BlogPost;