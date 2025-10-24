import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '30')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    let whereClause: any = { userId: params.id }
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get attendance records
    const attendance = await db.attendance.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset
    })

    // Get total count for pagination
    const total = await db.attendance.count({
      where: whereClause
    })

    // Format attendance records
    const formattedAttendance = attendance.map(record => ({
      id: record.id,
      date: record.date.toISOString().split('T')[0],
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
      totalHours: record.totalHours,
      checkInLocation: record.checkInLocation,
      checkOutLocation: record.checkOutLocation,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    }))

    return NextResponse.json({
      attendance: formattedAttendance,
      pagination: {
        limit,
        offset,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching employee attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee attendance' },
      { status: 500 }
    )
  }
}