import React from 'react';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';

import { BLOG_TITLE } from '@/constants';
import { loadBlogPost, getAllPostSlugs } from '@/helpers/file-helpers';
import { urlFor } from '@/sanity/lib/image';
import CodeSnippet from '@/components/CodeSnippet';
import DivisionGroupsDemo from '@/components/DivisionGroupsDemo';
import CircularColorsDemo from '@/components/CircularColorsDemo';

import BlogHero from '@/components/BlogHero';
import MDXImage from '@/components/MDXImage/MDXImage';
import {
  PUBLIC_REVALIDATE_SECONDS,
  SITE_URL,
} from '@/lib/site-config';

import styles from './postSlug.module.css';

export const revalidate = PUBLIC_REVALIDATE_SECONDS;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ postSlug: slug }));
}

export async function generateMetadata({ params }) {
  const blogPostData = await loadBlogPost(params.postSlug);

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

// Portable Text components for rendering Sanity content
const portableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?.url) return null;

      const dimensions = value.asset.metadata?.dimensions || {};
      const width = dimensions.width || 1200;
      const height = dimensions.height || 675;

      return (
        <figure style={{ margin: '2rem 0' }}>
          <Image
            src={urlFor(value).width(1200).auto('format').url()}
            alt={value.alt || ''}
            width={width}
            height={height}
            sizes="(min-width: 900px) 800px, 100vw"
            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
          />
          {value.caption && (
            <figcaption
              style={{
                textAlign: 'center',
                color: '#888',
                fontSize: '0.875rem',
                marginTop: '0.5rem',
              }}
            >
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    code: ({ value }) => (
      <pre data-lang={value.language}>
        <code>{value.code}</code>
      </pre>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    code: ({ children }) => <code>{children}</code>,
  },
  block: {
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    h4: ({ children }) => <h4>{children}</h4>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
};

async function BlogPost({ params }) {
  const blogPostData = await loadBlogPost(params.postSlug);

  if (!blogPostData) {
    notFound();
  }

  const { frontmatter, content, readingTime, isSanity } = blogPostData;
  const readingMinutes = Number.parseInt(readingTime, 10) || 1;

  // Build word count for JSON-LD based on content type
  let wordCount = 0;
  if (isSanity && Array.isArray(content)) {
    // Estimate from portable text blocks
    const textBlocks = content
      .filter((block) => block._type === 'block')
      .map((block) =>
        block.children?.map((child) => child.text || '').join(' ')
      )
      .join(' ');
    wordCount = textBlocks.trim().split(/\s+/).filter(Boolean).length;
  } else if (typeof content === 'string') {
    wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  }

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
    wordCount,
    timeRequired: `PT${readingMinutes}M`,
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
        {isSanity && Array.isArray(content) ? (
          <PortableText
            value={content}
            components={portableTextComponents}
          />
        ) : (
          <MDXRemote
            source={content}
            components={{
              pre: CodeSnippet,
              img: (props) => <MDXImage {...props} />,
              DivisionGroupsDemo,
              CircularColorsDemo,
            }}
          />
        )}
      </div>
    </article>
  );
}

export default BlogPost;
