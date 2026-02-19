import React from 'react';

import BlogSummaryCard from '@/components/BlogSummaryCard';

import styles from './homepage.module.css';
import { getBlogPostList } from '@/helpers/file-helpers';
import Spinner from '@/components/Spinner';
import { BLOG_DESCRIPTION, BLOG_TITLE } from '@/constants';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rustwithrohan.com';

export const metadata = {
  title: `${BLOG_TITLE}`,
  description: BLOG_DESCRIPTION,
};

async function LoadFiles() {
  const files = await getBlogPostList();

  return files.map((blog, index) => (
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

function Home() {
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

  return (
    <div className={styles.wrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className={styles.mainHeading}>
        Latest Content:
      </h1>

      <React.Suspense fallback={<Spinner />}>
        <LoadFiles />
      </React.Suspense>
    </div>
  );
}

export default Home;
