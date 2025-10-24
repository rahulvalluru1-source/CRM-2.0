import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get ticket with customer data
    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        assignedUser: {
          select: { name: true }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if user has access to this ticket
    if (ticket.createdBy !== currentUser.id && ticket.assignedTo !== currentUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get creator name
    let createdByName = '';
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

    return NextResponse.json({
      ...ticket,
      assignedToName: ticket.assignedUser?.name || '',
      createdByName,
      customerName: ticket.customer?.name || '',
      customerEmail: ticket.customer?.email || '',
      customerPhone: ticket.customer?.phone || '',
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get existing ticket
    const existingTicket = await db.ticket.findUnique({
      where: { id: params.id }
    });

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if user has access to this ticket
    if (existingTicket.createdBy !== currentUser.id && existingTicket.assignedTo !== currentUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { status, priority, resolution, assignedTo } = body;

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (resolution !== undefined) updateData.resolution = resolution;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    // Update ticket
    const updatedTicket = await db.ticket.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        assignedUser: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}