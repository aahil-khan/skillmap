"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Menu, User, Upload, Users, Target, ArrowRight, X, BookOpen } from "lucide-react"
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

      {/* Hero Section */}
      <motion.section
        className="py-20 px-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="container mx-auto text-center max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Map your skills.{' '}
            <motion.span
              className="text-blue-600 hover:scale-105 inline-block transition-transform duration-300"
              whileHover={{ scale: 1.08 }}
            >
              Bridge your gaps.
            </motion.span>
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Get personalized insights into your skill gaps and actionable learning recommendations tailored for students
            and early-career developers.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Button onClick={handleTrySkillMap} size="lg" className="skillmap-button text-white text-lg px-8 hover-lift">
              Try SkillMap{' '}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        id="features"
        className="py-20 px-4 bg-white"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="container mx-auto max-w-6xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Core Features That Power SkillMap</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides personalized learning paths based on your current skills and goals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[{
              icon: <Target className="h-10 w-10 text-blue-600 mx-auto mb-3 hover:scale-110 transition-transform duration-300" />, title: "AI-Powered Skill Analysis", desc: "Analyze resumes and code to automatically detect strengths and skill gaps using AI models."
            }, {
              icon: <BookOpen className="h-10 w-10 text-green-600 mx-auto mb-3 hover:scale-110 transition-transform duration-300" />, title: "Personalized Learning Roadmaps", desc: "Receive step-by-step, goal-oriented roadmaps personalized to your current level and targets."
            }, {
              icon: <Upload className="h-10 w-10 text-orange-600 mx-auto mb-3 hover:scale-110 transition-transform duration-300" />, title: "Smart Recommendations", desc: "Get curated courses, projects, and practice problems recommended based on your progress."
            }, {
              icon: <Users className="h-10 w-10 text-purple-600 mx-auto mb-3 hover:scale-110 transition-transform duration-300" />, title: "Peer & Mentor Matching", desc: "Find study partners, project collaborators, and mentors matched to your goals and schedule."
            }].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.15 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
                  <CardContent className="p-6 text-center">
                    {feature.icon}
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        id="how-it-works"
        className="py-20 px-4 skillmap-bg"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="container mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How SkillMap Works</h2>
            <p className="text-xl text-gray-600">Simple steps to discover your learning path</p>
          </motion.div>

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
              <motion.div
                key={step.number}
                className="flex items-start space-x-6"
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: 0.2 + index * 0.15 }}
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
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-4 skillmap-header text-white"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="container mx-auto text-center max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h2 className="text-3xl md:text-4xl font-bold mb-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}>
            Ready to Map Your Skills?
          </motion.h2>
          <motion.p className="text-xl mb-8 text-white/90" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}>
            Join thousands of developers who've accelerated their learning with SkillMap.
          </motion.p>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.5 }}>
            <Button onClick={handleTrySkillMap} size="lg" variant="secondary" className="text-lg px-8 hover-lift hover:scale-105">
              Start Your Journey{' '}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>

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
