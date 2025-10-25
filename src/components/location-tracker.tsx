"use client"

import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'

declare global {
  interface Window {
    google: any
  }
}

interface Location {
  lat: number
  lng: number
  employeeName: string
  lastUpdate: string
  status: 'active' | 'inactive'
}

interface LocationTrackerProps {
  height?: string
  showFullMap?: boolean
  employeeId?: string
}

export default function LocationTracker({ height = '400px', showFullMap = false, employeeId }: LocationTrackerProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    // Load Google Maps script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = initializeMap
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000')

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'location:update') {
        updateLocation(data)
      }
    }

    // Fetch initial locations
    fetchLocations()

    return () => {
      socket.close()
    }
  }, [employeeId])

  const fetchLocations = async () => {
    try {
      const url = employeeId 
        ? `/api/tracking/${employeeId}/location` 
        : '/api/tracking/locations'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok) {
        setLocations(data)
        updateMapMarkers(data)
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error)
    }
  }

  const initializeMap = () => {
    if (!mapRef.current) return

    const defaultLocation = { lat: 0, lng: 0 }
    const mapOptions = {
      zoom: 12,
      center: defaultLocation,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    }

    googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptions)
    
    if (locations.length > 0) {
      updateMapMarkers(locations)
    }
  }

  const updateMapMarkers = (locations: Location[]) => {
    if (!googleMapRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    const bounds = new window.google.maps.LatLngBounds()

    locations.forEach(location => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: googleMapRef.current,
        title: location.employeeName,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: location.status === 'active' ? '#22c55e' : '#ef4444',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#ffffff'
        }
      })

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <p class="font-medium">${location.employeeName}</p>
            <p class="text-sm text-gray-500">Last update: ${new Date(location.lastUpdate).toLocaleString()}</p>
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current, marker)
      })

      markersRef.current.push(marker)
      bounds.extend(marker.getPosition())
    })

    if (locations.length > 0) {
      googleMapRef.current.fitBounds(bounds)
      if (locations.length === 1) {
        googleMapRef.current.setZoom(15)
      }
    }
  }

  const updateLocation = (data: any) => {
    setLocations(prev => {
      const newLocations = [...prev]
      const index = newLocations.findIndex(loc => loc.employeeName === data.employeeName)
      
      if (index !== -1) {
        newLocations[index] = {
          ...newLocations[index],
          lat: data.latitude,
          lng: data.longitude,
          lastUpdate: new Date().toISOString(),
          status: data.status
        }
      } else {
        newLocations.push({
          lat: data.latitude,
          lng: data.longitude,
          employeeName: data.employeeName,
          lastUpdate: new Date().toISOString(),
          status: data.status
        })
      }

      updateMapMarkers(newLocations)
      return newLocations
    })
  }

  return (
    <Card className={`overflow-hidden ${showFullMap ? 'h-[calc(100vh-10rem)]' : ''}`}>
      <div ref={mapRef} style={{ height }} className="relative">
        {locations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No locations available</p>
            </div>
          </div>
        )}
      </div>
      {showFullMap && (
        <div className="p-4 border-t">
          <div className="flex flex-wrap gap-2">
            {locations.map((location, index) => (
              <Badge
                key={index}
                variant={location.status === 'active' ? 'default' : 'secondary'}
                className="flex items-center space-x-1"
              >
                <div className={`w-2 h-2 rounded-full ${
                  location.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span>{location.employeeName}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}