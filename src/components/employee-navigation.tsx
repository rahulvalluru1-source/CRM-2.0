"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, Home, Ticket, MapPin, Calendar, User, Bell, Settings } from "lucide-react"

export function EmployeeNavigation() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/employee/dashboard" },
    { icon: Ticket, label: "My Tickets", href: "/employee/tickets" },
    { icon: MapPin, label: "Visits", href: "/employee/visits" },
    { icon: Calendar, label: "Attendance", href: "/employee/attendance" },
    { icon: User, label: "Profile", href: "/employee/profile" },
    { icon: Bell, label: "Notifications", href: "/employee/notifications" },
    { icon: Settings, label: "Settings", href: "/employee/settings" },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">CRM Employee</h1>
            <div className="hidden md:flex space-x-4">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(item.href)}
                  className="flex items-center space-x-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {session?.user.name}
              </span>
              <Badge variant="secondary">Employee</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}