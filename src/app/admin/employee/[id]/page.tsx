'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Building, 
  Award,
  TrendingUp,
  Activity,
  FileText,
  Map,
  AlertCircle,
  CheckCircle,
  Camera,
  Upload,
  Key,
  Shield,
  Smartphone
} from 'lucide-react'

interface EmployeeProfile {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  designation: string
  employeeId: string
  avatar?: string
  signature?: string
  address?: string
  city?: string
  region?: string
  joiningDate: string
  isActive: boolean
  lastLogin?: string
  lastActive?: string
}

interface ActivityLog {
  id: string
  type: 'check_in' | 'check_out' | 'visit' | 'location_update' | 'alert'
  message: string
  timestamp: string
  details?: any
}

interface AttendanceRecord {
  id: string
  date: string
  checkInTime: string
  checkOutTime?: string
  totalHours: number
  checkInLocation?: string
  checkOutLocation?: string
}

interface VisitRecord {
  id: string
  customerName: string
  subject: string
  timestamp: string
  rating?: number
  status: string
  location?: string
  selfieUrl?: string
  signatureUrl?: string
}

export default function EmployeeProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedEmployee, setEditedEmployee] = useState<EmployeeProfile | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data for demonstration
  const mockEmployee: EmployeeProfile = {
    id: params.id as string,
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1234567890',
    role: 'EMPLOYEE',
    department: 'Sales',
    designation: 'Field Sales Executive',
    employeeId: 'EMP001',
    avatar: '/avatars/john.jpg',
    signature: '/signatures/john.png',
    address: '123 Main St, Apt 4B',
    city: 'New York',
    region: 'NY',
    joiningDate: '2023-01-15',
    isActive: true,
    lastLogin: '2024-01-20T09:30:00Z',
    lastActive: '2024-01-20T14:45:00Z'
  }

  const mockActivityLogs: ActivityLog[] = [
    {
      id: '1',
      type: 'check_in',
      message: 'Checked in at Office',
      timestamp: '2024-01-20T09:30:00Z',
      details: { location: 'Office Headquarters' }
    },
    {
      id: '2',
      type: 'visit',
      message: 'Completed visit to Acme Corp',
      timestamp: '2024-01-20T11:15:00Z',
      details: { customer: 'Acme Corp', rating: 5 }
    },
    {
      id: '3',
      type: 'location_update',
      message: 'Location updated',
      timestamp: '2024-01-20T13:30:00Z',
      details: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: '4',
      type: 'alert',
      message: 'Idle alert triggered',
      timestamp: '2024-01-20T14:00:00Z',
      details: { duration: '30 minutes' }
    },
    {
      id: '5',
      type: 'check_out',
      message: 'Checked out from Office',
      timestamp: '2024-01-20T17:30:00Z',
      details: { location: 'Office Headquarters' }
    }
  ]

  const mockAttendance: AttendanceRecord[] = [
    {
      id: '1',
      date: '2024-01-20',
      checkInTime: '09:30:00',
      checkOutTime: '17:30:00',
      totalHours: 8.0,
      checkInLocation: 'Office Headquarters',
      checkOutLocation: 'Office Headquarters'
    },
    {
      id: '2',
      date: '2024-01-19',
      checkInTime: '09:15:00',
      checkOutTime: '17:45:00',
      totalHours: 8.5,
      checkInLocation: 'Office Headquarters',
      checkOutLocation: 'Client Site'
    },
    {
      id: '3',
      date: '2024-01-18',
      checkInTime: '09:45:00',
      checkOutTime: '17:30:00',
      totalHours: 7.75,
      checkInLocation: 'Remote',
      checkOutLocation: 'Remote'
    }
  ]

  const mockVisits: VisitRecord[] = [
    {
      id: '1',
      customerName: 'Acme Corp',
      subject: 'Product Demo',
      timestamp: '2024-01-20T11:15:00Z',
      rating: 5,
      status: 'completed',
      location: '123 Business Ave',
      selfieUrl: '/selfies/acme-visit.jpg',
      signatureUrl: '/signatures/acme-customer.png'
    },
    {
      id: '2',
      customerName: 'Tech Solutions',
      subject: 'Support Visit',
      timestamp: '2024-01-19T14:30:00Z',
      rating: 4,
      status: 'completed',
      location: '456 Tech Park'
    },
    {
      id: '3',
      customerName: 'Global Industries',
      subject: 'Installation',
      timestamp: '2024-01-18T10:00:00Z',
      rating: null,
      status: 'in-progress',
      location: '789 Industrial Blvd'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEmployee(mockEmployee)
      setEditedEmployee(mockEmployee)
      setIsLoading(false)
    }, 1000)
  }, [params.id])

  const handleEdit = () => {
    setIsEditing(true)
    setEditedEmployee(employee)
  }

  const handleSave = async () => {
    if (!editedEmployee) return
    
    // Simulate API call to update employee
    setIsLoading(true)
    setTimeout(() => {
      setEmployee(editedEmployee)
      setIsEditing(false)
      setIsLoading(false)
    }, 1000)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedEmployee(employee)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'check_in': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'check_out': return <X className="h-4 w-4 text-red-500" />
      case 'visit': return <FileText className="h-4 w-4 text-blue-500" />
      case 'location_update': return <MapPin className="h-4 w-4 text-purple-500" />
      case 'alert': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading employee profile...</p>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Employee not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Employee Profile
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel} size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={employee.avatar} />
                  <AvatarFallback className="text-2xl">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? (
                      <Input
                        value={editedEmployee?.name || ''}
                        onChange={(e) => setEditedEmployee(prev => 
                          prev ? { ...prev, name: e.target.value } : null
                        )}
                        className="text-2xl font-bold"
                      />
                    ) : (
                      employee.name
                    )}
                  </h2>
                  <Badge variant={employee.isActive ? "default" : "secondary"}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{employee.designation}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>{employee.department}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4" />
                    <span>ID: {employee.employeeId}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined: {new Date(employee.joiningDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="visits">Visits</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editedEmployee?.email || ''}
                          onChange={(e) => setEditedEmployee(prev => 
                            prev ? { ...prev, email: e.target.value } : null
                          )}
                          className="mt-1"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{employee.email}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                      {isEditing ? (
                        <Input
                          value={editedEmployee?.phone || ''}
                          onChange={(e) => setEditedEmployee(prev => 
                            prev ? { ...prev, phone: e.target.value } : null
                          )}
                          className="mt-1"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{employee.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                    {isEditing ? (
                      <Textarea
                        value={editedEmployee?.address || ''}
                        onChange={(e) => setEditedEmployee(prev => 
                          prev ? { ...prev, address: e.target.value } : null
                        )}
                        className="mt-1"
                        rows={2}
                      />
                    ) : (
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{employee.address || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                      {isEditing ? (
                        <Input
                          value={editedEmployee?.city || ''}
                          onChange={(e) => setEditedEmployee(prev => 
                            prev ? { ...prev, city: e.target.value } : null
                          )}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm mt-1">{employee.city || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Region</label>
                      {isEditing ? (
                        <Input
                          value={editedEmployee?.region || ''}
                          onChange={(e) => setEditedEmployee(prev => 
                            prev ? { ...prev, region: e.target.value } : null
                          )}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm mt-1">{employee.region || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Visits</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">4.8</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">156</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Hours Worked</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">98%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Attendance</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Last Login</span>
                      <span>{employee.lastLogin ? new Date(employee.lastLogin).toLocaleString() : 'Never'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Last Active</span>
                      <span>{employee.lastActive ? new Date(employee.lastActive).toLocaleString() : 'Never'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest activities and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivityLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="mt-1">
                        {getActivityIcon(log.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                        {log.details && (
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            {Object.entries(log.details).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>Check-in/check-out history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Check In</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Check Out</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Hours</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockAttendance.map((record) => (
                        <tr key={record.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 px-3 text-sm">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="py-2 px-3 text-sm">{record.checkInTime}</td>
                          <td className="py-2 px-3 text-sm">{record.checkOutTime || '-'}</td>
                          <td className="py-2 px-3 text-sm">{record.totalHours}h</td>
                          <td className="py-2 px-3 text-sm">{record.checkInLocation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visits Tab */}
          <TabsContent value="visits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visit History</CardTitle>
                <CardDescription>Customer visits and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockVisits.map((visit) => (
                    <div key={visit.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{visit.customerName}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{visit.subject}</p>
                        </div>
                        <Badge className={getStatusColor(visit.status)}>
                          {visit.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <span>{new Date(visit.timestamp).toLocaleString()}</span>
                        {visit.location && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{visit.location}</span>
                          </span>
                        )}
                        {visit.rating && (
                          <span className="flex items-center space-x-1">
                            <span>⭐</span>
                            <span>{visit.rating}</span>
                          </span>
                        )}
                      </div>
                      
                      {(visit.selfieUrl || visit.signatureUrl) && (
                        <div className="flex space-x-2">
                          {visit.selfieUrl && (
                            <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                              <Camera className="h-3 w-3" />
                              <span>Selfie</span>
                            </div>
                          )}
                          {visit.signatureUrl && (
                            <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                              <FileText className="h-3 w-3" />
                              <span>Signature</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                    {isEditing ? (
                      <Select
                        value={editedEmployee?.role || ''}
                        onValueChange={(value) => setEditedEmployee(prev => 
                          prev ? { ...prev, role: value } : null
                        )}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMPLOYEE">Employee</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm mt-1">{employee.role}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                    {isEditing ? (
                      <Input
                        value={editedEmployee?.department || ''}
                        onChange={(e) => setEditedEmployee(prev => 
                          prev ? { ...prev, department: e.target.value } : null
                        )}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm mt-1">{employee.department}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Designation</label>
                    {isEditing ? (
                      <Input
                        value={editedEmployee?.designation || ''}
                        onChange={(e) => setEditedEmployee(prev => 
                          prev ? { ...prev, designation: e.target.value } : null
                        )}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm mt-1">{employee.designation}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editedEmployee?.isActive || false}
                      onChange={(e) => setEditedEmployee(prev => 
                        prev ? { ...prev, isActive: e.target.checked } : null
                      )}
                      disabled={!isEditing}
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active Account
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Key className="h-4 w-4 mr-2" />
                    Reset Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Enable Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Manage Devices
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}