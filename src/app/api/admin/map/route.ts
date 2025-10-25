import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get all employee locations from tracking table
    const employeeLocations = await db.tracking.findMany({
      where: {
        timestamp: {
          // Get locations from last hour only
          gte: new Date(Date.now() - 60 * 60 * 1000)
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      // Group by user to get latest location per user
      distinct: ['userId']
    })

    return NextResponse.json({
      employees: employeeLocations.map(loc => ({
        id: loc.user.id,
        name: loc.user.name,
        employeeId: loc.user.employeeId,
        location: {
          lat: loc.latitude,
          lng: loc.longitude,
          timestamp: loc.timestamp,
          isMockLocation: loc.isMockLocation,
          battery: loc.battery
        }
      }))
    })
  } catch (error) {
    console.error('Error fetching employee locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee locations' },
      { status: 500 }
    )
  }
}