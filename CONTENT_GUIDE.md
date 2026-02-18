# Content Authoring Guide

## Creating a New Article

1. Create a new `.mdx` file in the `/content` directory
2. Name it with a URL-friendly slug (e.g., `my-article-title.mdx`)
3. Add the required frontmatter at the top of the file
4. Write your content in MDX format

## Frontmatter Schema

Every article must include this frontmatter block at the top:

```yaml
---
title: "Your Article Title"
abstract: A brief description of the article (1-2 sentences). This appears on the homepage card and in meta tags.
publishedOn: "2024-07-29T15:06:29+0530"
tags:
  - tag1
  - tag2
category: "Category Name"
---
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Article title (displayed in heading and browser tab) |
| `abstract` | string | Brief summary (shown on homepage card, meta description, RSS) |
| `publishedOn` | ISO 8601 date | Publication date (used for sorting and display) |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `tags` | list of strings | Topic tags for categorization and SEO |
| `category` | string | Content category (e.g., "Rust", "Web Dev") |

## Writing Content

- Use standard Markdown syntax
- Code blocks with language identifiers get automatic syntax highlighting
- Images should be placed in `/public` and referenced with absolute paths: `![Alt text](/image-name.png)`
- Reading time is auto-calculated (200 words per minute)

## Publishing Workflow

1. Write your MDX file in `/content`
2. Add any images to `/public`
3. Run `npm run dev` to preview locally
4. Commit and push — Vercel will auto-deploy
5. Update `public/llms.txt` with the new article info (for AI agent accessibility)

## Updating Sitemap & RSS

Both the sitemap (`/sitemap.xml`) and RSS feed (`/rss.xml`) are auto-generated from the `/content` directory. No manual updates needed.
