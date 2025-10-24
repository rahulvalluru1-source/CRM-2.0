import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const employee = searchParams.get('employee')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    let whereClause: any = {}
    
    if (status && status !== 'all') {
      whereClause.status = status
    }
    
    if (priority && priority !== 'all') {
      whereClause.priority = priority
    }
    
    if (employee && employee !== 'all') {
      whereClause.userId = parseInt(employee)
    }

    // Get visits with pagination
    const visits = await db.visit.findMany({
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
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get total count for pagination
    const total = await db.visit.count({
      where: whereClause
    })

    // Format response
    const formattedVisits = visits.map(visit => ({
      id: visit.id,
      customer: visit.customer?.name || visit.customerName,
      customerId: visit.customer?.id || null,
      employee: visit.user.name,
      employeeId: visit.user.id,
      subject: visit.summary,
      description: visit.summary,
      status: 'completed', // Mock status since schema doesn't have it
      priority: 'medium', // Mock priority since schema doesn't have it
      rating: visit.rating,
      timestamp: visit.timestamp.toISOString(),
      checkIn: visit.timestamp,
      checkOut: visit.createdAt,
      location: visit.coordinates,
      notes: visit.summary,
      selfieUrl: visit.selfieUrl,
      signatureUrl: visit.signatureUrl,
      duration: visit.createdAt && visit.timestamp ? 
        Math.round((new Date(visit.createdAt).getTime() - new Date(visit.timestamp).getTime()) / (1000 * 60)) : 
        null
    }))

    return NextResponse.json({
      visits: formattedVisits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching visits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch visits' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, employeeId, subject, description, priority, scheduledDate } = body

    // Create new visit
    const visit = await db.visit.create({
      data: {
        userId: parseInt(employeeId),
        customerId: parseInt(customerId),
        customerName: '', // This would need to be fetched or passed
        summary: subject || description,
        rating: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Visit created successfully',
      visit: {
        id: visit.id,
        customer: visit.customer?.name || visit.customerName,
        employee: visit.user.name,
        subject: visit.summary,
        status: 'pending',
        priority: 'medium',
        timestamp: visit.timestamp.toISOString()
      }
    })
  } catch (error) {
    console.error('Error creating visit:', error)
    return NextResponse.json(
      { error: 'Failed to create visit' },
      { status: 500 }
    )
  }
}