"use client"

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { MapPin, Timer, Clock } from 'lucide-react'
import { io } from 'socket.io-client'

let socket: any

export default function AttendanceTracker() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00')
  const [isLoading, setIsLoading] = useState(false)
  const [coordinates, setCoordinates] = useState<string | null>(null)

  useEffect(() => {
    // Initialize socket connection
    socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
      withCredentials: true
    })

    // Initial status check
    fetchAttendanceStatus()

    // Cleanup on unmount
    return () => {
      socket?.disconnect()
      cleanupTimers()
    }
  }, [])

  const fetchAttendanceStatus = async () => {
    try {
      resetAll() // Reset everything before checking status
      const response = await fetch('/api/attendance/status')
      const data = await response.json()
      
      if (data.isCheckedIn) {
        const checkInDate = new Date(data.checkInTime)
        setIsCheckedIn(true)
        setCheckInTime(checkInDate)
        startTimeTracking(checkInDate)
      } else {
        // Ensure timer is reset if not checked in
        setElapsedTime('00:00:00')
      }
    } catch (error) {
      console.error('Failed to fetch attendance status:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch attendance status',
        variant: 'destructive',
      })
      resetAll() // Reset on error
    }
  }

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Clear all timers and reset state
  const cleanupTimers = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current)
      locationIntervalRef.current = null
    }
  }

  // Complete reset of all states
  const resetAll = () => {
    cleanupTimers()
    setIsCheckedIn(false)
    setCheckInTime(null)
    setElapsedTime('00:00:00')
    setCoordinates(null)
  }

  const startTimeTracking = (startTime: Date) => {
    cleanupTimers() // Ensure no existing timers

    timerIntervalRef.current = setInterval(() => {
      if (!startTime) return

      const now = new Date()
      const diff = now.getTime() - startTime.getTime()
      
      if (diff < 0) {
        setElapsedTime('00:00:00')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }, 1000)
  }

  const getBatteryLevel = async (): Promise<number> => {
    try {
      if ('getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery()
        return Math.round(battery.level * 100)
      }
      return 100
    } catch (error) {
      console.error('Battery API error:', error)
      return 100
    }
  }

  const getLocation = async (): Promise<{ coords: string; accuracy: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = `${position.coords.latitude},${position.coords.longitude}`
          setCoordinates(coords)
          resolve({
            coords,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Please enable location services for attendance tracking'))
              break
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Location information is unavailable'))
              break
            case error.TIMEOUT:
              reject(new Error('Location request timed out'))
              break
            default:
              reject(new Error('Failed to get location'))
          }
        },
        options
      )
    })
  }

  const resetTimer = () => {
    // Clear any existing intervals
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
    setIsCheckedIn(false)
    setCheckInTime(null)
    setElapsedTime('00:00:00')
    stopLocationTracking()
  }

  const handleAttendance = async (action: 'CHECK_IN' | 'CHECK_OUT') => {
    try {
      setIsLoading(true)

      // For check-out, capture final time before reset
      const finalTime = action === 'CHECK_OUT' ? elapsedTime : null

      // Reset everything before proceeding
      resetAll()
      
      const [locationData, batteryLevel] = await Promise.all([
        getLocation(),
        getBatteryLevel()
      ])
      
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          coordinates: locationData.coords,
          accuracy: locationData.accuracy,
          battery: batteryLevel,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process attendance')
      }

      if (action === 'CHECK_IN') {
        const checkInDate = new Date(data.data.checkInTime)
        setIsCheckedIn(true)
        setCheckInTime(checkInDate)
        startTimeTracking(checkInDate)
        startLocationTracking()

        toast({
          title: 'Successfully Checked In',
          description: `Started at ${checkInDate.toLocaleTimeString()}`,
        })
      } else {
        toast({
          title: 'Successfully Checked Out',
          description: `Total time: ${finalTime}`,
        })
        
        // After successful check-out, ensure everything is reset
        resetAll()
        setElapsedTime('00:00:00')
      }
    } catch (error: any) {
      console.error('Attendance error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to process attendance',
        variant: 'destructive',
      })
      resetAll() // Reset on error
    } finally {
      setIsLoading(false)
    }
  }

  const startLocationTracking = () => {
    if (!navigator.geolocation) return

    const trackLocation = async () => {
      try {
        const [locationData, batteryLevel] = await Promise.all([
          getLocation(),
          getBatteryLevel()
        ])
        
        const [latitude, longitude] = locationData.coords.split(',').map(Number)
        
        socket?.emit('location:update', {
          userId: session?.user.id,
          latitude,
          longitude,
          accuracy: locationData.accuracy,
          battery: batteryLevel,
          isMockLocation: false
        })
      } catch (error) {
        console.error('Location tracking error:', error)
        toast({
          title: 'Location Tracking Error',
          description: error instanceof Error ? error.message : 'Failed to update location',
          variant: 'destructive',
        })
      }
    }

    // Initial location track
    trackLocation()
    
    // Set up interval for location tracking
    locationIntervalRef.current = setInterval(trackLocation, 5 * 60 * 1000)
  }

  const stopLocationTracking = () => {
    socket?.emit('track:stop', session?.user.id)
    // Clear all intervals
    cleanupTimers()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Tracker</CardTitle>
        <CardDescription>
          Track your daily attendance and working hours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Clock className="w-6 h-6 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Current Time</p>
              <p className="text-2xl font-bold">{elapsedTime}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <MapPin className="w-6 h-6 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm text-muted-foreground">
                {coordinates ? 'Location tracked' : 'Waiting for location...'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            variant={isCheckedIn ? "destructive" : "default"}
            onClick={() => handleAttendance(isCheckedIn ? 'CHECK_OUT' : 'CHECK_IN')}
            disabled={isLoading}
          >
            {isLoading ? (
              <Timer className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Clock className="w-4 h-4 mr-2" />
            )}
            {isCheckedIn ? 'Check Out' : 'Check In'}
          </Button>
        </div>

        {isCheckedIn && checkInTime && (
          <div className="text-center text-sm text-muted-foreground">
            Checked in at {checkInTime.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}