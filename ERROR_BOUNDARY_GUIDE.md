# Error Boundary Implementation Guide

## Overview

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of the component tree that crashed.

This implementation provides three levels of error boundaries for granular error handling:
1. **Global Error Boundary** - Catches all application errors
2. **Page Error Boundary** - Catches errors within specific pages
3. **Section Error Boundary** - Catches errors within specific sections/components

---

## Components

### 1. ErrorBoundary (Base Component)

**File:** `components/ErrorBoundary.tsx`

The base error boundary component that implements React's error boundary lifecycle methods.

**Features:**
- Catches and displays React component errors
- Shows user-friendly error UI with recovery options
- Tracks error count to detect recurring issues
- Shows detailed error information in development mode
- Provides three recovery actions: Try Again, Reload Page, Go Home
- Supports custom fallback UI and error handlers

**Props:**
```typescript
interface Props {
  children: ReactNode;           // Components to wrap
  fallback?: ReactNode;           // Custom error UI (optional)
  onError?: (error: Error, errorInfo: ErrorInfo) => void;  // Error callback
  showDetails?: boolean;          // Show error details (dev mode)
}
```

**Usage:**
```tsx
<ErrorBoundary 
  showDetails={isDevelopment}
  onError={(error, errorInfo) => logToMonitoring(error)}
>
  <YourComponent />
</ErrorBoundary>
```

---

### 2. GlobalErrorBoundaryProvider

**File:** `components/GlobalErrorBoundary.tsx`

Wraps the entire application to catch all unhandled errors.

**Features:**
- Catches all React errors at the application level
- Automatically shows detailed errors in development
- Provides centralized error logging
- Ready for integration with error monitoring services (Sentry, DataDog, etc.)

**Usage in `app/layout.tsx`:**
```tsx
import { GlobalErrorBoundaryProvider } from '@/components/GlobalErrorBoundary'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GlobalErrorBoundaryProvider>
          {children}
        </GlobalErrorBoundaryProvider>
      </body>
    </html>
  )
}
```

---

### 3. PageErrorBoundary

**File:** `components/GlobalErrorBoundary.tsx`

Use for individual pages to provide page-specific error handling without crashing the entire app.

**Features:**
- Catches errors within a specific page
- Shows compact error UI suitable for page-level errors
- Prevents full app crash when a single page fails
- Provides "Refresh Page" action

**Usage in page components:**
```tsx
import { PageErrorBoundary } from '@/components/GlobalErrorBoundary'

export default function MyPage() {
  return (
    <PageErrorBoundary>
      <PageContent />
      <DataFetchingComponent />
      <ComplexInteractiveFeature />
    </PageErrorBoundary>
  )
}
```

---

### 4. SectionErrorBoundary

**File:** `components/GlobalErrorBoundary.tsx`

Use for specific sections or features within a page for granular error handling.

**Features:**
- Catches errors within a specific section
- Shows inline error message
- Prevents section errors from breaking the entire page
- Customizable section name for better user feedback

**Props:**
```typescript
{
  children: ReactNode;
  sectionName?: string;  // Name to show in error message
}
```

**Usage in components:**
```tsx
import { SectionErrorBoundary } from '@/components/GlobalErrorBoundary'

export default function DashboardPage() {
  return (
    <div>
      <SectionErrorBoundary sectionName="User Profile">
        <UserProfileCard />
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Activity Feed">
        <ActivityFeed />
      </SectionErrorBoundary>

      <SectionErrorBoundary sectionName="Recommendations">
        <RecommendationWidget />
      </SectionErrorBoundary>
    </div>
  )
}
```

---

## Higher-Order Component (HOC)

### withErrorBoundary

Wrap any component with an error boundary using the HOC pattern.

**Usage:**
```tsx
import { withErrorBoundary } from '@/components/ErrorBoundary'

const MyComponent = () => {
  // Component code
}

export default withErrorBoundary(MyComponent, {
  showDetails: process.env.NODE_ENV === 'development',
  onError: (error) => console.error('Component error:', error)
})
```

---

## Implementation Strategy

### 1. Global Level (Already Implemented)
✅ Root layout wrapped with `GlobalErrorBoundaryProvider`
- File: `app/layout.tsx`
- Catches all application-wide errors
- Shows full-page error UI

### 2. Page Level (Recommended)
Apply `PageErrorBoundary` to critical pages:

```tsx
// app/upload/page.tsx
import { PageErrorBoundary } from '@/components/GlobalErrorBoundary'

export default function UploadPage() {
  return (
    <PageErrorBoundary>
      {/* page content */}
    </PageErrorBoundary>
  )
}
```

**Priority pages to wrap:**
- [ ] `app/upload/page.tsx` - Resume upload
- [ ] `app/results/page.tsx` - Analysis results
- [ ] `app/onboarding/page.tsx` - User onboarding
- [ ] `app/dashboard/page.tsx` - Dashboard
- [ ] `app/leetcode/page.tsx` - LeetCode integration
- [ ] `app/peer-matching/page.tsx` - Peer matching

### 3. Section Level (Optional but Recommended)
Apply `SectionErrorBoundary` to complex/risky components:

