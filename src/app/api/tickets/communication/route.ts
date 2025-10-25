import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ticketId, message, internal = false } = body

    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
      include: { customer: true }
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Create communication log
    const communication = await db.communication.create({
      data: {
        ticketId,
        userId: session.user.id,
        message,
        internal
      }
    })

    // Create notification for other assigned users
    if (ticket.assignedTo && ticket.assignedTo !== session.user.id) {
      await db.notification.create({
        data: {
          userId: ticket.assignedTo,
          message: `New message on ticket #${ticket.ticketId}`,
          type: 'TICKET_UPDATED',
          status: 'UNREAD'
        }
      })
    }

    return NextResponse.json(communication)
  } catch (error) {
    console.error('Error adding communication:', error)
    return NextResponse.json(
      { error: 'Failed to add communication' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticketId')

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      )
    }

    const communications = await db.communication.findMany({
      where: {
        ticketId,
        OR: [
          { internal: false },
          { userId: session.user.id }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(communications)
  } catch (error) {
    console.error('Error fetching communications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch communications' },
      { status: 500 }
    )
  }
}