# Frontend Error Handling Guide

## Overview

This guide demonstrates how to use the centralized API error handling system in the SkillMap frontend.

## Installation

The error handler is located at `lib/api-error-handler.ts` and exports:
- `api` - API client with convenience methods
- `APIErrorClass` - Custom error class
- `useAPIError` - React hook for error handling
- Utility functions for error checking and retry logic

---

## Basic Usage

### Simple GET Request

```typescript
import { api, APIErrorClass } from '@/lib/api-error-handler';

async function fetchUserProfile() {
  try {
    const profile = await api.get('/user-profile');
    console.log('Profile:', profile);
  } catch (error) {
    if (error instanceof APIErrorClass) {
      console.error('API Error:', error.getUserMessage());
      console.error('Error Code:', error.code);
      console.error('Request ID:', error.requestId);
    }
  }
}
```

### POST Request with Body

```typescript
import { api, APIErrorClass, formatValidationErrors } from '@/lib/api-error-handler';

async function createProfile(data: ProfileData) {
  try {
    const result = await api.post('/user-profile', data);
    return result;
  } catch (error) {
    if (error instanceof APIErrorClass && error.is('VALIDATION_ERROR')) {
      // Get validation errors as object
      const validationErrors = formatValidationErrors(error);
      // { name: "Name must be at least 2 characters", ... }
      return validationErrors;
    }
    throw error;
  }
}
```

### File Upload

```typescript
import { api } from '@/lib/api-error-handler';

async function uploadResume(file: File) {
  const formData = new FormData();
  formData.append('resume', file);
  
  const result = await api.upload('/upload-resume', formData);
  return result;
}
```

---

## React Component Examples

### Using the Hook

```typescript
'use client';

import { useState } from 'react';
import { api, useAPIError } from '@/lib/api-error-handler';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ProfileForm() {
  const [name, setName] = useState('');
  const { error, handleError, clearError } = useAPIError();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      const result = await api.post('/user-profile', { name });
      console.log('Profile created:', result);
      // Handle success
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error.getUserMessage()}
            {error.requestId && (
              <p className="text-xs mt-1">Request ID: {error.requestId}</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  );
}
```

### Form with Validation Errors

```typescript
'use client';

import { useState } from 'react';
import { api, APIErrorClass, formatValidationErrors } from '@/lib/api-error-handler';

export function ProfileFormWithValidation() {
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    try {
      const result = await api.post('/user-profile', formData);
      // Handle success
      console.log('Success:', result);
    } catch (error) {
      if (error instanceof APIErrorClass) {
        if (error.is('VALIDATION_ERROR')) {
          // Display field-specific errors
          setErrors(formatValidationErrors(error));
        } else {
          // Display general error
          setGeneralError(error.getUserMessage());
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {generalError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {generalError}
        </div>
      )}

      <div>
        <label>Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label>Goal</label>
        <textarea
          value={formData.goal}
          onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
          className={errors.goal ? 'border-red-500' : ''}
        />
        {errors.goal && (
          <p className="text-red-500 text-sm mt-1">{errors.goal}</p>
        )}
      </div>

      <button type="submit">Save</button>
    </form>
  );
}
```

---

## Advanced Usage

### Automatic Retry with Backoff

```typescript
import { api, retryWithBackoff } from '@/lib/api-error-handler';

async function fetchDataWithRetry() {
  try {
    const data = await retryWithBackoff(
      () => api.get('/analyze-skill-gaps'),
      3, // max retries
      1000 // initial delay (ms)
    );
    return data;
  } catch (error) {
    // All retries failed
    console.error('Failed after retries:', error);
  }
}
```

### Authentication Error Handling

```typescript
import { api, isAuthError } from '@/lib/api-error-handler';
import { useRouter } from 'next/navigation';

export function useAuthenticatedAPI() {
  const router = useRouter();

  const authenticatedFetch = async <T,>(url: string, options?: RequestInit): Promise<T> => {
    try {
      return await api.get<T>(url, options);
    } catch (error) {
      if (isAuthError(error)) {
        // Redirect to login
        router.push('/auth?redirect=' + encodeURIComponent(window.location.pathname));
        throw error;
      }
      throw error;
    }
  };

  return { authenticatedFetch };
}
```

### Loading States with Error Handling

```typescript
'use client';

import { useState, useEffect } from 'react';
import { api, APIErrorClass } from '@/lib/api-error-handler';

interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: APIErrorClass | null;
}

export function useAPIData<T>(url: string) {
  const [state, setState] = useState<DataState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const data = await api.get<T>(url);
        
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled && error instanceof APIErrorClass) {
          setState({ data: null, loading: false, error });
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}

// Usage in component
function MyComponent() {
  const { data, loading, error } = useAPIData('/user-profile');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.getUserMessage()}</div>;
  if (!data) return <div>No data</div>;

  return <div>Data: {JSON.stringify(data)}</div>;
}
```

---

## Error Type Checking

### Check Specific Error Types

