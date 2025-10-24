"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    // Redirect based on user role
    const role = session.user.role
    switch (role) {
      case "ADMIN":
        router.push("/admin/dashboard")
        break
      case "EMPLOYEE":
        router.push("/employee/dashboard")
        break
      default:
        router.push("/login") // Redirect to login for unknown roles
    }
  }, [session, status, router])

  if (status === "loading" || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return null
}