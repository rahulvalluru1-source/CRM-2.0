'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Settings, 
  Shield, 
  Key, 
  Smartphone, 
  Bell, 
  Globe, 
  Lock,
  Eye,
  EyeOff,
  Save,
  Edit,
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  Users,
  FileText,
  Database,
  Cpu,
  HardDrive,
  Building
} from 'lucide-react'

interface AdminProfile {
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

interface SystemSettings {
  trackingFrequency: number
  idleDetectionTime: number
  notificationEmail: boolean
  notificationSMS: boolean
  notificationPush: boolean
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
}

interface SecurityLog {
  id: string
  action: string
  ip: string
  device: string
  location: string
  timestamp: string
  status: 'success' | 'failed'
}

export default function AdminProfilePage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [editedProfile, setEditedProfile] = useState<AdminProfile | null>(null)
  const [settings, setSettings] = useState<SystemSettings>({
    trackingFrequency: 5,
    idleDetectionTime: 15,
    notificationEmail: true,
    notificationSMS: false,
    notificationPush: true,
    theme: 'system',
    language: 'en',
    timezone: 'UTC'
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Mock data for demonstration
  const mockProfile: AdminProfile = {
    id: 'admin-1',
    name: 'System Administrator',
    email: 'admin@crm.com',
    phone: '+1234567890',
    role: 'ADMIN',
    department: 'IT',
    designation: 'System Admin',
    employeeId: 'ADMIN001',
    avatar: '/avatars/admin.jpg',
    signature: '/signatures/admin.png',
    address: '456 Admin Blvd, Suite 100',
    city: 'San Francisco',
    region: 'CA',
    joiningDate: '2023-01-01',
    isActive: true,
    lastLogin: '2024-01-20T08:30:00Z',
    lastActive: '2024-01-20T16:45:00Z'
  }

  const mockSecurityLogs: SecurityLog[] = [
    {
      id: '1',
      action: 'Login',
      ip: '192.168.1.100',
      device: 'Chrome on Windows',
      location: 'New York, US',
      timestamp: '2024-01-20T08:30:00Z',
      status: 'success'
    },
    {
      id: '2',
      action: 'Password Change',
      ip: '192.168.1.100',
      device: 'Chrome on Windows',
      location: 'New York, US',
      timestamp: '2024-01-19T14:20:00Z',
      status: 'success'
    },
    {
      id: '3',
      action: 'Login Attempt',
      ip: '192.168.1.101',
      device: 'Firefox on Mac',
      location: 'London, UK',
      timestamp: '2024-01-19T10:15:00Z',
      status: 'failed'
    },
    {
      id: '4',
      action: 'Settings Update',
      ip: '192.168.1.100',
      device: 'Chrome on Windows',
      location: 'New York, US',
      timestamp: '2024-01-18T16:45:00Z',
      status: 'success'
    }
  ]

  const systemStats = {
    totalUsers: 24,
    activeUsers: 18,
    totalVisits: 342,
    systemUptime: '99.9%',
    storageUsed: '45.2 GB',
    storageTotal: '100 GB',
    lastBackup: '2024-01-20T02:00:00Z'
  }

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProfile(mockProfile)
      setEditedProfile(mockProfile)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
    setEditedProfile(profile)
  }

  const handleSave = async () => {
    if (!editedProfile) return
    
    // Simulate API call to update profile
    setIsLoading(true)
    setTimeout(() => {
      setProfile(editedProfile)
      setIsEditing(false)
      setIsLoading(false)
    }, 1000)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedProfile(profile)
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    // Simulate API call to change password
    setIsLoading(true)
    setTimeout(() => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setIsLoading(false)
      alert('Password changed successfully')
    }, 1000)
  }

