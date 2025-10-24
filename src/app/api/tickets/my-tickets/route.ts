import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user from database
    const currentUser = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch tickets where user is creator or assigned to
    const tickets = await db.ticket.findMany({
      where: {
        OR: [
          { createdBy: currentUser.id },
          { assignedTo: currentUser.id }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: true,
        assignedUser: {
          select: { name: true }
        }
      }
    });

    // Get creator names
    const ticketsWithNames = await Promise.all(
      tickets.map(async (ticket) => {
        let createdByName = '';

        // Get creator name
        if (ticket.createdBy) {
          try {
            const creatorUser = await db.user.findUnique({
              where: { id: ticket.createdBy },
              select: { name: true }
            });
            createdByName = creatorUser?.name || '';
          } catch (error) {
            console.error('Failed to fetch creator user:', error);
          }
        }

        return {
          ...ticket,
          assignedToName: ticket.assignedUser?.name || '',
          createdByName,
          customerName: ticket.customer?.name || '',
          customerEmail: ticket.customer?.email || '',
          customerPhone: ticket.customer?.phone || '',
        };
      })
    );

    return NextResponse.json(ticketsWithNames);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}