```tsx
export default function ComplexPage() {
  return (
    <div>
      {/* This section might fail independently */}
      <SectionErrorBoundary sectionName="Data Visualization">
        <ComplexChart />
      </SectionErrorBoundary>

      {/* This section is independent */}
      <SectionErrorBoundary sectionName="User Stats">
        <StatisticsWidget />
      </SectionErrorBoundary>
    </div>
  )
}
```

**Good candidates for section boundaries:**
- Complex data visualizations
- Third-party integrations
- Real-time data feeds
- Heavy computational components
- Components with external API calls

---

## Error Logging & Monitoring

### Current Implementation
- Errors logged to console in all environments
- Detailed error info shown in development mode
- Error count tracked to detect recurring issues

### Integration with Error Monitoring Services

#### Option 1: Sentry (Recommended)

1. **Install Sentry:**
```bash
npm install @sentry/nextjs
```

2. **Configure Sentry:**
```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

3. **Update GlobalErrorBoundary.tsx:**
```typescript
const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Global Error Boundary caught error:', error);

  // Send to Sentry
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: 'global',
      },
    });
  }
};
```

#### Option 2: Custom API Endpoint

Create an API endpoint to log errors:

```typescript
// app/api/log-error/route.ts
export async function POST(request: Request) {
  const errorData = await request.json();
  
  // Log to database or external service
  console.error('Client error:', errorData);
  
  // TODO: Store in database or forward to monitoring service
  
  return Response.json({ success: true });
}
```

Update error handler:
```typescript
const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
  fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }),
  }).catch(console.error);
};
```

---

## Error Boundary Limitations

### What Error Boundaries DO NOT Catch:
1. ❌ Errors in event handlers (use try-catch)
2. ❌ Errors in async code (use try-catch or .catch())
3. ❌ Errors in server-side rendering
4. ❌ Errors thrown in the error boundary itself

### Handling Event Handler Errors

```tsx
const handleClick = async () => {
  try {
    await riskyOperation();
  } catch (error) {
    console.error('Event handler error:', error);
    // Show user-friendly error message
    setError('Operation failed. Please try again.');
  }
};
```

### Handling Async Errors

```tsx
useEffect(() => {
  fetchData()
    .catch(error => {
      console.error('Async error:', error);
      setError('Failed to load data');
    });
}, []);
```

---

## Testing Error Boundaries

### Test Component (Development Only)

Create a test component to verify error boundary works:

```tsx
// components/ErrorTest.tsx
'use client';

import { useState } from 'react';

export function ErrorTest() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Test error thrown by ErrorTest component');
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Error Boundary Test</h3>
      <button
        onClick={() => setShouldThrow(true)}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Throw Error
      </button>
    </div>
  );
}
```

### Using the Test Component

```tsx
import { ErrorTest } from '@/components/ErrorTest';
import { SectionErrorBoundary } from '@/components/GlobalErrorBoundary';

export default function TestPage() {
  return (
    <div className="p-8">
      <h1>Error Boundary Test Page</h1>
      
      <SectionErrorBoundary sectionName="Error Test">
        <ErrorTest />
      </SectionErrorBoundary>
    </div>
  );
}
```

---

## Best Practices

### 1. **Use Multiple Layers**
- Global boundary at root (done ✅)
- Page boundaries for major routes
- Section boundaries for complex features

### 2. **Provide Context**
- Use descriptive section names
- Include user-friendly error messages
- Show recovery options

### 3. **Log Everything**
- Log to console in development
- Send to monitoring service in production
- Include component stack traces

### 4. **Don't Overuse**
- Don't wrap every component
- Focus on risky/complex components
- Balance granularity with maintenance

### 5. **Test in Development**
- Throw test errors
- Verify error UI displays correctly
- Check error logging works

### 6. **User Experience**
- Show clear error messages
- Provide recovery actions
- Don't show technical details to users (except dev mode)

---

## Migration Checklist

- [x] Create ErrorBoundary base component
- [x] Create GlobalErrorBoundaryProvider
- [x] Create PageErrorBoundary
- [x] Create SectionErrorBoundary
- [x] Wrap root layout with GlobalErrorBoundaryProvider
- [ ] Add PageErrorBoundary to critical pages
- [ ] Add SectionErrorBoundary to complex components
- [ ] Integrate with error monitoring service (Sentry/custom)
- [ ] Test error boundaries in development
- [ ] Document error handling patterns for team

---

## Summary

✅ **Completed:**
- Base ErrorBoundary component with full features
- Global error boundary at application root
- Page-level error boundary component
- Section-level error boundary component
- HOC for wrapping components
- Root layout integration
- Development mode error details
- User-friendly error UI
- Multiple recovery options

📋 **Next Steps:**
1. Apply PageErrorBoundary to critical pages
2. Apply SectionErrorBoundary to complex components
3. Integrate with error monitoring service (Sentry recommended)
4. Test error boundaries thoroughly

---

**Files Created:**
- `components/ErrorBoundary.tsx` - Base error boundary (class component)
- `components/GlobalErrorBoundary.tsx` - Global/Page/Section boundaries
- This documentation file

**Files Modified:**
- `app/layout.tsx` - Wrapped with GlobalErrorBoundaryProvider

**Status:** ✅ Section 2.2 (Frontend Error Handling) - Global Error Boundaries COMPLETED
