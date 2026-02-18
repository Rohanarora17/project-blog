import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'subscribers.json');

async function getSubscribers() {
    try {
        const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function saveSubscribers(subscribers) {
    const dir = path.dirname(SUBSCRIBERS_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
}

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
        const subscribers = await getSubscribers();

        if (subscribers.some((s) => s.email === normalizedEmail)) {
            return NextResponse.json(
                { message: "You're already subscribed! 🎉" },
                { status: 200 }
            );
        }

        subscribers.push({
            email: normalizedEmail,
            subscribedAt: new Date().toISOString(),
        });

        await saveSubscribers(subscribers);

        return NextResponse.json(
            { message: "You're subscribed! You'll get notified on new articles. 🎉" },
            { status: 201 }
        );
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