```typescript
import { api, APIErrorClass } from '@/lib/api-error-handler';

try {
  await api.post('/user-profile', data);
} catch (error) {
  if (!(error instanceof APIErrorClass)) {
    console.error('Unknown error:', error);
    return;
  }

  // Check error type
  if (error.is('VALIDATION_ERROR')) {
    console.log('Validation failed:', error.getValidationErrors());
  } else if (error.is('RATE_LIMIT_ERROR')) {
    console.log('Rate limited, retry after:', error.statusCode);
  } else if (error.is('NOT_FOUND')) {
    console.log('Resource not found');
  } else {
    console.log('Other error:', error.getUserMessage());
  }
}
```

### Check HTTP Status Codes

```typescript
if (error instanceof APIErrorClass) {
  switch (error.statusCode) {
    case 400:
      // Bad request
      break;
    case 401:
      // Unauthorized
      break;
    case 403:
      // Forbidden
      break;
    case 404:
      // Not found
      break;
    case 429:
      // Rate limit
      break;
    case 500:
      // Server error
      break;
  }
}
```

---

## Best Practices

### 1. Always Handle Errors

```typescript
// ❌ Bad: No error handling
const data = await api.get('/user-profile');

// ✅ Good: Proper error handling
try {
  const data = await api.get('/user-profile');
  // Use data
} catch (error) {
  // Handle error
}
```

### 2. Display User-Friendly Messages

```typescript
// ❌ Bad: Technical error message
catch (error) {
  alert(error.message); // "Database query failed"
}

// ✅ Good: User-friendly message
catch (error) {
  if (error instanceof APIErrorClass) {
    alert(error.getUserMessage()); // "Something went wrong. Please try again."
  }
}
```

### 3. Log Request IDs for Debugging

```typescript
catch (error) {
  if (error instanceof APIErrorClass && error.requestId) {
    console.error(`Error occurred. Request ID: ${error.requestId}`);
    // This ID can be used to trace the error in backend logs
  }
}
```

### 4. Handle Validation Errors Gracefully

```typescript
// ❌ Bad: Generic error display
catch (error) {
  alert('Invalid input');
}

// ✅ Good: Show field-specific errors
catch (error) {
  if (error instanceof APIErrorClass && error.is('VALIDATION_ERROR')) {
    const validationErrors = formatValidationErrors(error);
    // Display errors next to respective form fields
    Object.entries(validationErrors).forEach(([field, message]) => {
      showFieldError(field, message);
    });
  }
}
```

### 5. Implement Retry Logic for Temporary Failures

```typescript
import { retryWithBackoff, isRetryableError } from '@/lib/api-error-handler';

// Automatically retry on network issues or server errors
const data = await retryWithBackoff(
  () => api.get('/analyze-skill-gaps'),
  3 // max 3 retries
);
```

---

## Migration from Old Code

### Before (Direct fetch)

```typescript
const response = await fetch('/api/user-profile', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(data),
});

if (!response.ok) {
  throw new Error('Request failed');
}

const result = await response.json();
```

### After (Using API handler)

```typescript
import { api } from '@/lib/api-error-handler';

try {
  const result = await api.post('/api/user-profile', data);
  // Handle success
} catch (error) {
  if (error instanceof APIErrorClass) {
    console.error(error.getUserMessage());
  }
}
```

---

## Testing

### Mocking API Errors in Tests

```typescript
import { APIErrorClass } from '@/lib/api-error-handler';

// Mock an API error
const mockError = new APIErrorClass({
  message: 'Validation failed',
  code: 'VALIDATION_ERROR',
  statusCode: 400,
  details: [
    { field: 'name', message: 'Name is required' }
  ],
  requestId: 'test-request-id',
});

// Test error handling
it('should display validation errors', async () => {
  jest.spyOn(api, 'post').mockRejectedValue(mockError);
  
  // ... test component behavior
});
```

---

## Common Patterns

### Pattern 1: Submit Form with Loading and Error States

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string>('');

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    await api.post('/user-profile', formData);
    // Success - redirect or show success message
  } catch (err) {
    if (err instanceof APIErrorClass) {
      setError(err.getUserMessage());
    }
  } finally {
    setLoading(false);
  }
};
```

### Pattern 2: Fetch Data on Component Mount

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await api.get('/user-profile');
      setData(data);
    } catch (err) {
      if (err instanceof APIErrorClass) {
        setError(err.getUserMessage());
      }
    }
  };

  fetchData();
}, []);
```

### Pattern 3: Upload File with Progress

```typescript
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);

  try {
    setUploading(true);
    const result = await api.upload('/upload-resume', formData);
    console.log('Upload successful:', result);
  } catch (err) {
    if (err instanceof APIErrorClass) {
      alert(err.getUserMessage());
    }
  } finally {
    setUploading(false);
  }
};
```

---

## Summary

The centralized error handling system provides:

1. **Consistent Error Format**: All API errors follow the same structure
2. **User-Friendly Messages**: Automatic conversion of technical errors to user-friendly messages
3. **Type Safety**: TypeScript support with proper typing
4. **Validation Errors**: Easy access to field-specific validation errors
5. **Request Tracking**: Request IDs for debugging
6. **Retry Logic**: Built-in exponential backoff for temporary failures
7. **Authentication Handling**: Automatic detection of auth errors

Use these patterns and utilities to build robust, error-resilient frontend applications.
