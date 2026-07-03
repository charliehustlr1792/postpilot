'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';

// Route-group error boundary: catches render/runtime errors in any dashboard
// page so a single crash shows a recoverable panel instead of blanking the app.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error boundary caught:', error);
  }, [error]);

  return (
    <ErrorState
      title="This page ran into a problem"
      message="An unexpected error occurred while rendering this page. You can try again, or head back to your dashboard."
      onRetry={reset}
    />
  );
}
