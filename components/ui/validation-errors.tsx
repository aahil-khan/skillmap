/**
 * Validation Errors Component
 * 
 * Display validation errors in a user-friendly format.
 * Supports both field-level errors and general validation messages.
 */

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ValidationErrorsProps {
  /** Record of field names to error messages */
  errors: Record<string, string>
  /** Optional className for styling */
  className?: string
}

/**
 * ValidationErrors - Display all validation errors at once
 * 
 * @example
 * ```tsx
 * <ValidationErrors 
 *   errors={{
 *     email: "Email is required",
 *     password: "Password must be at least 8 characters"
 *   }}
 * />
 * ```
 */
export function ValidationErrors({ errors, className = "" }: ValidationErrorsProps) {
  const errorMessages = Object.entries(errors)
    .filter(([_, message]) => message) // Filter out empty messages
    .map(([field, message]) => ({ field, message }))

  if (errorMessages.length === 0) return null

  return (
    <Alert variant="destructive" className={`animate-slideInDown ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1">
          {errorMessages.map(({ field, message }) => (
            <li key={field}>
              <strong className="capitalize">{field.replace(/_/g, ' ')}:</strong> {message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Field Validation Error - Display error for a specific field
 */
interface FieldErrorProps {
  /** Error message for the field */
  error?: string
  /** Field name (for accessibility) */
  fieldName?: string
  /** Optional className for styling */
  className?: string
}

export function FieldError({ error, fieldName, className = "" }: FieldErrorProps) {
  if (!error) return null

  return (
    <div 
      role="alert" 
      aria-live="polite"
      className={`text-red-500 text-sm mt-1 flex items-center gap-1 animate-fadeIn ${className}`}
    >
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      <span id={fieldName ? `${fieldName}-error` : undefined}>{error}</span>
    </div>
  )
}

/**
 * Get error class for input fields
 */
export function getErrorInputClass(hasError: boolean): string {
  return hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
}

/**
 * Hook to manage validation errors
 */
import { useState, useCallback } from "react"

export function useValidationErrors(initialErrors: Record<string, string> = {}) {
  const [errors, setErrors] = useState<Record<string, string>>(initialErrors)

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }))
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  const hasErrors = Object.keys(errors).length > 0
  const hasFieldError = useCallback((field: string) => !!errors[field], [errors])

  return {
    errors,
    setErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasErrors,
    hasFieldError,
  }
}
