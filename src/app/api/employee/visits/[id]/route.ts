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
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch visit with customer data
    const visit = await db.visit.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      },
      include: {
        customer: true
      }
    });

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    // Determine status
    let status: 'pending' | 'in_progress' | 'completed' = 'pending';
    
    if (visit.timestamp) {
      status = 'completed';
    } else {
      const scheduledTime = new Date(visit.timestamp || visit.createdAt);
      const now = new Date();
      if (scheduledTime < now) {
        status = 'in_progress';
      }
    }

    return NextResponse.json({
      id: visit.id,
      customerName: visit.customer?.name || 'Unknown Customer',
      customerEmail: visit.customer?.email,
      customerPhone: visit.customer?.phone,
      customerCompany: visit.customer?.company,
      visitType: visit.summary?.split(' - ')[0] || 'General Visit',
      scheduledTime: visit.timestamp?.toISOString() || visit.createdAt.toISOString(),
      status,
      location: visit.coordinates || 'Not specified',
      coordinates: visit.coordinates,
      rating: visit.rating,
      summary: visit.summary,
      selfieUrl: visit.selfieUrl,
      signatureUrl: visit.signatureUrl,
      timestamp: visit.timestamp?.toISOString(),
      createdAt: visit.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error fetching visit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visit' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const existingVisit = await db.visit.findFirst({
      where: { 
        id: params.id,
        userId: user.id 
      }
    });

    if (!existingVisit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }

    const body = await request.json();
    const { summary, rating } = body;

    // Update visit
    const updatedVisit = await db.visit.update({
      where: { id: params.id },
      data: {
        ...(summary && { summary }),
        ...(rating !== undefined && { rating }),
        updatedAt: new Date()
      },
      include: {
        customer: true
      }
    });

    return NextResponse.json({
      id: updatedVisit.id,
      customerName: updatedVisit.customer?.name || 'Unknown Customer',
      visitType: updatedVisit.summary?.split(' - ')[0] || 'General Visit',
      scheduledTime: updatedVisit.timestamp?.toISOString() || updatedVisit.createdAt.toISOString(),
      status: 'completed',
      location: updatedVisit.coordinates || 'Not specified',
      rating: updatedVisit.rating,
      summary: updatedVisit.summary,
      selfieUrl: updatedVisit.selfieUrl,
      signatureUrl: updatedVisit.signatureUrl,
      timestamp: updatedVisit.timestamp?.toISOString(),
      createdAt: updatedVisit.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error updating visit:', error);
    return NextResponse.json(
      { error: 'Failed to update visit' },
      { status: 500 }
    );
  }
}