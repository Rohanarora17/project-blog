import React from 'react';

import BlogSummaryCard from '@/components/BlogSummaryCard';

import styles from './homepage.module.css';
import { getBlogPostList } from '@/helpers/file-helpers';
import { BLOG_DESCRIPTION, BLOG_TITLE } from '@/constants';
import {
  PUBLIC_REVALIDATE_SECONDS,
  SITE_URL,
} from '@/lib/site-config';

export const revalidate = PUBLIC_REVALIDATE_SECONDS;

export const metadata = {
  title: `${BLOG_TITLE}`,
  description: BLOG_DESCRIPTION,
};

async function BlogPostList() {
  const files = await getBlogPostList();

  return files.map((blog) => (
    <BlogSummaryCard
      key={blog.slug}
      slug={blog.slug}
      title={blog.title}
      abstract={blog.abstract}
      publishedOn={blog.publishedOn}
      readingTime={blog.readingTime}
    />
  ));
}

async function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: SITE_URL,
    author: {
      '@type': 'Person',
      name: 'Rohan',
      url: 'https://github.com/Rohanarora17',
    },
  };

  const posts = await BlogPostList();

  return (
    <div className={styles.wrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className={styles.mainHeading}>
        Latest Content:
      </h1>
      {posts}
    </div>
  );
}

export default Home;
