import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate ? new Date(endDate) : new Date()

    let reportData

    switch (reportType) {
      case 'attendance':
        reportData = await generateAttendanceReport(start, end)
        break
      case 'visits':
        reportData = await generateVisitsReport(start, end)
        break
      case 'tickets':
        reportData = await generateTicketsReport(start, end)
        break
      case 'performance':
        reportData = await generatePerformanceReport(start, end)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

async function generateAttendanceReport(start: Date, end: Date) {
  const attendance = await db.attendance.findMany({
    where: {
      date: {
        gte: start,
        lte: end
      }
    },
    include: {
      user: {
        select: {
          name: true,
          employeeId: true
        }
      }
    }
  })

  return {
    type: 'attendance',
    period: { start, end },
    data: attendance.map(record => ({
      employeeId: record.user.employeeId,
      employeeName: record.user.name,
      date: record.date,
      checkIn: record.checkInTime,
      checkOut: record.checkOutTime,
      totalHours: record.totalHours
    }))
  }
}

async function generateVisitsReport(start: Date, end: Date) {
  const visits = await db.visit.findMany({
    where: {
      timestamp: {
        gte: start,
        lte: end
      }
    },
    include: {
      user: {
        select: {
          name: true,
          employeeId: true
        }
      }
    }
  })

  return {
    type: 'visits',
    period: { start, end },
    data: visits.map(visit => ({
      employeeId: visit.user.employeeId,
      employeeName: visit.user.name,
      customerName: visit.customerName,
      timestamp: visit.timestamp,
      rating: visit.rating
    }))
  }
}

async function generateTicketsReport(start: Date, end: Date) {
  const tickets = await db.ticket.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end
      }
    },
    include: {
      assignedUser: {
        select: {
          name: true,
          employeeId: true
        }
      },
      customer: true
    }
  })

  return {
    type: 'tickets',
    period: { start, end },
    data: tickets.map(ticket => ({
      ticketId: ticket.ticketId,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      assignedTo: ticket.assignedUser?.name,
      customer: ticket.customer.name,
      createdAt: ticket.createdAt,
      resolvedAt: ticket.updatedAt
    }))
  }
}

async function generatePerformanceReport(start: Date, end: Date) {
  const users = await db.user.findMany({
    where: {
      role: 'EMPLOYEE'
    },
    include: {
      _count: {
        select: {
          visits: true,
          assignedTickets: true
        }
      },
      visits: {
        where: {
          timestamp: {
            gte: start,
            lte: end
          }
        },
        select: {
          rating: true
        }
      },
      assignedTickets: {
        where: {
          status: 'CLOSED',
          updatedAt: {
            gte: start,
            lte: end
          }
        }
      },
      attendance: {
        where: {
          date: {
            gte: start,
            lte: end
          }
        }
      }
    }
  })

  return {
    type: 'performance',
    period: { start, end },
    data: users.map(user => ({
      employeeId: user.employeeId,
      name: user.name,
      metrics: {
        totalVisits: user._count.visits,
        averageRating: user.visits.reduce((acc, v) => acc + (v.rating || 0), 0) / user.visits.length || 0,
        ticketsClosed: user._count.assignedTickets,
        attendancePercentage: (user.attendance.length / ((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))) * 100
      }
    }))
  }
}