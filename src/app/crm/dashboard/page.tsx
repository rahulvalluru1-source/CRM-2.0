"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ticket, Users, TrendingUp, Phone, MessageSquare, Star } from "lucide-react"

export default function CRMDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [crmStats, setCrmStats] = useState({
    activeTickets: 15,
    newLeads: 8,
    callsToday: 12,
    customerSatisfaction: 4.3,
    conversionRate: 65,
    followUps: 5
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session || (session.user.role !== "SUPPORT" && session.user.role !== "SALES")) {
      router.push("/login")
      return
    }

    // Fetch CRM stats
    fetchCRMStats()
  }, [session, status, router])

  const fetchCRMStats = async () => {
    try {
      // This will be implemented with actual API calls
      // Mock data for now
    } catch (error) {
      console.error("Failed to fetch CRM stats:", error)
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session?.user.name}
              </span>
              <Badge variant="secondary">
                {session?.user.role === "SUPPORT" ? "Support" : "Sales"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CRM Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crmStats.activeTickets}</div>
              <p className="text-xs text-muted-foreground">
                +3 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crmStats.newLeads}</div>
              <p className="text-xs text-muted-foreground">
                +2 this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crmStats.callsToday}</div>
              <p className="text-xs text-muted-foreground">
                Customer interactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crmStats.customerSatisfaction}</div>
              <p className="text-xs text-muted-foreground">
                Average rating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crmStats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                +5% improvement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{crmStats.followUps}</div>
              <p className="text-xs text-muted-foreground">
                Pending today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common CRM tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push("/tickets/create")}
              >
                <Ticket className="h-6 w-6" />
                <span>Create Ticket</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push("/customers/create")}
              >
                <Users className="h-6 w-6" />
                <span>Add Customer</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push("/leads")}
              >
                <TrendingUp className="h-6 w-6" />
                <span>View Leads</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => router.push("/tickets")}
              >
                <MessageSquare className="h-6 w-6" />
                <span>All Tickets</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>
                Latest support tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Login Issue</p>
                    <p className="text-xs text-gray-500">Customer: John Doe</p>
                  </div>
                  <Badge variant="destructive">High</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Feature Request</p>
                    <p className="text-xs text-gray-500">Customer: Jane Smith</p>
                  </div>
                  <Badge variant="secondary">Low</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Billing Question</p>
                    <p className="text-xs text-gray-500">Customer: Bob Johnson</p>
                  </div>
                  <Badge variant="outline">Medium</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Leads */}
          <Card>
            <CardHeader>
              <CardTitle>New Leads</CardTitle>
              <CardDescription>
                Recent sales leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">ABC Corporation</p>
                    <p className="text-xs text-gray-500">Contact: Sarah Lee</p>
                  </div>
                  <Badge variant="secondary">Hot</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">XYZ Industries</p>
                    <p className="text-xs text-gray-500">Contact: Mike Chen</p>
                  </div>
                  <Badge variant="outline">Warm</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">StartUp Inc</p>
                    <p className="text-xs text-gray-500">Contact: Alex Kim</p>
                  </div>
                  <Badge variant="secondary">Cold</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Your CRM performance this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">45</div>
                <p className="text-sm text-gray-600">Tickets Resolved</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <p className="text-sm text-gray-600">New Customers</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">89%</div>
                <p className="text-sm text-gray-600">Response Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">4.5</div>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}