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
    const { visitId, rating, feedback } = body

    const visit = await db.visit.update({
      where: {
        id: visitId,
        userId: session.user.id
      },
      data: {
        rating,
        summary: feedback
      }
    })

    // If rating is low, create an alert
    if (rating <= 2) {
      await db.notification.create({
        data: {
          userId: session.user.id,
          message: `Low rating (${rating}/5) received for visit to ${visit.customerName}`,
          type: 'ADMIN_BROADCAST',
          status: 'UNREAD'
        }
      })
    }

    return NextResponse.json(visit)
  } catch (error) {
    console.error('Error updating feedback:', error)
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    )
  }
}