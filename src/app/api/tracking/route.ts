import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const { latitude, longitude, speed, battery, isMockLocation } = data

    // Store location update in database
    const tracking = await db.tracking.create({
      data: {
        userId: session.user.id,
        latitude,
        longitude,
        speed: speed || 0,
        battery: battery || 100,
        isMockLocation: isMockLocation || false
      }
    })

    return NextResponse.json({ success: true, data: tracking })
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = new URL(req.url).searchParams
    const employeeId = searchParams.get('employeeId')

    // Get latest location for employee(s)
    const query = employeeId 
      ? { where: { userId: employeeId } }
      : {}

    const tracking = await db.tracking.findMany({
      ...query,
      orderBy: { timestamp: 'desc' },
      take: employeeId ? 1 : undefined,
      include: {
        user: {
          select: {
            name: true,
            isActive: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: tracking })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}