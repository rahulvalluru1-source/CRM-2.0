import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await db.attendance.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    return NextResponse.json({
      checkInTime: attendance?.checkInTime,
      checkOutTime: attendance?.checkOutTime,
      location: {
        checkIn: attendance?.checkInLocation,
        checkOut: attendance?.checkOutLocation
      }
    })
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, location } = body

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let attendance = await db.attendance.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    if (action === 'checkIn') {
      if (attendance?.checkInTime) {
        return NextResponse.json(
          { error: 'Already checked in today' },
          { status: 400 }
        )
      }

      attendance = await db.attendance.upsert({
        where: {
          userId_date: {
            userId: session.user.id,
            date: today
          }
        },
        update: {
          checkInTime: new Date(),
          checkInLocation: location
        },
        create: {
          userId: session.user.id,
          date: today,
          checkInTime: new Date(),
          checkInLocation: location
        }
      })
    } else if (action === 'checkOut') {
      if (!attendance) {
        return NextResponse.json(
          { error: 'No check-in found for today' },
          { status: 400 }
        )
      }

      if (attendance.checkOutTime) {
        return NextResponse.json(
          { error: 'Already checked out today' },
          { status: 400 }
        )
      }

      attendance = await db.attendance.update({
        where: {
          id: attendance.id
        },
        data: {
          checkOutTime: new Date(),
          checkOutLocation: location,
          totalHours: attendance.checkInTime
            ? (new Date().getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60)
            : 0
        }
      })
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error updating attendance:', error)
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    )
  }
}