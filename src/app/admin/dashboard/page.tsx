"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminNavigation } from "@/components/admin-navigation"
import { Users, Ticket, Calendar, MapPin, AlertTriangle, TrendingUp } from "lucide-react"
import LocationTracker from "@/components/location-tracker"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<{
    summary: {
      totalEmployees: number;
      activeEmployees: number;
      todayVisits: number;
      pendingAlerts: number;
      visitsChange: number;
      employeesChange: number;
      activeRate: number;
    };
    recentActivity: Array<{
      id: string;
      employee: {
        id: string;
        name: string;
        avatar: string | null;
      };
      customer: string;
      subject: string;
      priority: string;
      timestamp: string;
      status: string;
    }>;
    latestAlerts: Array<{
      id: string;
      type: string;
      message: string;
      severity: string;
      timestamp: string;
      employee: {
        id: string;
        name: string;
      } | null;
    }>;
    employeeStatusBreakdown: {
      active: number;
      inactive: number;
    };
    attendanceMetrics: {
      checkedInToday: number;
      checkedOutToday: number;
      lateCheckIns: number;
      totalExpected: number;
    };
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    if (session.user.role !== "ADMIN") {
      router.push("/login")
      return
    }

    // Fetch dashboard stats
    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/dashboard')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      setDashboardData(data)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      setDashboardData(null)
    } finally {
      setIsLoading(false)
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
      <AdminNavigation />
      
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session?.user.name}
              </span>
              <Badge variant="secondary">Admin</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardData?.summary.totalEmployees || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData ? `${dashboardData.summary.employeesChange > 0 ? '+' : ''}${dashboardData.summary.employeesChange}% from last month` : 'No change'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardData?.summary.activeEmployees || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData ? `${(dashboardData.summary.activeRate * 100).toFixed(1)}% activity rate` : 'No data'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checked In Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardData?.attendanceMetrics.checkedInToday || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    out of {dashboardData?.attendanceMetrics.totalExpected || 0} expected
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checked Out Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardData?.attendanceMetrics.checkedOutToday || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    employees checked out today
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visits Today</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardData?.summary.todayVisits || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData ? `${dashboardData.summary.visitsChange > 0 ? '+' : ''}${dashboardData.summary.visitsChange} from yesterday` : 'No change'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-destructive">{dashboardData?.summary.pendingAlerts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    alerts need attention
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => router.push("/admin/employees")}
                >
                  <Users className="h-6 w-6" />
                  <span>Manage Employees</span>
                </Button>
                <Button 
                  variant={dashboardData?.summary?.pendingAlerts && dashboardData.summary.pendingAlerts > 0 ? "destructive" : "outline"}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => router.push("/admin/alerts")}
                >
                  <AlertTriangle className="h-6 w-6" />
                  <span>View Alerts</span>
                  {dashboardData?.summary?.pendingAlerts && dashboardData.summary.pendingAlerts > 0 && (
                    <Badge variant="secondary">{dashboardData.summary.pendingAlerts} pending</Badge>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => router.push("/admin/attendance")}
                >
                  <Calendar className="h-6 w-6" />
                  <span>Attendance Report</span>
                  {dashboardData?.attendanceMetrics?.lateCheckIns && dashboardData.attendanceMetrics.lateCheckIns > 0 && (
                    <Badge variant="secondary">{dashboardData.attendanceMetrics.lateCheckIns} late today</Badge>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => router.push("/admin/visits")}
                >
                  <MapPin className="h-6 w-6" />
                  <span>Field Visits</span>
                  {dashboardData?.summary?.todayVisits && dashboardData.summary.todayVisits > 0 && (
                    <Badge variant="secondary">{dashboardData.summary.todayVisits} today</Badge>
                  )}
                </Button>
              </div>
              
              {dashboardData?.latestAlerts && dashboardData.latestAlerts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Latest Alerts</h4>
                  <div className="space-y-2">
                    {dashboardData.latestAlerts.slice(0, 3).map(alert => (
                      <div key={alert.id} className="flex items-center justify-between p-2 rounded-lg border bg-background">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            alert.severity === 'high' ? 'bg-red-500' :
                            alert.severity === 'medium' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium">{alert.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {alert.employee?.name || 'System'} • {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          alert.severity === 'high' ? 'destructive' :
                          alert.severity === 'medium' ? 'secondary' :
                          'outline'
                        }>
                          {alert.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Map</CardTitle>
              <CardDescription>
                Real-time employee locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationTracker height="300px" />
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/admin/map")}
                >
                  View Full Map
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest system activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : dashboardData?.recentActivity.length ? (
                dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.priority === 'high' ? 'bg-red-500' :
                      activity.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.subject}</p>
                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <span>{activity.employee.name}</span>
                        <span>•</span>
                        <span>{activity.customer}</span>
                        <span>•</span>
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <Badge variant={
                      activity.status === 'completed' ? 'default' :
                      activity.status === 'pending' ? 'secondary' :
                      'outline'
                    }>
                      {activity.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}