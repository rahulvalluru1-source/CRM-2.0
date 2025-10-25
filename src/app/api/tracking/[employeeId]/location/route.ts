import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or the employee themselves
    if (session.user.role !== 'ADMIN' && session.user.id !== params.employeeId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get current date start
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch employee's locations for today
    const locations = await db.tracking.findMany({
      where: {
        userId: params.employeeId,
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

    if (locations.length === 0) {
      return NextResponse.json([])
    }

    // Format response
    const formattedLocations = locations.map(loc => ({
      lat: loc.latitude,
      lng: loc.longitude,
      employeeName: loc.user.name,
      lastUpdate: loc.timestamp,
      status: loc.user.isActive ? 'active' : 'inactive'
    }))

    return NextResponse.json(formattedLocations)
  } catch (error) {
    console.error('Error fetching employee location:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee location' },
      { status: 500 }
    )
  }
}