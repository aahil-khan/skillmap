import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useAuthRedirect() {
  const router = useRouter()
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sb-jwt') : null
    if (!token) {
      router.replace("/auth")
    }
  }, [router])
}
