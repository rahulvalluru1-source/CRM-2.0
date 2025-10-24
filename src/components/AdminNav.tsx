'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  FileText, 
  Map, 
  BellRing, 
  Settings, 
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react'

interface AdminNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function AdminNav({ activeTab, onTabChange }: AdminNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'employees', label: 'Employees / Attendance', icon: Users },
    { id: 'visits', label: 'Customer Visits / Tickets', icon: FileText },
    { id: 'tracking', label: 'Live Tracking', icon: Map },
    { id: 'analytics', label: 'Analytics / Reports', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts & Notifications', icon: BellRing },
    { id: 'settings', label: 'Settings / Configuration', icon: Settings },
    { id: 'profile', label: 'Admin Profile', icon: User },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">System Management</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start h-12"
                  onClick={() => {
                    onTabChange(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.id === 'alerts' && (
                    <Badge variant="destructive" className="ml-auto h-2 w-2 p-0 rounded-full" />
                  )}
                </Button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-3" />
              <span className="text-sm font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}