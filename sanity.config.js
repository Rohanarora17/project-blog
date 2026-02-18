'use client';

import React from 'react';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { codeInput } from '@sanity/code-input';
import { schemaTypes } from './src/sanity/schemas';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
    name: 'rust-with-rohan',
    title: 'Rust with Rohan',

    projectId,
    dataset,

    plugins: [structureTool(), visionTool(), codeInput()],

    schema: {
        types: schemaTypes,
    },
});
