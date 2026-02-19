'use client';

import React, { useEffect, useState } from 'react';
import styles from '../admin.module.css';

export default function SubscribersPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sendingNewsletter, setSendingNewsletter] = useState(false);
    const [message, setMessage] = useState(null);
    const [showNewsletterForm, setShowNewsletterForm] = useState(false);
    const [newsletterData, setNewsletterData] = useState({
        title: '',
        abstract: '',
        slug: ''
    });

    async function fetchSubscribers() {
        try {
            const res = await fetch('/api/admin/subscribers');
            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSubscribers();
    }, []);

    async function handleDelete(email) {
        if (!confirm(`Remove ${email}?`)) return;

        try {
            await fetch('/api/admin/subscribers', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            fetchSubscribers();
        } catch (err) {
            console.error(err);
        }
    }

    function handleExportCSV() {
        if (!data?.all?.length) return;

        const csv = [
            'email,subscribed_at,is_active',
            ...data.all.map(
                (s) => `${s.email},${s.subscribed_at},${s.is_active}`
            ),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function openNewsletterForm() {
        setNewsletterData({ title: '', abstract: '', slug: '' });
        setShowNewsletterForm(true);
        setMessage(null);
    }

    async function submitNewsletter(e) {
        e.preventDefault();
        setSendingNewsletter(true);
        setMessage(null);

        try {
            const res = await fetch('/api/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newsletterData,
                    secret: 'admin-manual'
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({
                    type: 'success',
                    text: `Newsletter sent to ${result.sent} subscriber${result.sent !== 1 ? 's' : ''}!`,
                });
                setShowNewsletterForm(false);
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to send newsletter' });
        } finally {
            setSendingNewsletter(false);
        }
    }

    if (loading) {
        return (
            <div className={styles.loading}>
                <span className={styles.spinner} />
                Loading subscribers...
            </div>
        );
    }

    const subscribers = data?.all || [];

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Subscribers</h1>
                <p className={styles.pageSubtitle}>
                    {data?.active || 0} active of {data?.total || 0} total
                </p>
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

            <div className={styles.btnGroup} style={{ marginBottom: 24 }}>
                <button
                    onClick={openNewsletterForm}
                    disabled={sendingNewsletter || !data?.active}
                    className={styles.btnPrimary}
                >
                    📧 Compose Newsletter
                </button>
                <button
                    onClick={handleExportCSV}
                    disabled={!subscribers.length}
                    className={styles.btnSecondary}
                >
                    📥 Export CSV
                </button>
            </div>

            {/* Newsletter Modal/Form */}
            {showNewsletterForm && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalTitle}>Send Newsletter</h2>
                        <form onSubmit={submitNewsletter}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Post Title</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    value={newsletterData.title}
                                    onChange={(e) => setNewsletterData({ ...newsletterData, title: e.target.value })}
                                    required
                                    placeholder="e.g. Understanding Rust Ownership"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Abstract / Excerpt</label>
                                <textarea
                                    className={styles.formTextarea}
                                    value={newsletterData.abstract}
                                    onChange={(e) => setNewsletterData({ ...newsletterData, abstract: e.target.value })}
                                    required
                                    placeholder="A brief summary of what this post is about..."
                                    rows={3}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Slug (URL Path)</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    value={newsletterData.slug}
                                    onChange={(e) => setNewsletterData({ ...newsletterData, slug: e.target.value })}
                                    required
                                    placeholder="e.g. understanding-rust-ownership"
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className={styles.btnSecondary}
                                    onClick={() => setShowNewsletterForm(false)}
                                    disabled={sendingNewsletter}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.btnPrimary}
                                    disabled={sendingNewsletter}
                                >
                                    {sendingNewsletter ? 'Sending...' : '🚀 Send Now'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {subscribers.length > 0 ? (
                <div className={styles.section}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Subscribed</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((sub) => (
                                <tr key={sub.id || sub.email}>
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
                                    <td>
                                        <button
                                            onClick={() => handleDelete(sub.email)}
                                            className={styles.btnDanger}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={styles.section}>
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>📭</span>
                        <p>No subscribers yet</p>
                    </div>
                </div>
            )}
        </>
    );
}
