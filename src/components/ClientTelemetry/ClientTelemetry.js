'use client';

import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

function ClientTelemetry() {
  return (
    <>
      <Analytics mode="production" />
      <SpeedInsights />
    </>
  );
}

export default ClientTelemetry;
