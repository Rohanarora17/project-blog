'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../admin.module.css';

export default function PostsPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/posts')
            .then((res) => res.json())
            .then(setPosts)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className={styles.loading}>
                <span className={styles.spinner} />
                Loading posts...
            </div>
        );
    }

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Posts</h1>
                <p className={styles.pageSubtitle}>
                    {posts.length} post{posts.length !== 1 ? 's' : ''} published
                </p>
            </div>

            <div className={styles.btnGroup} style={{ marginBottom: 24 }}>
                <Link href="/admin/posts/new" className={styles.btnPrimary}>
                    ✍️ New Post
                </Link>
            </div>

            {posts.length > 0 ? (
                <div className={styles.section}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Published</th>
                                <th>Reading Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr key={post.slug}>
                                    <td>
                                        <strong>{post.title}</strong>
                                    </td>
                                    <td>
                                        {post.category ? (
                                            <span className={`${styles.badge} ${styles.badgeYellow}`}>
                                                {post.category}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#555' }}>—</span>
                                        )}
                                    </td>
                                    <td>
                                        {new Date(post.publishedOn).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </td>
                                    <td>{post.readingTime}</td>
                                    <td>
                                        <Link
                                            href={`/${post.slug}`}
                                            className={styles.btnSecondary}
                                            style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                                        >
                                            View ↗
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={styles.section}>
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>📄</span>
                        <p>No posts yet. Create your first post!</p>
                    </div>
                </div>
            )}
        </>
    );
}
