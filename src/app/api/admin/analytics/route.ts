import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    const now = new Date()
    let start: Date
    let end: Date = now

    if (startDate && endDate) {
      start = new Date(startDate)
      end = new Date(endDate)
    } else {
      switch (period) {
        case 'day':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'year':
          start = new Date(now.getFullYear(), 0, 1)
          break
        default:
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
    }

    // Get total employees
    const totalEmployees = await db.user.count()

    // Get active employees (checked in today)
    const activeEmployees = await db.user.count({
      where: {
        isActive: true
      }
    })

    // Get today's visits
    const todayVisits = await db.visit.count({
      where: {
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      }
    })

    // Get pending alerts
    const pendingAlerts = await db.notification.count({
      where: {
        status: 'UNREAD',
        createdAt: {
          gte: start
        }
      }
    })

    // Get visits trend data
    const visitsTrend = await db.visit.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get attendance data
    const attendanceData = await db.attendance.groupBy({
      by: ['date'],
      where: {
        date: {
          gte: start,
          lte: end
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Get top performers
    const topPerformers = await db.user.findMany({
      take: 5,
      include: {
        _count: {
          select: {
            visits: true
          }
        },
        visits: {
          where: {
            timestamp: {
              gte: start
            }
          }
        }
      },
      orderBy: {
        visits: {
          _count: 'desc'
        }
      }
    })

    // Get average ratings
    const averageRatings = await db.visit.aggregate({
      where: {
        rating: {
          not: null
        },
        timestamp: {
          gte: start
        }
      },
      _avg: {
        rating: true
      },
      _count: {
        rating: true
      }
    })

    // Get employee ratings breakdown
    const employeeRatings = await db.user.findMany({
      include: {
        visits: {
          where: {
            rating: {
              not: null
            },
            timestamp: {
              gte: start
            }
          },
          select: {
            rating: true
          }
        }
      },
      take: 10
    })

    const formattedEmployeeRatings = employeeRatings.map(employee => {
      const ratings = employee.visits.map(v => v.rating).filter(r => r !== null)
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
      return {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        averageRating: Math.round(avgRating * 10) / 10,
        totalRatings: ratings.length
      }
    }).filter(emp => emp.totalRatings > 0).sort((a, b) => b.averageRating - a.averageRating)

    // Format visits trend
    const formattedVisitsTrend = visitsTrend.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.id
    }))

    // Format attendance data
    const formattedAttendanceData = attendanceData.map(item => ({
      date: item.date.toISOString().split('T')[0],
      count: item._count.id,
      rate: Math.round((item._count.id / totalEmployees) * 100)
    }))

    // Format top performers
    const formattedTopPerformers = topPerformers.map((employee, index) => ({
      id: employee.id,
      name: employee.name,
      role: employee.role,
      visits: employee._count.visits,
      rating: 4.5 - index * 0.2, // Mock rating for now
      rank: index + 1
    }))

    return NextResponse.json({
      summary: {
        totalEmployees,
        activeEmployees,
        todayVisits,
        pendingAlerts,
        averageRating: averageRatings._avg.rating || 0,
        totalRatings: averageRatings._count.rating || 0
      },
      trends: {
        visits: formattedVisitsTrend,
        attendance: formattedAttendanceData
      },
      topPerformers: formattedTopPerformers,
      employeeRatings: formattedEmployeeRatings,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        type: period
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}