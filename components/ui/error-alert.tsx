/**
 * Reusable Error Alert Component
 * 
 * A standardized error display component used across the application.
 * Provides consistent error messaging with icons and optional retry functionality.
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, X } from "lucide-react"

interface ErrorAlertProps {
  /** Error message to display */
  error: string | null
  /** Optional error title (defaults to "Error") */
  title?: string
  /** Optional callback to clear the error */
  onDismiss?: () => void
  /** Optional callback for retry action */
  onRetry?: () => void
  /** Whether the retry button should show loading state */
  isRetrying?: boolean
  /** Custom className for styling */
  className?: string
  /** Variant of the alert */
  variant?: "default" | "destructive"
}

/**
 * ErrorAlert - Reusable error display component
 * 
 * @example
 * ```tsx
 * <ErrorAlert 
 *   error={error}
 *   onDismiss={() => setError(null)}
 *   onRetry={handleRetry}
 *   isRetrying={isLoading}
 * />
 * ```
 */
export function ErrorAlert({
  error,
  title = "Error",
  onDismiss,
  onRetry,
  isRetrying = false,
  className = "",
  variant = "destructive",
}: ErrorAlertProps) {
  if (!error) return null

  return (
    <Alert 
      variant={variant} 
      className={`animate-slideInDown ${className}`}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>{title}</span>
        <div className="flex items-center gap-2">
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
              className="h-6 px-2 text-xs"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry
                </>
              )}
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Dismiss</span>
            </Button>
          )}
        </div>
      </AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}

/**
 * Inline Error Message - For field-level errors
 */
interface InlineErrorProps {
  error?: string
  className?: string
}

export function InlineError({ error, className = "" }: InlineErrorProps) {
  if (!error) return null

  return (
    <p className={`text-red-500 text-sm mt-1 flex items-center gap-1 animate-fadeIn ${className}`}>
      <AlertCircle className="h-3 w-3" />
      {error}
    </p>
  )
}

/**
 * Error Summary - For displaying multiple errors
 */
interface ErrorSummaryProps {
  errors: string[]
  title?: string
  onDismiss?: () => void
  className?: string
}

export function ErrorSummary({
  errors,
  title = "Please fix the following errors:",
  onDismiss,
  className = "",
}: ErrorSummaryProps) {
  if (!errors || errors.length === 0) return null

  return (
    <Alert variant="destructive" className={`animate-slideInDown ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>{title}</span>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1 mt-2">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
