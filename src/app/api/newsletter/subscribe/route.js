import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@') || !email.includes('.')) {
            return NextResponse.json(
                { error: 'Please provide a valid email address.' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();

        // If Supabase is configured, use it
        if (supabase) {
            // Check if already subscribed
            const { data: existing } = await supabase
                .from('subscribers')
                .select('id, is_active')
                .eq('email', normalizedEmail)
                .single();

            if (existing) {
                if (existing.is_active) {
                    return NextResponse.json(
                        { error: 'This email is already subscribed!' },
                        { status: 409 }
                    );
                }

                // Re-activate if previously unsubscribed
                const { error: updateError } = await supabase
                    .from('subscribers')
                    .update({ is_active: true, subscribed_at: new Date().toISOString() })
                    .eq('id', existing.id);

                if (updateError) {
                    console.error('Resubscribe error:', updateError);
                    return NextResponse.json(
                        { error: 'Something went wrong. Please try again.' },
                        { status: 500 }
                    );
                }

                return NextResponse.json({
                    message: 'Welcome back! You have been re-subscribed.',
                });
            }

            // Insert new subscriber
            const { error: insertError } = await supabase
                .from('subscribers')
                .insert({ email: normalizedEmail });

            if (insertError) {
                console.error('Subscribe error:', insertError);
                if (insertError.code === '23505') {
                    return NextResponse.json(
                        { error: 'This email is already subscribed!' },
                        { status: 409 }
                    );
                }
                return NextResponse.json(
                    { error: 'Something went wrong. Please try again.' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                message: "You're subscribed! You'll get notified when new articles are published.",
            });
        }

        // Fallback: store in local JSON file (dev mode)
        const fs = await import('fs/promises');
        const path = await import('path');
        const dataDir = path.join(process.cwd(), 'data');
        const filePath = path.join(dataDir, 'subscribers.json');

        try {
            await fs.access(dataDir);
        } catch {
            await fs.mkdir(dataDir, { recursive: true });
        }

        let subscribers = [];
        try {
            const data = await fs.readFile(filePath, 'utf8');
            subscribers = JSON.parse(data);
        } catch {
            // File doesn't exist yet
        }

        if (subscribers.some((s) => s.email === normalizedEmail)) {
            return NextResponse.json(
                { error: 'This email is already subscribed!' },
                { status: 409 }
            );
        }

        subscribers.push({
            email: normalizedEmail,
            subscribedAt: new Date().toISOString(),
        });

        await fs.writeFile(filePath, JSON.stringify(subscribers, null, 2));

        return NextResponse.json({
            message: "You're subscribed! (dev mode — stored locally)",
        });
    } catch (error) {
        console.error('Subscribe error:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
