'use client';

import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Global Error Boundary Provider
 * 
 * Wraps the entire application to catch any unhandled errors.
 * Should be used at the root level of your app.
 * 
 * Features:
 * - Catches all React component errors
 * - Logs errors to console (and can be extended to log to external services)
 * - Shows user-friendly error UI
 * - Provides recovery options (retry, reload, go home)
 * - Shows detailed error info in development mode
 * 
 * @example In app/layout.tsx
 * ```tsx
 * <GlobalErrorBoundaryProvider>
 *   <html>
 *     <body>
 *       {children}
 *     </body>
 *   </html>
 * </GlobalErrorBoundaryProvider>
 * ```
 */
export function GlobalErrorBoundaryProvider({ children }: GlobalErrorBoundaryProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log to console
    console.error('Global Error Boundary caught error:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send to error monitoring service
    // Example with Sentry:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     contexts: {
    //       react: {
    //         componentStack: errorInfo.componentStack,
    //       },
    //     },
    //     tags: {
    //       errorBoundary: 'global',
    //     },
    //   });
    // }

    // Example with custom API:
    // fetch('/api/log-error', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     error: error.toString(),
    //     stack: error.stack,
    //     componentStack: errorInfo.componentStack,
    //     userAgent: navigator.userAgent,
    //     url: window.location.href,
    //   }),
    // }).catch(console.error);
  };

  return (
    <ErrorBoundary 
      onError={handleError}
      showDetails={isDevelopment}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Page-level Error Boundary
 * 
 * Use this for individual pages/routes to provide page-specific
 * error handling without crashing the entire app.
 * 
 * @example In a page component
 * ```tsx
 * export default function MyPage() {
 *   return (
 *     <PageErrorBoundary>
 *       <PageContent />
 *     </PageErrorBoundary>
 *   );
 * }
 * ```
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <ErrorBoundary 
      showDetails={isDevelopment}
      fallback={
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Page Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This page encountered an error. Please try refreshing or going back.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Section-level Error Boundary
 * 
 * Use this for specific sections/features within a page to provide
 * granular error handling.
 * 
 * @example In a component
 * ```tsx
 * <SectionErrorBoundary sectionName="User Profile">
 *   <UserProfileCard />
 * </SectionErrorBoundary>
 * ```
 */
export function SectionErrorBoundary({ 
  children, 
  sectionName = 'This section' 
}: { 
  children: ReactNode;
  sectionName?: string;
}) {
  return (
    <ErrorBoundary 
      fallback={
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
                {sectionName} Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {sectionName} encountered an error and couldn&apos;t be displayed. 
                Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
