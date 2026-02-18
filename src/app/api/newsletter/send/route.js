import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resend } from '@/lib/resend';
import { NewPostEmail } from '@/emails/NewPostEmail';

const NEWSLETTER_SECRET = process.env.NEWSLETTER_SECRET;
const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://rustwithrohan.com';

export async function POST(request) {
    try {
        // Verify the secret to prevent unauthorized sends
        const authHeader = request.headers.get('authorization');
        const body = await request.json();

        const secret = authHeader?.replace('Bearer ', '') || body.secret;

        if (!NEWSLETTER_SECRET || secret !== NEWSLETTER_SECRET) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!supabase) {
            return NextResponse.json(
                { error: 'Database not configured' },
                { status: 503 }
            );
        }

        if (!resend) {
            return NextResponse.json(
                { error: 'Email service not configured' },
                { status: 503 }
            );
        }

        const { title, abstract, slug } = body;

        if (!title || !abstract || !slug) {
            return NextResponse.json(
                { error: 'Missing required fields: title, abstract, slug' },
                { status: 400 }
            );
        }

        // Fetch all active subscribers
        const { data: subscribers, error: fetchError } = await supabase
            .from('subscribers')
            .select('email')
            .eq('is_active', true);

        if (fetchError) {
            console.error('Error fetching subscribers:', fetchError);
            return NextResponse.json(
                { error: 'Failed to fetch subscribers' },
                { status: 500 }
            );
        }

        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json({
                message: 'No active subscribers',
                sent: 0,
            });
        }

        // Send emails in batches of 50 (Resend free tier limit)
        const batchSize = 50;
        let totalSent = 0;
        const errors = [];

        for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize);

            const emailPromises = batch.map(async (subscriber) => {
                try {
                    const unsubscribeUrl = `${SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

                    await resend.emails.send({
                        from:
                            process.env.RESEND_FROM_EMAIL ||
                            'Rust with Rohan <onboarding@resend.dev>',
                        to: subscriber.email,
                        subject: `New Post: ${title}`,
                        react: NewPostEmail({
                            title,
                            abstract,
                            slug,
                        }),
                        headers: {
                            'List-Unsubscribe': `<${unsubscribeUrl}>`,
                        },
                    });
                    totalSent++;
                } catch (err) {
                    console.error(
                        `Failed to send to ${subscriber.email}:`,
                        err.message
                    );
                    errors.push({
                        email: subscriber.email,
                        error: err.message,
                    });
                }
            });

            await Promise.all(emailPromises);
        }

        return NextResponse.json({
            message: `Newsletter sent successfully`,
            sent: totalSent,
            failed: errors.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error('Newsletter send error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
