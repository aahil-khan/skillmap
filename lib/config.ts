/**
 * Centralized configuration for API endpoints
 * 
 * This file contains all API base URLs and endpoint configurations.
 * Environment variables are loaded from .env.local
 */

// API Base URLs
export const API_CONFIG = {
  // Backend API base URL (skillmap_engine)
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5005',
  
  // Frontend API routes (Next.js API routes)
  FRONTEND_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  
  // Timeout for API requests (in milliseconds)
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  
  // Retry configuration
  MAX_RETRIES: parseInt(process.env.NEXT_PUBLIC_MAX_RETRIES || '3'),
  RETRY_DELAY: parseInt(process.env.NEXT_PUBLIC_RETRY_DELAY || '1000'),
} as const

// Backend API Endpoints
export const BACKEND_ENDPOINTS = {
  // Resume & Profile
  UPLOAD_RESUME: '/upload-resume',
  USER_PROFILE: '/user-profile',
  
  // Analysis
  ANALYZE_SKILL_GAPS: '/analyze-skill-gaps',
  CONVERT_TO_STANDALONE: '/convert-to-standalone',
  
  // Skills
  SKILL_SEARCH: '/skill-search',
  
  // LeetCode
  LEETCODE_BASE: (username: string) => `/leetcode/${username}`,
  LEETCODE_PROFILE: (username: string) => `/leetcode/${username}/profile`,
  LEETCODE_SUBMISSION: (username: string) => `/leetcode/${username}/submission`,
  LEETCODE_LANGUAGES: (username: string) => `/leetcode/${username}/languages`,
  LEETCODE_TOPICS: (username: string) => `/leetcode/${username}/topics`,
  LEETCODE_ACTIVITY: (username: string) => `/leetcode/${username}/activity`,
  LEETCODE_SUGGESTIONS: (username: string) => `/leetcode/${username}/suggestions`,
  SUGGEST_PROBLEM: (username: string) => `/leetcode/${username}/suggest-problem`,
} as const

// Frontend API Routes (Next.js)
export const FRONTEND_ENDPOINTS = {
  // ATS Score
  ATS_SCORE: '/ats-score',
  
  // LeetCode (proxied through Next.js)
  LEETCODE: (username: string) => `/leetcode/${username}`,
  LEETCODE_PROFILE: (username: string) => `/leetcode/${username}/profile`,
  LEETCODE_SUBMISSION: (username: string) => `/leetcode/${username}/submission`,
  LEETCODE_LANGUAGES: (username: string) => `/leetcode/${username}/languages`,
  LEETCODE_TOPICS: (username: string) => `/leetcode/${username}/topics`,
  LEETCODE_ACTIVITY: (username: string) => `/leetcode/${username}/activity`,
  LEETCODE_SUGGESTIONS: (username: string) => `/leetcode/${username}/suggestions`,
} as const

/**
 * Get full URL for a backend endpoint
 */
export function getBackendUrl(endpoint: string): string {
  return `${API_CONFIG.BACKEND_URL}${endpoint}`
}

/**
 * Get full URL for a frontend API route
 */
export function getFrontendApiUrl(endpoint: string): string {
  return `${API_CONFIG.FRONTEND_API_URL}${endpoint}`
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Get environment name
 */
export function getEnvironment(): string {
  return process.env.NODE_ENV || 'development'
}

// Export individual values for convenience
export const { BACKEND_URL, FRONTEND_API_URL, TIMEOUT, MAX_RETRIES, RETRY_DELAY } = API_CONFIG
