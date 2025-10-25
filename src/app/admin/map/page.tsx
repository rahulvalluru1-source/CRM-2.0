"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import LocationTracker from "@/components/location-tracker"
import { AdminNavigation } from "@/components/admin-navigation"

export default function AdminMap() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Employee Locations</h1>
            <p className="mt-1 text-sm text-gray-500">Real-time tracking of employee locations</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LocationTracker showFullMap={true} />
      </main>
    </div>
  )
}