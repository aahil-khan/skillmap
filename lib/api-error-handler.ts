/**
 * Frontend API Error Handler
 * Centralized error handling for API calls
 */

export interface APIError {
  message: string;
  code: string;
  statusCode: number;
  details?: Array<{
    field: string;
    message: string;
  }>;
  timestamp?: string;
  requestId?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  requestId?: string;
}

/**
 * Custom error class for API errors
 */
export class APIErrorClass extends Error {
  code: string;
  statusCode: number;
  details?: Array<{ field: string; message: string }>;
  requestId?: string;

  constructor(error: APIError) {
    super(error.message);
    this.name = 'APIError';
    this.code = error.code;
    this.statusCode = error.statusCode;
    this.details = error.details;
    this.requestId = error.requestId;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    // Map technical errors to user-friendly messages
    const userMessages: Record<string, string> = {
      VALIDATION_ERROR: 'Please check your input and try again.',
      AUTHENTICATION_ERROR: 'Please sign in to continue.',
      FORBIDDEN: 'You don\'t have permission to perform this action.',
      NOT_FOUND: 'The requested resource was not found.',
      CONFLICT: 'This resource already exists.',
      RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment and try again.',
      INTERNAL_ERROR: 'Something went wrong. Please try again later.',
      EXTERNAL_SERVICE_ERROR: 'External service is temporarily unavailable.',
      DATABASE_ERROR: 'Database connection issue. Please try again later.',
    };

    return userMessages[this.code] || this.message || 'An unexpected error occurred.';
  }

  /**
   * Get validation error messages as object
   */
  getValidationErrors(): Record<string, string> {
    if (!this.details || this.details.length === 0) {
      return {};
    }

    return this.details.reduce((acc, detail) => {
      acc[detail.field] = detail.message;
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Check if error is a specific type
   */
  is(code: string): boolean {
    return this.code === code;
  }
}

/**
 * Handle API response and throw errors if needed
 */
export function handleAPIResponse<T>(response: APIResponse<T>): T {
  if (!response.success && response.error) {
    throw new APIErrorClass(response.error);
  }

  if (!response.data && response.success) {
    // Some endpoints might not return data
    return {} as T;
  }

  return response.data as T;
}

/**
 * Fetch wrapper with error handling
 */
export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Get auth token from localStorage (TODO: Move to secure storage)
    const token = localStorage.getItem('supabase.auth.token');
    
    // Add default headers
    const headers = new Headers(options.headers);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    // Make request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parse JSON response
    let data: APIResponse<T>;
    try {
      data = await response.json();
    } catch (parseError) {
      // Response is not JSON
      throw new APIErrorClass({
        message: 'Invalid response from server',
        code: 'PARSE_ERROR',
        statusCode: response.status,
      });
    }

    // Handle API response
    return handleAPIResponse(data);
  } catch (error) {
    // Network error or parsing error
    if (error instanceof APIErrorClass) {
      throw error;
    }

    // Unknown error
    throw new APIErrorClass({
      message: error instanceof Error ? error.message : 'Network error',
      code: 'NETWORK_ERROR',
      statusCode: 0,
    });
  }
}

/**
 * API client with convenience methods
 */
export const api = {
  /**
   * GET request
   */
  get: async <T = any>(url: string, options?: RequestInit): Promise<T> => {
    return apiFetch<T>(url, { ...options, method: 'GET' });
  },

  /**
   * POST request
   */
  post: async <T = any>(url: string, body?: any, options?: RequestInit): Promise<T> => {
    return apiFetch<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * PUT request
   */
  put: async <T = any>(url: string, body?: any, options?: RequestInit): Promise<T> => {
    return apiFetch<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  /**
   * DELETE request
   */
  delete: async <T = any>(url: string, options?: RequestInit): Promise<T> => {
    return apiFetch<T>(url, { ...options, method: 'DELETE' });
  },

  /**
   * Upload file with FormData
   */
  upload: async <T = any>(url: string, formData: FormData, options?: RequestInit): Promise<T> => {
    // Don't set Content-Type header for FormData (browser will set it with boundary)
    const headers = new Headers(options?.headers);
    headers.delete('Content-Type');

    return apiFetch<T>(url, {
      ...options,
      method: 'POST',
      body: formData,
      headers,
    });
  },
};

/**
 * React hook for handling API errors
 */
export function useAPIError() {
  const [error, setError] = React.useState<APIErrorClass | null>(null);

  const handleError = (err: unknown) => {
    if (err instanceof APIErrorClass) {
      setError(err);
    } else if (err instanceof Error) {
      setError(new APIErrorClass({
        message: err.message,
        code: 'UNKNOWN_ERROR',
        statusCode: 0,
      }));
    } else {
      setError(new APIErrorClass({
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        statusCode: 0,
      }));
    }
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
}

/**
 * Format validation errors for form display
 */
export function formatValidationErrors(error: APIErrorClass): Record<string, string> {
  if (!error.is('VALIDATION_ERROR')) {
    return {};
  }
  return error.getValidationErrors();
}

/**
 * Check if error requires authentication
 */
export function isAuthError(error: unknown): boolean {
  return (
    error instanceof APIErrorClass &&
    (error.is('AUTHENTICATION_ERROR') || error.statusCode === 401)
  );
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof APIErrorClass)) {
    return false;
  }

  const retryableCodes = [
    'RATE_LIMIT_ERROR',
    'EXTERNAL_SERVICE_ERROR',
    'DATABASE_ERROR',
    'NETWORK_ERROR',
  ];

  return retryableCodes.includes(error.code) || error.statusCode >= 500;
}

/**
 * Retry wrapper with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's not a retryable error
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      
      console.log(`Retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Import React for the hook (only if using React)
import React from 'react';
