"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Menu, User, Upload, FileText, ArrowRight, ArrowLeft, Expand, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { api, APIErrorClass, isAuthError } from "@/lib/api-error-handler"
import { getBackendUrl, BACKEND_ENDPOINTS } from "@/lib/config"

// Helper function to check if the file is a PDF
const isPdfFile = (f: File) => {
  const mime = (f.type || "").toLowerCase()
  const name = (f.name || "").toLowerCase()
  return mime === "application/pdf" || name.endsWith(".pdf")
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-md bg-gray-200", className)} />
)

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const MAX_FILE_SIZE_MB = 10

  useEffect(() => {
    setIsLoaded(true)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullScreen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [previewUrl])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!isPdfFile(selectedFile)) {
      setError("Please upload a PDF file.")
      setFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      return
    }

    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Max ${MAX_FILE_SIZE_MB}MB.`)
      setFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      return
    }

    setError(null)
    setFile(selectedFile)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null) // Reset for skeleton loader
    setTimeout(() => {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    }, 300) // Simulate a short delay for loader
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (!droppedFile) return

    if (!isPdfFile(droppedFile)) {
      setError("Please upload a PDF file.")
      setFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      return
    }

    if (droppedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Max ${MAX_FILE_SIZE_MB}MB.`)
      setFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      return
    }

    setError(null)
    setFile(droppedFile)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null) // Reset for skeleton loader
    setTimeout(() => {
      const url = URL.createObjectURL(droppedFile)
      setPreviewUrl(url)
    }, 300) // Simulate a short delay for loader
  }

  const clearFile = () => {
    setFile(null)
    setError(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError("")

    try {
      // Create FormData to send the file
      const formData = new FormData()
      formData.append('resume', file)

      // Use the new API client with automatic auth token injection
      const data = await api.upload(getBackendUrl(BACKEND_ENDPOINTS.UPLOAD_RESUME), formData)

      // Backend already stores everything in normalized tables
      // No need to store in localStorage anymore
      console.log('Resume uploaded successfully:', data)

      // Navigate to skills page to review extracted skills
      router.push("/skills")
      
    } catch (err) {
      console.error('Error uploading resume:', err)
      
      if (err instanceof APIErrorClass) {
        // Handle authentication errors
        if (isAuthError(err)) {
          setError('Your session has expired. Please log in again.')
          setTimeout(() => router.push('/auth'), 2000)
          return
        }
        
        // Display user-friendly error message
        setError(err.getUserMessage())
        
        // Log request ID for debugging
        if (err.requestId) {
          console.error('Request ID for debugging:', err.requestId)
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen skillmap-bg">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Card
          className={`bg-white shadow-lg border-0 card-hover transition-all duration-1000 ${isLoaded ? "animate-scaleIn" : "opacity-0 scale-90"}`}
        >
          <CardHeader className="text-center animate-fadeInUp">
            <CardTitle className="text-3xl font-bold text-gray-900">Upload Your Resume</CardTitle>
            <p className="text-gray-600 mt-2 animate-fadeInUp animate-delay-200">
              Let our AI analyze your resume and extract your skills automatically
            </p>
          </CardHeader>
          <CardContent className="animate-fadeInUp animate-delay-300 p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Left: Upload section */}
              <div className="space-y-6">
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer hover-lift ${
                    dragActive
                      ? "border-blue-400 bg-blue-50 scale-105"
                      : file
                        ? "border-green-400 bg-green-50"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload
                    className={`h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 transition-all duration-300 ${
                      dragActive
                        ? "text-blue-500 scale-110"
                        : file
                          ? "text-green-500"
                          : "text-gray-400 hover:text-blue-500"
                    }`}
                  />
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 transition-all duration-300">
                    {file ? file.name : dragActive ? "Drop your resume here" : "Drop your resume here"}
                  </h3>
                  <p className="text-gray-600 mb-4 transition-all duration-300 text-sm">
                    {file ? "File selected. Click upload to continue." : "or click to browse files"}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500">PDF files only, max {MAX_FILE_SIZE_MB}MB</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Error message placeholder */}
                {error ? <p className="text-sm text-red-600">{error}</p> : <div className="h-4" />}

                {/* File Info */}
                {file && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg animate-slideInLeft hover-lift">
                    <FileText className="h-6 w-6 md:h-8 md:w-8 text-blue-600 animate-bounce-slow" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm md:text-base">{file.name}</p>
                      <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {/* Quick clear button */}
                    <Button variant="ghost" size="sm" onClick={clearFile} className="md:hidden">
                      Clear
                    </Button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-2">
                  <Button variant="outline" asChild className="hover-lift bg-transparent">
                    <Link href="/auth">
                      <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                      Back
                    </Link>
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                    className="skillmap-button text-white min-w-32 hover-lift"
                  >
                    {isUploading ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        Upload & Analyze
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Processing Message */}
                {isUploading && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg animate-scaleIn">
                    <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-blue-800 font-medium animate-pulse-slow">
                      Analyzing your resume<span className="loading-dots"></span>
                    </p>
                    <p className="text-blue-600 text-sm mt-1">This may take a few moments</p>
                  </div>
                )}
              </div>

              {/* Right: Preview section */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 flex flex-col relative">
                {!file ? (
                  <div className="flex flex-1 flex-col items-center justify-center text-center py-12">
                    <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mb-4" />
                    <h4 className="text-base md:text-lg font-semibold text-gray-900">Resume Preview</h4>
                    <p className="text-sm text-gray-600 mt-1">Your file will be displayed here.</p>
                  </div>
                ) : (
                  <>
                    {/* Info bar */}
                    <div className="bg-white border-b border-gray-200 rounded-t-md p-2 md:p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                        <span className="truncate text-sm text-gray-800 font-medium">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(true)} className="h-8 w-8">
                          <Expand className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={clearFile} className="h-8 w-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {/* PDF preview */}
                    <div className="mt-0 flex-1 relative">
                      {previewUrl ? (
                        <div className="w-full h-full rounded-b-md border border-gray-200 overflow-hidden">
                          <embed
                            src={`${previewUrl}#toolbar=0&navpanes=0`}
                            type="application/pdf"
                            className="w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full p-4 space-y-4">
                          <Skeleton className="h-8 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-4 w-full" />
                          <div className="pt-8 space-y-4">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/6" />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isFullScreen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={() => setIsFullScreen(false)}
          >
            <div 
              className="relative w-full h-full max-w-screen-lg transform transition-transform duration-300 scale-95"
              onClick={(e) => e.stopPropagation()}
              style={isFullScreen ? { transform: 'scale(1)' } : {}}
            >
              <div className="absolute top-2 right-2 z-10">
                <Button variant="destructive" size="icon" onClick={() => setIsFullScreen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              {previewUrl && (
                <embed
                  src={`${previewUrl}#toolbar=1`}
                  type="application/pdf"
                  className="w-full h-full border-4 border-white rounded-lg"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
