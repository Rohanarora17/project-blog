'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const [postsRes, subsRes, healthRes] = await Promise.all([
                    fetch('/api/admin/posts'),
                    fetch('/api/admin/subscribers'),
                    fetch('/api/admin/health'),
                ]);
                const postsData = await postsRes.json();
                const subscribers = await subsRes.json();
                const health = await healthRes.json();

                setStats({
                    posts: Array.isArray(postsData) ? postsData : [],
                    subscribers,
                    health,
                });
                setError(
                    !postsRes.ok && postsData?.error
                        ? postsData.error
                        : ''
                );
            } catch (err) {
                console.error('Failed to load stats:', err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className={styles.loading}>
                <span className={styles.spinner} />
                Loading dashboard...
            </div>
        );
    }

    const postCount = stats?.posts?.length || 0;
    const subscriberCount = stats?.subscribers?.total || 0;
    const activeSubscribers = stats?.subscribers?.active || 0;
    const recentSubs = stats?.subscribers?.recent || [];
    const serviceHealth = stats?.health?.services || {};

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Dashboard</h1>
                <p className={styles.pageSubtitle}>
                    Welcome back — here&apos;s your blog at a glance
                </p>
            </div>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>📝</span>
                    <p className={styles.statLabel}>Published Posts</p>
                    <p className={styles.statValue}>{postCount}</p>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>👥</span>
                    <p className={styles.statLabel}>Total Subscribers</p>
                    <p className={styles.statValue}>{subscriberCount}</p>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>✅</span>
                    <p className={styles.statLabel}>Active Subscribers</p>
                    <p className={styles.statValue}>{activeSubscribers}</p>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statIcon}>⚡</span>
                    <p className={styles.statLabel}>Content Backend</p>
                    <p className={styles.statValue}>
                        {serviceHealth.sanityRead ? 'Sanity' : 'Unavailable'}
                    </p>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Publishing Health</h2>
                <table className={styles.table}>
                    <tbody>
                        <tr>
                            <th>Site URL</th>
                            <td>{stats?.health?.siteUrl || 'Unavailable'}</td>
                        </tr>
                        <tr>
                            <th>Sanity Read</th>
                            <td>{serviceHealth.sanityRead ? 'Configured' : 'Missing'}</td>
                        </tr>
                        <tr>
                            <th>Sanity Write</th>
                            <td>{serviceHealth.sanityWrite ? 'Configured' : 'Missing'}</td>
                        </tr>
                        <tr>
                            <th>Supabase Admin</th>
                            <td>{serviceHealth.supabaseAdmin ? 'Configured' : 'Missing'}</td>
                        </tr>
                        <tr>
                            <th>Resend</th>
                            <td>{serviceHealth.resend ? 'Configured' : 'Missing'}</td>
                        </tr>
                        <tr>
                            <th>Studio</th>
                            <td>{stats?.health?.studioEnabled ? 'Enabled' : 'Disabled'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Recent Subscribers</h2>
                {recentSubs.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Subscribed</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSubs.map((sub, i) => (
                                <tr key={i}>
                                    <td>{sub.email}</td>
                                    <td>
                                        {new Date(sub.subscribed_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </td>
                                    <td>
                                        <span
                                            className={`${styles.badge} ${sub.is_active ? styles.badgeGreen : styles.badgeRed
                                                }`}
                                        >
                                            {sub.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>📭</span>
                        <p>No subscribers yet</p>
                    </div>
                )}
            </div>

            <div className={styles.btnGroup}>
                <Link href="/admin/posts/new" className={styles.btnPrimary}>
                    ✍️ New Post
                </Link>
                <Link href="/admin/subscribers" className={styles.btnSecondary}>
                    👥 Manage Subscribers
                </Link>
            </div>
        </>
    );
}
