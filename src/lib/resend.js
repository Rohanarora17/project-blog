import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    console.warn('Resend API key not set. Email sending will not work.');
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;
