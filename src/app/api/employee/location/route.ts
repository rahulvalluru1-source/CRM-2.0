import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { latitude, longitude, battery, isMockLocation } = body

    // Create tracking record
    const tracking = await db.tracking.create({
      data: {
        userId: session.user.id,
        latitude,
        longitude,
        battery,
        isMockLocation
      }
    })

    // If mock location detected, create alert
    if (isMockLocation) {
      await db.notification.create({
        data: {
          userId: session.user.id,
          message: 'Fake GPS location detected',
          type: 'FAKE_GPS',
          status: 'UNREAD'
        }
      })
    }

    return NextResponse.json(tracking)
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    )
  }
}