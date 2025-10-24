"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (session) {
      // Redirect based on user role
      const userRole = session.user?.role;
      if (userRole === 'ADMIN') {
        router.push("/admin");
      } else if (userRole === 'EMPLOYEE') {
        router.push("/employee");
      } else {
        // Fallback for other roles
        router.push("/dashboard");
      }
    } else {
      router.push("/login")
    }
  }, [session, status, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <div className="relative w-24 h-24 md:w-32 md:h-32">
        <img
          src="/logo.svg"
          alt="CRM System Logo"
          className="w-full h-full object-contain"
        />
      </div>
      <p className="text-lg text-muted-foreground">Loading...</p>
    </div>
  )
}