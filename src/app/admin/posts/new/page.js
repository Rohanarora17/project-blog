'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../admin.module.css';

export default function NewPostPage() {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [mode, setMode] = useState('write'); // 'write' or 'upload'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [dragging, setDragging] = useState(false);

    // Write mode state
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [abstract, setAbstract] = useState('');
    const [body, setBody] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');

    // Auto-generate slug from title
    function handleTitleChange(value) {
        setTitle(value);
        if (!slug || slug === generateSlug(title)) {
            setSlug(generateSlug(value));
        }
    }

    function generateSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    async function handleWriteSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'write',
                    title,
                    slug,
                    abstract,
                    body,
                    category,
                    tags: tags
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error });
                return;
            }

            setMessage({ type: 'success', text: `Post "${title}" created! Redirecting...` });
            setTimeout(() => router.push('/admin/posts'), 1500);
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong' });
        } finally {
            setLoading(false);
        }
    }

    async function handleFileUpload(file) {
        if (!file || !file.name.endsWith('.mdx')) {
            setMessage({ type: 'error', text: 'Please upload a .mdx file' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const text = await file.text();

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'upload',
                    filename: file.name,
                    content: text,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error });
                return;
            }

            setMessage({
                type: 'success',
                text: `"${data.title}" uploaded! Redirecting...`,
            });
            setTimeout(() => router.push('/admin/posts'), 1500);
        } catch {
            setMessage({ type: 'error', text: 'Upload failed' });
        } finally {
            setLoading(false);
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
    }

    function handleDragOver(e) {
        e.preventDefault();
        setDragging(true);
    }

    function handleDragLeave() {
        setDragging(false);
    }

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>New Post</h1>
                <p className={styles.pageSubtitle}>
                    Write in the editor or upload an MDX file
                </p>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${mode === 'write' ? styles.tabActive : ''}`}
                    onClick={() => setMode('write')}
                >
                    ✍️ Write
                </button>
                <button
                    className={`${styles.tab} ${mode === 'upload' ? styles.tabActive : ''}`}
                    onClick={() => setMode('upload')}
                >
                    📁 Upload MDX
                </button>
            </div>

            {message && (
                <div
                    className={
                        message.type === 'success' ? styles.successMsg : styles.errorMsg
                    }
                >
                    {message.text}
                </div>
            )}

            {mode === 'write' ? (
                <form onSubmit={handleWriteSubmit} className={styles.section}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className={styles.formInput}
                            placeholder="My Awesome Article"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className={styles.formInput}
                            placeholder="my-awesome-article"
                            required
                        />
                        <p className={styles.formHint}>URL-friendly identifier</p>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Abstract</label>
                        <input
                            type="text"
                            value={abstract}
                            onChange={(e) => setAbstract(e.target.value)}
                            className={styles.formInput}
                            placeholder="Brief summary for cards and SEO"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Category</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={styles.formInput}
                            placeholder="e.g. Rust, Web3, Tutorial"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Tags</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className={styles.formTagInput}
                            placeholder="rust, smart-pointers, memory (comma separated)"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Content (MDX)</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className={styles.formTextarea}
                            placeholder="Write your article here in MDX format..."
                            required
                        />
                        <p className={styles.formHint}>
                            Supports full MDX — Markdown + JSX components
                        </p>
                    </div>

                    <div className={styles.btnGroup}>
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.btnPrimary}
                        >
                            {loading ? 'Publishing...' : '🚀 Publish'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className={styles.btnSecondary}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className={styles.section}>
                    <div
                        className={`${styles.uploadZone} ${dragging ? styles.uploadZoneDragging : ''
                            }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <span className={styles.uploadIcon}>📄</span>
                        <p className={styles.uploadText}>
                            Drag & drop your <span className={styles.uploadHighlight}>.mdx</span>{' '}
                            file here
                        </p>
                        <p className={styles.uploadText} style={{ marginTop: 8 }}>
                            or <span className={styles.uploadHighlight}>click to browse</span>
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".mdx"
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileUpload(e.target.files[0])}
                        />
                    </div>
                    <p className={styles.formHint} style={{ marginTop: 16 }}>
                        The MDX file should have frontmatter with title, abstract, and
                        publishedOn fields
                    </p>
                </div>
            )}
        </>
    );
}
