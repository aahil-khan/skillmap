"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { PageErrorBoundary } from "@/components/GlobalErrorBoundary"

export default function ConfirmPageContent() {
  const [message, setMessage] = useState("Processing confirmation...")
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const handleConfirm = async () => {
      try {
        // consume session from URL (confirmation/magic link)
        const { data, error } = await supabase.auth.getSessionFromUrl()
        if (!mounted) return

        if (error) {
          console.error("getSessionFromUrl error:", error)
          setMessage("Confirmation failed. Please try signing in.")
          setTimeout(() => router.push("/auth"), 2500)
          return
        }

        const session = data?.session
        if (!session) {
          // no session returned - treat as confirmed but require sign in
          setMessage("Email confirmed. Please sign in.")
          setTimeout(() => router.push("/auth"), 2000)
          return
        }

        // store token and sync profile name
        localStorage.setItem("sb-jwt", session.access_token)

        try {
          const userId = session.user?.id
          if (userId) {
            const { data: profile } = await supabase.from("users").select("full_name").eq("id", userId).single()
            const name = profile?.full_name ?? session.user?.user_metadata?.full_name ?? ""
            if (name) localStorage.setItem("sb-user", name)
          }
        } catch (e) {
          console.warn("Failed to fetch user profile after confirmation:", e)
        }

        // check first-time flag in metadata
        const userMetadata = session.user?.user_metadata as any
        const isNew = userMetadata?.is_new === true || userMetadata?.is_new === "true"

        if (isNew) {
          // clear the is_new flag so next sign-ins go to dashboard
          try {
            await supabase.auth.updateUser({ data: { ...userMetadata, is_new: false } })
          } catch (e) {
            console.warn("Failed to clear is_new flag:", e)
          }
          router.push("/upload")
        } else {
          router.push("/dashboard")
        }
      } catch (err: any) {
        console.error("Unexpected confirmation error:", err)
        setMessage(`Unexpected error: ${err?.message ?? err}`)
        setTimeout(() => router.push("/auth"), 3000)
      }
    }

    handleConfirm()

    return () => {
      mounted = false
    }
  }, [router])

  return (
    <PageErrorBoundary>
      <div className="min-h-screen skillmap-bg">
        <Navbar />
        <div className="container mx-auto px-4 py-20 max-w-xl text-center">
          <h2 className="text-2xl font-semibold mb-4">Confirming your email</h2>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    </PageErrorBoundary>
  )
}
