import { createClient } from 'next-sanity';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = '2024-01-01';

export const client = projectId
    ? createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn: true,
    })
    : null;

export const writeClient = projectId && process.env.SANITY_TOKEN
    ? createClient({
        projectId,
        dataset,
        apiVersion,
        token: process.env.SANITY_TOKEN,
        useCdn: false, // Ensure fresh data for writes
    })
    : null;
