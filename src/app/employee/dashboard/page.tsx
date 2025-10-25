"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AttendanceTracker from "@/components/attendance-tracker"
import { Clock, MapPin, Ticket, Star, Calendar, CheckCircle, Bell, Settings, LogOut, User } from "lucide-react"
import { EmployeeNavigation } from "@/components/employee-navigation"

export default function EmployeeDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [todayStats, setTodayStats] = useState({
    checkInTime: null,
    checkOutTime: null,
    activeTickets: 0,
    visitsToday: 0,
    weeklyVisits: 0,
    ticketsClosed: 0,
    averageRating: 0
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "EMPLOYEE") {
      router.push("/login")
      return
    }

    // Fetch employee stats
    fetchEmployeeStats()
  }, [session, status, router])

  const fetchEmployeeStats = async () => {
    try {
      const [attendanceRes, ticketsRes, visitsRes] = await Promise.all([
        fetch('/api/employee/attendance/today'),
        fetch('/api/tickets/my-tickets'),
        fetch('/api/employee/visits/stats')
      ])

      const [attendance, tickets, visits] = await Promise.all([
        attendanceRes.json(),
        ticketsRes.json(),
        visitsRes.json()
      ])

      if (!attendanceRes.ok) throw new Error(attendance.error)
      if (!ticketsRes.ok) throw new Error(tickets.error)
      if (!visitsRes.ok) throw new Error(visits.error)

      setTodayStats({
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        activeTickets: tickets.active.length,
        visitsToday: visits.today,
        weeklyVisits: visits.weekly,
        ticketsClosed: tickets.closed.length,
        averageRating: visits.averageRating
      })
    } catch (error) {
      console.error("Failed to fetch employee stats:", error)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavigation />
      
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session?.user.name}
              </span>
              <Badge variant="secondary">Employee</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Attendance Tracker */}
          <div className="col-span-2">
            <AttendanceTracker />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.activeTickets}</div>
              <p className="text-xs text-muted-foreground">
                Assigned to you
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visits Today</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.visitsToday}</div>
              <p className="text-xs text-muted-foreground">
                Completed today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push("/employee/tickets/create")}
              >
                <Ticket className="h-6 w-6" />
                <span>Create Ticket</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push("/employee/visits/create")}
              >
                <MapPin className="h-6 w-6" />
                <span>Log Visit</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push("/employee/attendance/check-in")}
              >
                <Calendar className="h-6 w-6" />
                <span>Check In/Out</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push("/employee/profile")}
              >
                <User className="h-6 w-6" />
                <span>My Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Performance */}
          <Card>
            <CardHeader>
              <CardTitle>My Performance</CardTitle>
              <CardDescription>
                Your weekly metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Visits this week</span>
                <span className="text-2xl font-bold">{todayStats.weeklyVisits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tickets closed</span>
                <span className="text-2xl font-bold">{todayStats.ticketsClosed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average rating</span>
                <div className="flex items-center space-x-1">
                  <span className="text-2xl font-bold">{todayStats.averageRating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Your latest activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Visit completed</p>
                    <p className="text-xs text-gray-500">Customer ABC - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Ticket assigned</p>
                    <p className="text-xs text-gray-500">Ticket #12345 - 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Checked in</p>
                    <p className="text-xs text-gray-500">Today at 9:00 AM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Redirect Buttons */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>
              Navigate to different sections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push("/employee/tickets")}
              >
                View My Tickets
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/employee/attendance")}
              >
                View Attendance
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/employee/visits")}
              >
                View Visits
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/employee/notifications")}
              >
                Notifications
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/employee/settings")}
              >
                Settings
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push("/employee/profile")}
              >
                Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}