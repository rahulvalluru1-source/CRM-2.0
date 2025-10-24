import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
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

    // Fetch visits for the current user
    const visits = await db.visit.findMany({
      where: { userId: user.id },
      include: {
        customer: true
      },
      orderBy: { timestamp: 'desc' }
    });

    // Transform records to match frontend expectations
    const formattedVisits = visits.map(visit => {
      let status: 'pending' | 'in_progress' | 'completed' = 'pending';
      
      if (visit.timestamp) {
        status = 'completed';
      } else {
        // Check if scheduled time has passed
        const scheduledTime = new Date(visit.timestamp || visit.createdAt);
        const now = new Date();
        if (scheduledTime < now) {
          status = 'in_progress';
        }
      }

      return {
        id: visit.id,
        customerName: visit.customer?.name || 'Unknown Customer',
        customerEmail: visit.customer?.email,
        customerPhone: visit.customer?.phone,
        customerCompany: visit.customer?.company,
        visitType: visit.summary || 'General Visit', // Using summary as visit type for now
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
      };
    });

    return NextResponse.json(formattedVisits);
  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      customerId,
      visitType,
      scheduledTime,
      location,
      notes
    } = body;

    if (!customerId || !visitType || !scheduledTime) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, visitType, scheduledTime' },
        { status: 400 }
      );
    }

    // Create new visit
    const visit = await db.visit.create({
      data: {
        userId: user.id,
        customerId: customerId,
        summary: `${visitType} - ${notes || ''}`,
        coordinates: location,
        timestamp: new Date(scheduledTime),
        createdAt: new Date()
      },
      include: {
        customer: true
      }
    });

    return NextResponse.json({
      id: visit.id,
      customerName: visit.customer?.name || 'Unknown Customer',
      visitType: visitType,
      scheduledTime: visit.timestamp?.toISOString(),
      status: 'pending',
      location: location,
      summary: visit.summary,
      createdAt: visit.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error creating visit:', error);
    return NextResponse.json(
      { error: 'Failed to create visit' },
      { status: 500 }
    );
  }
}