'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Users, 
  Ticket, 
  Calendar,
  Bell,
  TrendingUp,
  Activity,
  AlertCircle,
  Play,
  Plus,
  History,
  Settings,
  BarChart3,
  Target,
  Timer,
  Coffee,
  Navigation
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, startOfDay, endOfDay, isToday, subDays } from 'date-fns';

interface TodayAttendance {
  $id: string;
  status: 'checked_in' | 'checked_out' | 'absent';
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
}

interface PendingVisit {
  $id: string;
  customerName: string;
  visitType: string;
  scheduledTime: string;
  status: 'pending' | 'in_progress' | 'completed';
  location?: string;
}

interface PendingTicket {
  $id: string;
  customerName: string;
  subject: string;
  priority: 'low' | 'high';
  status: 'pending' | 'open' | 'escalate';
  createdAt: string;
}

interface Notification {
  $id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: 'attendance' | 'visit' | 'ticket';
}

interface DashboardStats {
  visitsToday: number;
  visitsThisWeek: number;
  ticketsResolved: number;
  pendingTickets: number;
  averageRating: number;
  totalHoursToday: number;
  totalHoursThisWeek: number;
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [pendingVisits, setPendingVisits] = useState<PendingVisit[]>([]);
  const [pendingTickets, setPendingTickets] = useState<PendingTicket[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    visitsToday: 0,
    visitsThisWeek: 0,
    ticketsResolved: 0,
    pendingTickets: 0,
    averageRating: 0,
    totalHoursToday: 0,
    totalHoursThisWeek: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      // Update current time every second
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [
        attendanceRes,
        visitsRes,
        ticketsRes,
        notificationsRes,
        statsRes
      ] = await Promise.all([
        fetch('/api/attendance/today'),
        fetch('/api/visits/pending'),
        fetch('/api/tickets/pending'),
        fetch('/api/notifications'),
        fetch('/api/dashboard/stats')
      ]);

      const attendance = attendanceRes.ok ? await attendanceRes.json() : null;
      const visits = visitsRes.ok ? await visitsRes.json() : [];
      const tickets = ticketsRes.ok ? await ticketsRes.json() : [];
      const notificationsData = notificationsRes.ok ? await notificationsRes.json() : [];
      const statsData = statsRes.ok ? await statsRes.json() : {};

      setTodayAttendance(attendance);
      setPendingVisits(visits);
      setPendingTickets(tickets);
      setNotifications(notificationsData);
      setStats(statsData);
      
      const unread = notificationsData.filter((n: Notification) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheckIn = async () => {
    try {
      const response = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: { lat: 40.7128, lng: -74.0060, address: 'Current Location' },
          deviceDetails: { platform: navigator.platform, isOnline: navigator.onLine }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTodayAttendance(data);
        toast({
          title: 'Check-In Successful',
          description: `Checked in at ${format(new Date(), 'h:mm a')}`,
        });
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      toast({
        title: 'Check-In Failed',
        description: 'Failed to check in',
        variant: 'destructive',
      });
    }
  };

  const handleQuickCheckOut = async () => {
    try {
      const response = await fetch('/api/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: { lat: 40.7128, lng: -74.0060, address: 'Current Location' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTodayAttendance(data);
        toast({
          title: 'Check-Out Successful',
          description: `Checked out at ${format(new Date(), 'h:mm a')}`,
        });
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      toast({
        title: 'Check-Out Failed',
        description: 'Failed to check out',
        variant: 'destructive',
      });
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
      setNotifications(prev => 
        prev.map(n => n.$id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.$id);
    
    // Navigate based on notification type
    switch (notification.relatedType) {
      case 'attendance':
        router.push('/employee/attendance');
        break;
      case 'visit':
        router.push(`/employee/visits/${notification.relatedId}`);
        break;
      case 'ticket':
        router.push(`/employee/tickets`);
        break;
      default:
        // Handle general notifications
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.name || 'Employee'} • {format(currentTime, 'EEEE, MMMM d, h:mm a')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/employee/attendance')}>
                <History className="h-4 w-4 mr-2" />
                Attendance
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/employee/profile')}>
                <Settings className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <div className="relative">
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Today's Attendance Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  todayAttendance?.status === 'checked_in' ? 'bg-green-100' :
                  todayAttendance?.status === 'checked_out' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {todayAttendance?.status === 'checked_in' ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : todayAttendance?.status === 'checked_out' ? (
                    <XCircle className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Clock className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium">
                    {todayAttendance?.status === 'checked_in' ? 'Checked In' :
                     todayAttendance?.status === 'checked_out' ? 'Completed' :
                     'Not Checked In'}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Check-In</p>
                <p className="font-medium">
                  {todayAttendance?.checkInTime ? 
                    format(new Date(todayAttendance.checkInTime), 'h:mm a') : 
                    '---'
                  }
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Check-Out</p>
                <p className="font-medium">
                  {todayAttendance?.checkOutTime ? 
                    format(new Date(todayAttendance.checkOutTime), 'h:mm a') : 
                    '---'
                  }
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="font-medium">
                  {todayAttendance?.totalHours ? 
                    `${todayAttendance.totalHours.toFixed(2)} hrs` : 
                    '0.00 hrs'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={handleQuickCheckIn}
                disabled={todayAttendance?.status === 'checked_in'}
                className="h-20 flex flex-col gap-2"
                variant={todayAttendance?.status === 'checked_in' ? 'secondary' : 'default'}
              >
                <CheckCircle className="h-6 w-6" />
                <span>Check In</span>
              </Button>
              
              <Button
                onClick={handleQuickCheckOut}
                disabled={todayAttendance?.status !== 'checked_in'}
                className="h-20 flex flex-col gap-2"
                variant="outline"
              >
                <XCircle className="h-6 w-6" />
                <span>Check Out</span>
              </Button>
              
              <Button
                onClick={() => router.push('/employee/visits/create')}
                className="h-20 flex flex-col gap-2"
                variant="outline"
              >
                <Plus className="h-6 w-6" />
                <span>New Visit</span>
              </Button>
              
              <Button
                onClick={() => router.push('/employee/tickets/create')}
                className="h-20 flex flex-col gap-2"
                variant="outline"
              >
                <Ticket className="h-6 w-6" />
                <span>Create Ticket</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Visits / Tasks */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Today's Visits & Tasks
                </span>
                <Button variant="outline" size="sm" onClick={() => router.push('/employee/visits')}>
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingVisits.length === 0 && pendingTickets.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No pending visits or tasks for today</p>
                  </div>
                ) : (
                  <>
                    {pendingVisits.slice(0, 3).map((visit) => (
                      <div
                        key={visit.$id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/employee/visits/${visit.$id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            visit.status === 'pending' ? 'bg-yellow-500' :
                            visit.status === 'in_progress' ? 'bg-blue-500' :
                            'bg-green-500'
                          }`}></div>
                          <div>
                            <p className="font-medium">{visit.customerName}</p>
                            <p className="text-sm text-gray-600">{visit.visitType}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(visit.scheduledTime), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          visit.status === 'pending' ? 'secondary' :
                          visit.status === 'in_progress' ? 'default' :
                          'outline'
                        }>
                          {visit.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                    
                    {pendingTickets.slice(0, 2).map((ticket) => (
                      <div
                        key={ticket.$id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push('/employee/tickets')}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            ticket.priority === 'high' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></div>
                          <div>
                            <p className="font-medium">{ticket.customerName}</p>
                            <p className="text-sm text-gray-600">{ticket.subject}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(ticket.createdAt), 'MMM d')}
                            </p>
                          </div>
                        </div>
                        <Badge variant={ticket.priority === 'high' ? 'destructive' : 'secondary'}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                </span>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No new notifications</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.$id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          notification.type === 'error' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {format(new Date(notification.createdAt), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mini Analytics / KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Visits Today</p>
                  <p className="text-2xl font-bold">{stats.visitsToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold">{stats.visitsThisWeek}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending Tickets</p>
                  <p className="text-2xl font-bold">{stats.pendingTickets}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Hours Today</p>
                  <p className="text-2xl font-bold">{stats.totalHoursToday.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Daily Goal Progress</span>
                  <span className="text-sm text-gray-600">75%</span>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">3 of 4 visits completed today</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Weekly Target</span>
                  <span className="text-sm text-gray-600">60%</span>
                </div>
                <Progress value={60} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">18 of 30 weekly target</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Customer Rating</span>
                  <span className="text-sm text-gray-600">4.8/5.0</span>
                </div>
                <Progress value={96} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">Based on 24 reviews this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}