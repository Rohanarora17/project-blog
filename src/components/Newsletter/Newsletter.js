'use client';
import React from 'react';
import styles from './Newsletter.module.css';

function Newsletter({ inline = false }) {
    const [email, setEmail] = React.useState('');
    const [status, setStatus] = React.useState('idle');
    const [message, setMessage] = React.useState('');

    const wrapperClass = inline ? styles.wrapperInline : styles.wrapper;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');

        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message || 'You\'re subscribed!');
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Something went wrong.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    }

    if (status === 'success') {
        return (
            <div className={wrapperClass}>
                <div className={styles.successMessage}>
                    <span className={styles.successIcon}>✓</span>
                    <p>{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={wrapperClass}>
            <h2 className={styles.heading}>Stay Updated</h2>
            <p className={styles.description}>
                Get notified when I publish new articles. No spam, unsubscribe anytime.
            </p>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className={styles.input}
                    disabled={status === 'loading'}
                    aria-label="Email address for newsletter"
                />
                <button
                    type="submit"
                    className={styles.button}
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
            </form>
            {status === 'error' && (
                <p className={styles.errorMessage}>{message}</p>
            )}
        </div>
    );
}

export default Newsletter;
