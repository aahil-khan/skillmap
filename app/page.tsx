"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Menu, User, Upload, Users, Target, ArrowRight, X } from "lucide-react"
import Navbar from "@/components/Navbar"

export default function HomePage() {
  const [showExploreMenu, setShowExploreMenu] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleTrySkillMap = async () => {
    // Check if user is authenticated using Supabase
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      // User is authenticated, check if they have profile data
      const profileData = localStorage.getItem('profile-data')
      if (profileData) {
        // User has already uploaded a resume, go to dashboard
        window.location.href = '/dashboard'
      } else {
        // User is authenticated but hasn't uploaded resume, go to upload
        window.location.href = '/upload'
      }
    } else {
      // User is not authenticated, redirect to auth
      window.location.href = '/auth'
    }
  }

  return (
    <div className="min-h-screen skillmap-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div
          className={`container mx-auto text-center max-w-4xl transition-all duration-1000 ${isLoaded ? "animate-fadeInUp" : "opacity-0"}`}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fadeInUp animate-delay-200">
            Map your skills.{" "}
            <span className="text-blue-600 hover:scale-105 inline-block transition-transform duration-300">
              Bridge your gaps.
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fadeInUp animate-delay-300">
            Get personalized insights into your skill gaps and actionable learning recommendations tailored for students
            and early-career developers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp animate-delay-400">
            <Button onClick={handleTrySkillMap} size="lg" className="skillmap-button text-white text-lg px-8 hover-lift">
              Try SkillMap{" "}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose SkillMap?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides personalized learning paths based on your current skills and goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover animate-slideInLeft">
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4 hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold mb-3">Personalized Analysis</h3>
                <p className="text-gray-600">
                  AI-powered skill gap detection based on your current abilities and learning goals.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover animate-slideInLeft animate-delay-200">
              <CardContent className="p-8 text-center">
                <Upload className="h-12 w-12 text-green-600 mx-auto mb-4 hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold mb-3">Smart Recommendations</h3>
                <p className="text-gray-600">
                  Get actionable learning suggestions and project ideas tailored to your skill level.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover animate-slideInLeft animate-delay-400">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4 hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold mb-3">Built for Learners</h3>
                <p className="text-gray-600">
                  Designed specifically for students, bootcamp learners, and self-taught developers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 skillmap-bg">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How SkillMap Works</h2>
            <p className="text-xl text-gray-600">Simple steps to discover your learning path</p>
          </div>

          <div className="space-y-12">
            {[
              {
                number: 1,
                title: "Upload Your Resume",
                description: "Upload your resume and let our AI extract your skills automatically.",
                color: "bg-blue-600",
              },
              {
                number: 2,
                title: "Set Your Skill Levels",
                description: "Review and adjust your skill proficiency levels from beginner to advanced.",
                color: "bg-green-600",
              },
              {
                number: 3,
                title: "Tell Us Your Intent",
                description:
                  'Share what you want to learn - like "I want to learn DSA" or "I want to become a full-stack developer".',
                color: "bg-purple-600",
              },
              {
                number: 4,
                title: "Get Focused Recommendations",
                description: "Receive a personalized roadmap showing exactly which skills to focus on next.",
                color: "bg-orange-600",
              },
            ].map((step, index) => (
              <div
                key={step.number}
                className={`flex items-start space-x-6 animate-slideInRight animate-delay-${(index + 1) * 100}`}
              >
                <div
                  className={`flex-shrink-0 w-12 h-12 ${step.color} text-white rounded-full flex items-center justify-center font-bold text-lg hover:scale-110 transition-transform duration-300`}
                >
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 skillmap-header text-white animate-fadeInUp">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Map Your Skills?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of developers who've accelerated their learning with SkillMap.
          </p>
          <Button onClick={handleTrySkillMap} size="lg" variant="secondary" className="text-lg px-8 hover-lift hover:scale-105">
            Start Your Journey{" "}
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 animate-fadeIn">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4 hover:scale-105 transition-transform duration-300">
            <div className="text-xl font-bold">skillMap</div>
          </div>
          <p className="text-gray-400">Empowering developers to bridge their skill gaps with AI-powered insights.</p>
        </div>
      </footer>
    </div>
  )
}
