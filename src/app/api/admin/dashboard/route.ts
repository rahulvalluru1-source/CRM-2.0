import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get summary statistics
    const [
      totalEmployees,
      activeEmployees,
      todayVisits,
      pendingAlerts,
      yesterdayVisits
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.visit.count({
        where: {
          timestamp: {
            gte: today
          }
        }
      }),
      db.notification.count({
        where: {
          status: 'UNREAD',
          type: 'FAKE_GPS' // Only count critical alerts
        }
      }),
      db.visit.count({
        where: {
          timestamp: {
            gte: new Date(today.getTime() - 24 * 60 * 60 * 1000),
            lt: today
          }
        }
      })
    ])

    // Get recent activity
    const recentVisits = await db.visit.findMany({
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    // Get latest alerts
    const latestAlerts = await db.notification.findMany({
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    // Get employee status breakdown
    const employeeStatusBreakdown = await db.user.groupBy({
      by: ['isActive'],
      _count: {
        id: true
      }
    })

    // Get attendance analytics for today
    const todayAttendance = await db.attendance.findMany({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
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
      }
    })

    // Calculate attendance metrics
    const checkedInToday = todayAttendance.filter(a => a.checkInTime && !a.checkOutTime).length
    const checkedOutToday = todayAttendance.filter(a => a.checkInTime && a.checkOutTime).length
    const lateCheckIns = todayAttendance.filter(a => {
      if (!a.checkInTime) return false
      const checkInTime = new Date(a.checkInTime)
      const expectedTime = new Date()
      expectedTime.setHours(9, 0, 0, 0) // 9 AM expected check-in
      return checkInTime > expectedTime
    }).length

    // Format recent activity
    const formattedRecentActivity = recentVisits.map(visit => ({
      id: visit.id,
      employee: {
        id: visit.user.id,
        name: visit.user.name,
        avatar: visit.user.avatar
      },
      customer: visit.customer?.name || visit.customerName,
      subject: visit.summary,
      priority: 'medium', // Mock priority
      timestamp: visit.timestamp.toISOString(),
      status: 'completed' // Mock status
    }))

    // Format latest alerts
    const formattedLatestAlerts = latestAlerts.map(alert => ({
      id: alert.id,
      type: alert.type,
      message: alert.message,
      severity: alert.type === 'FAKE_GPS' ? 'error' : 'warning',
      timestamp: alert.timestamp.toISOString(),
      employee: alert.user ? {
        id: alert.user.id,
        name: alert.user.name
      } : null
    }))

    // Format employee status breakdown
    const formattedStatusBreakdown = employeeStatusBreakdown.reduce((acc, item) => {
      acc[item.isActive ? 'active' : 'inactive'] = item._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      summary: {
        totalEmployees,
        activeEmployees,
        todayVisits,
        pendingAlerts,
        visitsChange: todayVisits - yesterdayVisits,
        employeesChange: 2, // Mock data
        activeRate: Math.round((activeEmployees / totalEmployees) * 100)
      },
      recentActivity: formattedRecentActivity,
      latestAlerts: formattedLatestAlerts,
      employeeStatusBreakdown: formattedStatusBreakdown,
      attendanceMetrics: {
        checkedInToday,
        checkedOutToday,
        lateCheckIns,
        totalExpected: totalEmployees
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}