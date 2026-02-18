import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        if (!supabase) {
            return NextResponse.json({
                total: 0,
                active: 0,
                recent: [],
                all: [],
            });
        }

        // Get all subscribers
        const { data: all, error } = await supabase
            .from('subscribers')
            .select('*')
            .order('subscribed_at', { ascending: false });

        if (error) {
            console.error('Error fetching subscribers:', error);
            return NextResponse.json(
                { error: 'Failed to fetch subscribers' },
                { status: 500 }
            );
        }

        const subscribers = all || [];
        const active = subscribers.filter((s) => s.is_active).length;

        return NextResponse.json({
            total: subscribers.length,
            active,
            recent: subscribers.slice(0, 5),
            all: subscribers,
        });
    } catch (error) {
        console.error('Subscribers API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        if (!supabase) {
            return NextResponse.json(
                { error: 'Database not configured' },
                { status: 503 }
            );
        }

        const { email } = await request.json();

        const { error } = await supabase
            .from('subscribers')
            .delete()
            .eq('email', email);

        if (error) {
            return NextResponse.json(
                { error: 'Failed to delete subscriber' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: 'Deleted' });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
