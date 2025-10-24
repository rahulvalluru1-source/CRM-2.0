import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const type = searchParams.get('type')
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    let whereClause: any = {
      status
    }
    
    if (severity && severity !== 'all') {
      whereClause.severity = severity
    }
    
    if (type && type !== 'all') {
      whereClause.type = type
    }

    // Get alerts with pagination
    const alerts = await db.notification.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get total count for pagination
    const total = await db.notification.count({
      where: whereClause
    })

    // Format response
    const formattedAlerts = alerts.map(alert => ({
      id: alert.id,
      type: alert.type,
      message: alert.message,
      severity: alert.type === 'FAKE_GPS' ? 'error' : 'warning', // Map notification type to severity
      status: alert.status,
      timestamp: alert.timestamp.toISOString(),
      employee: alert.user ? {
        id: alert.user.id,
        name: alert.user.name,
        role: alert.user.role
      } : null,
      details: {}, // Mock details since schema doesn't have it
      resolvedAt: null, // Mock resolvedAt since schema doesn't have it
      resolvedBy: null // Mock resolvedBy since schema doesn't have it
    }))

    return NextResponse.json({
      alerts: formattedAlerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, message, severity, employeeId, details } = body

    // Create new alert
    const alert = await db.notification.create({
      data: {
        type,
        message,
        status: 'UNREAD',
        userId: employeeId ? parseInt(employeeId) : null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Alert created successfully',
      alert: {
        id: alert.id,
        type: alert.type,
        message: alert.message,
        severity: alert.type === 'FAKE_GPS' ? 'error' : 'warning',
        status: alert.status,
        timestamp: alert.timestamp.toISOString(),
        employee: alert.user
      }
    })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}