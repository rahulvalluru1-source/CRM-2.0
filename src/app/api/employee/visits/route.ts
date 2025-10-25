import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Define the Visit type based on our Prisma schema
type Visit = {
  id: string;
  userId: string;
  customerId: string;
  customerName: string;
  visitType: string;
  summary: string | null;
  selfieUrl: string | null;
  signatureUrl: string | null;
  rating: number | null;
  coordinates: string | null;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
  } | null;
};

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
      const typedVisit = visit as unknown as Visit;
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
        id: typedVisit.id,
        customerName: typedVisit.customerName,
        customerEmail: typedVisit.customer?.email,
        customerPhone: typedVisit.customer?.phone,
        customerCompany: typedVisit.customer?.company,
        visitType: typedVisit.visitType,
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

    // Get customer name
    const customer = await db.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

      // Create new visit
    const visitData = {
      userId: user.id,
      customerId: customerId,
      customerName: customer.name,
      visitType: visitType,
      summary: notes || null,
      coordinates: location || null,
      timestamp: new Date(scheduledTime)
    };

    const visit = await db.visit.create({
      data: visitData
    });    const typedVisit = visit as unknown as Visit;
    const response = {
      id: typedVisit.id,
      customerName: typedVisit.customerName,
      visitType: typedVisit.visitType,
      scheduledTime: visit.timestamp.toISOString(),
      status: 'pending',
      location: visit.coordinates,
      summary: visit.summary,
      createdAt: visit.createdAt.toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating visit:', error);
    return NextResponse.json(
      { error: 'Failed to create visit' },
      { status: 500 }
    );
  }
}