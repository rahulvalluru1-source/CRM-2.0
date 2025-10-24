import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if visit exists and belongs to user
    const visit = await db.visit.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      }
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    // Update visit to mark as started (in progress)
    // Since we don't have a status field, we'll update the timestamp to now
    // to indicate the visit has been started
    const updatedVisit = await db.visit.update({
      where: { id: params.id },
      data: {
        // We'll use a different approach - maybe add a note or update coordinates
        summary: visit.summary ? `[IN PROGRESS] ${visit.summary}` : '[IN PROGRESS] Visit started',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Visit started successfully',
      visit: {
        id: updatedVisit.id,
        status: 'in_progress'
      }
    });
  } catch (error) {
    console.error('Error starting visit:', error);
    return NextResponse.json(
      { error: 'Failed to start visit' },
      { status: 500 }
    );
  }
}