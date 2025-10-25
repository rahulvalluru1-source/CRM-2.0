"use client"

import { useEffect, useState } from 'react'
import LocationTracker from '@/components/location-tracker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Employee {
  id: string
  name: string
  isActive: boolean
  lastLocation?: {
    latitude: number
    longitude: number
    timestamp: string
  }
}

export default function EmployeeTrackingPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  
  useEffect(() => {
    fetchEmployees()
    const interval = setInterval(fetchEmployees, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      const data = await response.json()
      if (data.success) {
        setEmployees(data.data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Employee Tracking</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Location Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <LocationTracker height="600px" showFullMap={true} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => (
            <Card key={employee.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{employee.name}</span>
                  <Badge variant={employee.isActive ? 'success' : 'destructive'}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LocationTracker height="300px" employeeId={employee.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}