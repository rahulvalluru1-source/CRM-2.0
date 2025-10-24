'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon,
  TrendingUp,
  BarChart3,
  Filter,
  Download,
  History
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, isToday, isSameMonth, eachDayOfInterval } from 'date-fns';

interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  checkInLocation?: string;
  checkOutLocation?: string;
  status: 'present' | 'absent' | 'half_day';
}

export default function EmployeeAttendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      fetchAttendanceRecords();
    }
  }, [user, currentMonth]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);
      
      const response = await fetch(`/api/employee/attendance?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to load attendance records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendanceRecords.find(record => record.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'half_day': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4" />;
      case 'absent': return <XCircle className="h-4 w-4" />;
      case 'half_day': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const calculateStats = () => {
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const halfDay = attendanceRecords.filter(r => r.status === 'half_day').length;
    const totalHours = attendanceRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    
    return { present, absent, halfDay, totalHours };
  };

  const stats = calculateStats();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
              <p className="text-sm text-gray-600">View your attendance history and statistics</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/employee')}>
                Back to Dashboard
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Days Present</p>
                  <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Days Absent</p>
                  <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Half Days</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.halfDay}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalHours.toFixed(1)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Attendance Calendar - {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md border"
                modifiers={{
                  present: (date) => {
                    const record = getAttendanceForDate(date);
                    return record?.status === 'present';
                  },
                  absent: (date) => {
                    const record = getAttendanceForDate(date);
                    return record?.status === 'absent';
                  },
                  halfDay: (date) => {
                    const record = getAttendanceForDate(date);
                    return record?.status === 'half_day';
                  }
                }}
                modifiersStyles={{
                  present: { backgroundColor: '#86efac', color: '#166534' },
                  absent: { backgroundColor: '#fca5a5', color: '#991b1b' },
                  halfDay: { backgroundColor: '#fde047', color: '#713f12' }
                }}
              />
            </CardContent>
          </Card>

          {/* Selected Date Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                {format(selectedDate, 'MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const record = getAttendanceForDate(selectedDate);
                if (!record) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No attendance record for this date</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    {record.checkInTime && (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Check In</p>
                          <p className="font-medium">{format(new Date(record.checkInTime), 'h:mm a')}</p>
                        </div>
                      </div>
                    )}
                    
                    {record.checkOutTime && (
                      <div className="flex items-center gap-3">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-600">Check Out</p>
                          <p className="font-medium">{format(new Date(record.checkOutTime), 'h:mm a')}</p>
                        </div>
                      </div>
                    )}
                    
                    {record.totalHours && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Total Hours</p>
                          <p className="font-medium">{record.totalHours.toFixed(2)} hrs</p>
                        </div>
                      </div>
                    )}
                    
                    {record.checkInLocation && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600">Check In Location</p>
                          <p className="text-sm">{record.checkInLocation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Recent Attendance */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent Attendance
              </span>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendanceRecords.slice(-10).reverse().map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      <span className="font-medium">{format(new Date(record.date), 'MMM d, yyyy')}</span>
                    </div>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-right">
                    {record.checkInTime && (
                      <p className="text-sm">In: {format(new Date(record.checkInTime), 'h:mm a')}</p>
                    )}
                    {record.checkOutTime && (
                      <p className="text-sm">Out: {format(new Date(record.checkOutTime), 'h:mm a')}</p>
                    )}
                    {record.totalHours && (
                      <p className="text-sm font-medium">{record.totalHours.toFixed(2)} hrs</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}