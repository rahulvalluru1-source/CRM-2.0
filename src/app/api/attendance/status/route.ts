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

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find today's attendance record
    const attendance = await db.attendance.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    if (!attendance) {
      return NextResponse.json({
        isCheckedIn: false,
        checkInTime: null,
        checkOutTime: null
      })
    }

    return NextResponse.json({
      isCheckedIn: !!attendance.checkInTime && !attendance.checkOutTime,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      totalHours: attendance.totalHours
    })
  } catch (error) {
    console.error('Attendance status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance status' },
      { status: 500 }
    )
  }
}