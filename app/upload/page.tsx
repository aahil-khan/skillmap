"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Menu, User, Upload, FileText, ArrowRight, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
    }
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
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)

    try {
      // Create FormData to send the file
      const formData = new FormData()
      formData.append('resume', file)

      // Use environment variable or fallback to dummy URL
      const apiUrl = process.env.NEXT_PUBLIC_UPLOAD_API_URL || 'https://api.example.com/upload-resume'
      
      try {
        // Send file to backend server for processing
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to process resume')
        }

        const data = await response.json()

        localStorage.setItem("profile-data", JSON.stringify(data.profile))

        console.log('Profile data received:', data)
        console.log('Checking data.profile:', data.profile)
        console.log('Checking data.profile?.profile:', data.profile?.profile)
        console.log('Checking technical_skills:', data.profile?.profile?.technical_skills)

        // Extract technical skills from the response
        const extractedSkills: Array<{ category: string; skills: string[] }> = []
        
        // Handle the double-nested profile structure
        const technicalSkills = data.profile?.technical_skills || data.technical_skills

        if (technicalSkills) {
          technicalSkills.forEach((category: any) => {
            console.log('Processing category:', category)
            if (category.category && category.skills) {
              extractedSkills.push({
                category: category.category,
                skills: category.skills
              })
            }
          })
        } else {
          console.log('No technical skills found in response')
        }

        console.log('Extracted skills:', extractedSkills)
        localStorage.setItem("extracted-skills", JSON.stringify(extractedSkills))
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError)
        // Fallback to mock data if API fails
        const mockSkills = [
          {
            category: "Web Development",
            skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js"]
          },
          {
            category: "Database Systems", 
            skills: ["PostgreSQL", "MongoDB", "Redis"]
          },
          {
            category: "Programming Languages",
            skills: ["Python", "TypeScript", "Java"]
          }
        ]
        
        const mockProfile = {
          name: "Demo User",
          email: "demo@example.com",
          profile: {
            technical_skills: mockSkills
          }
        }
        
        localStorage.setItem("extracted-skills", JSON.stringify(mockSkills))
        localStorage.setItem("profile-data", JSON.stringify(mockProfile))
      }

      router.push("/skills")
    } catch (error) {
      console.error('Error uploading resume:', error)
      setIsUploading(false)
      // You might want to show an error message to the user here
    }
  }

  return (
    <div className="min-h-screen skillmap-bg">
      {/* Header */}
      <header className="skillmap-header text-white animate-fadeInDown">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              <Menu className="h-5 w-5 transition-transform duration-300 hover:rotate-90" />
              <span className="ml-2 text-sm">explore</span>
            </Button>
          </div>

          <Link href="/" className="text-2xl font-bold hover:scale-105 transition-transform duration-300">
            skillMap
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <User className="h-5 w-5" />
            <span className="ml-2 text-sm">login</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card
          className={`shadow-lg border-0 card-hover transition-all duration-1000 ${isLoaded ? "animate-scaleIn" : "opacity-0 scale-90"}`}
        >
          <CardHeader className="text-center animate-fadeInUp">
            <CardTitle className="text-3xl font-bold text-gray-900">Upload Your Resume</CardTitle>
            <p className="text-gray-600 mt-2 animate-fadeInUp animate-delay-200">
              Let our AI analyze your resume and extract your skills automatically
            </p>
          </CardHeader>
          <CardContent className="space-y-8 animate-fadeInUp animate-delay-300">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 cursor-pointer hover-lift ${
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
                className={`h-16 w-16 mx-auto mb-4 transition-all duration-300 ${
                  dragActive ? "text-blue-500 scale-110" : file ? "text-green-500" : "text-gray-400 hover:text-blue-500"
                }`}
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-2 transition-all duration-300">
                {file ? file.name : dragActive ? "Drop your resume here" : "Drop your resume here"}
              </h3>
              <p className="text-gray-600 mb-4 transition-all duration-300">
                {file ? "File selected. Click upload to continue." : "or click to browse files"}
              </p>
              <p className="text-sm text-gray-500">PDF files only, max 10MB</p>
            </div>

            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />

            {/* File Info */}
            {file && (
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg animate-slideInLeft hover-lift">
                <FileText className="h-8 w-8 text-blue-600 animate-bounce-slow" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 animate-fadeInUp animate-delay-400">
              <Button variant="outline" asChild className="hover-lift bg-transparent">
                <Link href="/">
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
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing<span className="loading-dots"></span>
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
              <div className="text-center p-6 bg-blue-50 rounded-lg animate-scaleIn">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-blue-800 font-medium animate-pulse-slow">
                  Analyzing your resume<span className="loading-dots"></span>
                </p>
                <p className="text-blue-600 text-sm mt-1">This may take a few moments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
