import { createImageUrlBuilder } from '@sanity/image-url';
import { client } from './client';

const builder = client ? createImageUrlBuilder(client) : null;

export function urlFor(source) {
    if (!builder) {
        console.warn('Sanity image URL builder not available — client not configured');
        return { width: () => ({ format: () => ({ url: () => '' }) }) };
    }
    return builder.image(source);
}