  const handleSettingsSave = async () => {
    // Simulate API call to save settings
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      alert('Settings saved successfully')
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Profile not found</p>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Profile
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
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-2xl">
                    {profile.name.split(' ').map(n => n[0]).join('')}
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
                        value={editedProfile?.name || ''}
                        onChange={(e) => setEditedProfile(prev => 
                          prev ? { ...prev, name: e.target.value } : null
                        )}
                        className="text-2xl font-bold"
                      />
                    ) : (
                      profile.name
                    )}
                  </h2>
                  <Badge variant="destructive">ADMIN</Badge>
                  <Badge variant={profile.isActive ? "default" : "secondary"}>
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{profile.designation}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>{profile.department}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>ID: {profile.employeeId}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined: {new Date(profile.joiningDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
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
                          value={editedProfile?.email || ''}
                          onChange={(e) => setEditedProfile(prev => 
                            prev ? { ...prev, email: e.target.value } : null
                          )}
                          className="mt-1"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{profile.email}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                      {isEditing ? (
                        <Input
                          value={editedProfile?.phone || ''}
                          onChange={(e) => setEditedProfile(prev => 
                            prev ? { ...prev, phone: e.target.value } : null
                          )}
                          className="mt-1"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 mt-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{profile.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                    {isEditing ? (
                      <Textarea
                        value={editedProfile?.address || ''}
                        onChange={(e) => setEditedProfile(prev => 
                          prev ? { ...prev, address: e.target.value } : null
                        )}
                        className="mt-1"
                        rows={2}
                      />
                    ) : (
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{profile.address || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                      {isEditing ? (
                        <Input
                          value={editedProfile?.city || ''}
                          onChange={(e) => setEditedProfile(prev => 
                            prev ? { ...prev, city: e.target.value } : null
                          )}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm mt-1">{profile.city || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Region</label>
                      {isEditing ? (
                        <Input
                          value={editedProfile?.region || ''}
                          onChange={(e) => setEditedProfile(prev => 
                            prev ? { ...prev, region: e.target.value } : null
                          )}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm mt-1">{profile.region || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {systemStats.totalUsers}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {systemStats.activeUsers}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {systemStats.totalVisits}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Visits</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {systemStats.systemUptime}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">System Uptime</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Last Login</span>
                      <span>{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Last Active</span>
                      <span>{profile.lastActive ? new Date(profile.lastActive).toLocaleString() : 'Never'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                    <div className="relative mt-1">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                    <div className="relative mt-1">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button onClick={handlePasswordChange} className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </CardContent>
              </Card>

              {/* Security Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Options</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Enable Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Manage Trusted Devices
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Lock className="h-4 w-4 mr-2" />
                    View Login Sessions
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Lock Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tracking Frequency (minutes)</label>
                    <Select
                      value={settings.trackingFrequency.toString()}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, trackingFrequency: parseInt(value) }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 minute</SelectItem>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Idle Detection Time (minutes)</label>
                    <Select
                      value={settings.idleDetectionTime.toString()}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, idleDetectionTime: parseInt(value) }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                    <Select
                      value={settings.theme}
                      onValueChange={(value: 'light' | 'dark' | 'system') => setSettings(prev => ({ ...prev, theme: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={handleSettingsSave} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</label>
                    <input
                      type="checkbox"
                      checked={settings.notificationEmail}
                      onChange={(e) => setSettings(prev => ({ ...prev, notificationEmail: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">SMS Notifications</label>
                    <input
                      type="checkbox"
                      checked={settings.notificationSMS}
                      onChange={(e) => setSettings(prev => ({ ...prev, notificationSMS: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Push Notifications</label>
                    <input
                      type="checkbox"
                      checked={settings.notificationPush}
                      onChange={(e) => setSettings(prev => ({ ...prev, notificationPush: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="h-4 w-4 mr-2" />
                      Configure Alert Types
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-blue-500" />
                      <div>
                        <div className="text-lg font-semibold">{systemStats.totalUsers}</div>
                        <div className="text-sm text-gray-500">Total Users</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Activity className="h-8 w-8 text-green-500" />
                      <div>
                        <div className="text-lg font-semibold">{systemStats.activeUsers}</div>
                        <div className="text-sm text-gray-500">Active Now</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-purple-500" />
                      <div>
                        <div className="text-lg font-semibold">{systemStats.totalVisits}</div>
                        <div className="text-sm text-gray-500">Total Visits</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Cpu className="h-8 w-8 text-orange-500" />
                      <div>
                        <div className="text-lg font-semibold">{systemStats.systemUptime}</div>
                        <div className="text-sm text-gray-500">Uptime</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Storage Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Storage Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <HardDrive className="h-8 w-8 text-gray-500" />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage Used</span>
                        <span>{systemStats.storageUsed} / {systemStats.storageTotal}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45.2%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Last Backup</span>
                      <span>{new Date(systemStats.lastBackup).toLocaleString()}</span>
                    </div>
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Backup Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Activity Log</CardTitle>
                <CardDescription>Recent security-related activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSecurityLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="mt-1">
                        {log.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {log.action}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {log.device} • {log.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">{log.ip}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}