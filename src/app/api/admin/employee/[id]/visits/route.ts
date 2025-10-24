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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '30')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    let whereClause: any = { userId: params.id }
    
    if (startDate && endDate) {
      whereClause.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get visit records
    const visits = await db.visit.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    })

    // Get total count for pagination
    const total = await db.visit.count({
      where: whereClause
    })

    // Format visit records
    const formattedVisits = visits.map(visit => ({
      id: visit.id,
      customerName: visit.customer?.name || visit.customerName,
      customerId: visit.customer?.id || null,
      subject: visit.summary,
      description: visit.summary,
      timestamp: visit.timestamp.toISOString(),
      rating: visit.rating,
      status: 'completed', // Mock status since schema doesn't have it
      location: visit.coordinates,
      selfieUrl: visit.selfieUrl,
      signatureUrl: visit.signatureUrl,
      createdAt: visit.createdAt.toISOString(),
      updatedAt: visit.updatedAt.toISOString()
    }))

    return NextResponse.json({
      visits: formattedVisits,
      pagination: {
        limit,
        offset,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching employee visits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee visits' },
      { status: 500 }
    )
  }
}