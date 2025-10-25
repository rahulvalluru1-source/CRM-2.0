import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get current date start
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch all active employee locations
    const locations = await db.tracking.findMany({
      where: {
        timestamp: {
          gte: today
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    // Group by user to get latest location for each
    const latestLocations = locations.reduce((acc, curr) => {
      if (!acc[curr.userId] || acc[curr.userId].timestamp < curr.timestamp) {
        acc[curr.userId] = curr
      }
      return acc
    }, {} as Record<string, any>)

    // Format response
    const formattedLocations = Object.values(latestLocations).map(loc => ({
      lat: parseFloat(loc.latitude),
      lng: parseFloat(loc.longitude),
      employeeName: loc.user.name,
      lastUpdate: loc.createdAt,
      status: loc.user.isActive ? 'active' : 'inactive'
    }))

    return NextResponse.json(formattedLocations)
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}