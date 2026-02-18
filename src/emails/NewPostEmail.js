import React from 'react';

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://rustwithrohan.com';

export function NewPostEmail({ title, abstract, slug }) {
    const postUrl = `${SITE_URL}/${slug}`;
    const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe`;

    return (
        <div
            style={{
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                maxWidth: '560px',
                margin: '0 auto',
                padding: '40px 20px',
                backgroundColor: '#0a0a0a',
                color: '#e0e0e0',
            }}
        >
            <div
                style={{
                    borderBottom: '2px solid #333',
                    paddingBottom: '16px',
                    marginBottom: '24px',
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#888',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                    }}
                >
                    Rust with Rohan
                </h2>
            </div>

            <h1
                style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: '0 0 12px 0',
                    lineHeight: 1.3,
                }}
            >
                {title}
            </h1>

            <p
                style={{
                    fontSize: '16px',
                    lineHeight: 1.6,
                    color: '#b0b0b0',
                    margin: '0 0 24px 0',
                }}
            >
                {abstract}
            </p>

            <a
                href={postUrl}
                style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    backgroundColor: '#f0c040',
                    color: '#0a0a0a',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '14px',
                }}
            >
                Read Article →
            </a>

            <div
                style={{
                    borderTop: '1px solid #333',
                    marginTop: '32px',
                    paddingTop: '16px',
                }}
            >
                <p
                    style={{
                        fontSize: '12px',
                        color: '#666',
                        margin: 0,
                    }}
                >
                    You received this because you subscribed to Rust with Rohan.{' '}
                    <a
                        href={`${unsubscribeUrl}?email={{email}}`}
                        style={{ color: '#888', textDecoration: 'underline' }}
                    >
                        Unsubscribe
                    </a>
                </p>
            </div>
        </div>
    );
}
