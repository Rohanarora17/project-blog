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

        if (!supabase) {
            return NextResponse.json(
                { error: 'Newsletter service is not configured.' },
                { status: 503 }
            );
        }

        // Check if already subscribed
        const { data: existing, error: selectError } = await supabase
            .from('subscribers')
            .select('id, is_active')
            .eq('email', normalizedEmail)
            .single();

        if (selectError && selectError.code !== 'PGRST116') { // PGRST116 is "no rows found"
            console.error('Supabase select error:', selectError);
            if (selectError.code === 'PGRST205') {
                return NextResponse.json(
                    { error: 'Database setup required: Subscribers table missing.' },
                    { status: 500 }
                );
            }
            return NextResponse.json(
                { error: 'Database connection failed.' },
                { status: 500 }
            );
        }

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
    } catch (error) {
        console.error('Subscribe error:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
