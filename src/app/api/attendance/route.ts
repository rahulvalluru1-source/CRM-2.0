import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { io } from '@/lib/socket'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { action, coordinates } = data // action can be 'CHECK_IN' or 'CHECK_OUT'

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find or create today's attendance record
    let attendance = await db.attendance.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    if (!attendance && action === 'CHECK_IN') {
      attendance = await db.attendance.create({
        data: {
          userId: session.user.id,
          date: new Date(),
          checkInTime: new Date(),
          checkInLocation: coordinates,
        }
      })

      // Notify admin about new check-in
      await db.notification.create({
        data: {
          userId: session.user.id,
          type: 'CHECK_IN',
          message: `${session.user.name} has checked in`,
          status: 'UNREAD'
        }
      })

      // Emit socket event for real-time update
      io.emit('attendance:update', {
        type: 'CHECK_IN',
        userId: session.user.id,
        userName: session.user.name,
        timestamp: new Date()
      })

    } else if (attendance && action === 'CHECK_OUT' && !attendance.checkOutTime) {
      const checkOutTime = new Date()
      const checkInTime = new Date(attendance.checkInTime!)
      const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)

      attendance = await db.attendance.update({
        where: { id: attendance.id },
        data: {
          checkOutTime,
          checkOutLocation: coordinates,
          totalHours: Number(totalHours.toFixed(2))
        }
      })

      // Notify admin about check-out
      await db.notification.create({
        data: {
          userId: session.user.id,
          type: 'CHECK_OUT',
          message: `${session.user.name} has checked out`,
          status: 'UNREAD'
        }
      })

      // Emit socket event for real-time update
      io.emit('attendance:update', {
        type: 'CHECK_OUT',
        userId: session.user.id,
        userName: session.user.name,
        timestamp: new Date(),
        totalHours
      })
    }

    // Start tracking if checking in
    if (action === 'CHECK_IN') {
      await db.tracking.create({
        data: {
          userId: session.user.id,
          latitude: parseFloat(coordinates.split(',')[0]),
          longitude: parseFloat(coordinates.split(',')[1]),
          battery: data.battery || 100,
          isMockLocation: false,
          timestamp: new Date()
        }
      })
    }

    return NextResponse.json({ success: true, data: attendance })
  } catch (error) {
    console.error('Attendance error:', error)
    return NextResponse.json(
      { error: 'Failed to process attendance' },
      { status: 500 }
    )
  }
}