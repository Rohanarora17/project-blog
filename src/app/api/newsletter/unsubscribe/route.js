import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://rustwithrohan.com';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return new Response(unsubscribePage('Missing email address', true), {
            status: 400,
            headers: { 'Content-Type': 'text/html' },
        });
    }

    if (!supabase) {
        return new Response(
            unsubscribePage('Service temporarily unavailable', true),
            {
                status: 503,
                headers: { 'Content-Type': 'text/html' },
            }
        );
    }

    const { error } = await supabase
        .from('subscribers')
        .update({ is_active: false })
        .eq('email', email);

    if (error) {
        console.error('Unsubscribe error:', error);
        return new Response(
            unsubscribePage('Something went wrong. Please try again.', true),
            {
                status: 500,
                headers: { 'Content-Type': 'text/html' },
            }
        );
    }

    return new Response(
        unsubscribePage('You have been unsubscribed successfully.', false),
        {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        }
    );
}

function unsubscribePage(message, isError) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${isError ? 'Error' : 'Unsubscribed'} — Rust with Rohan</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 40px;
      max-width: 400px;
      text-align: center;
    }
    h1 { font-size: 20px; margin: 0 0 12px; color: ${isError ? '#ff6b6b' : '#4ade80'}; }
    p { color: #999; margin: 0 0 24px; line-height: 1.5; }
    a {
      color: #f0c040;
      text-decoration: none;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>${isError ? '⚠️' : '✅'} ${isError ? 'Error' : 'Unsubscribed'}</h1>
    <p>${message}</p>
    <a href="${SITE_URL}">← Back to blog</a>
  </div>
</body>
</html>`;
}
