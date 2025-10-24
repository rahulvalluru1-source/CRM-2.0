import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get employee's attendance records
    const attendance = await db.attendance.findMany({
      where: { userId: params.id },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset
    })

    // Get employee's visits
    const visits = await db.visit.findMany({
      where: { userId: params.id },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    })

    // Get employee's tracking data
    const tracking = await db.tracking.findMany({
      where: { userId: params.id },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    })

    // Get employee's notifications
    const notifications = await db.notification.findMany({
      where: { userId: params.id },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    })

    // Combine and format all activities
    const activities = [
      ...attendance.map(record => ({
        id: `attendance-${record.id}`,
        type: 'check_in',
        message: `Checked ${record.checkOutTime ? 'out' : 'in'} ${record.checkInLocation ? `at ${record.checkInLocation}` : ''}`,
        timestamp: record.checkOutTime || record.checkInTime || record.date.toISOString(),
        details: {
          checkInTime: record.checkInTime,
          checkOutTime: record.checkOutTime,
          location: record.checkInLocation,
          totalHours: record.totalHours
        }
      })),
      ...visits.map(visit => ({
        id: `visit-${visit.id}`,
        type: 'visit',
        message: `Visit to ${visit.customerName}`,
        timestamp: visit.timestamp.toISOString(),
        details: {
          customerName: visit.customerName,
          subject: visit.summary,
          rating: visit.rating,
          location: visit.coordinates
        }
      })),
      ...tracking.map(track => ({
        id: `tracking-${track.id}`,
        type: 'location_update',
        message: 'Location updated',
        timestamp: track.timestamp.toISOString(),
        details: {
          latitude: track.latitude,
          longitude: track.longitude,
          speed: track.speed,
          battery: track.battery,
          isMockLocation: track.isMockLocation
        }
      })),
      ...notifications.map(notification => ({
        id: `notification-${notification.id}`,
        type: 'alert',
        message: notification.message,
        timestamp: notification.timestamp.toISOString(),
        details: {
          type: notification.type,
          status: notification.status
        }
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return NextResponse.json({
      activities,
      pagination: {
        limit,
        offset,
        total: activities.length
      }
    })
  } catch (error) {
    console.error('Error fetching employee activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee activity' },
      { status: 500 }
    )
  }
}