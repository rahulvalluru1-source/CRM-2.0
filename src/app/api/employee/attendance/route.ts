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
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    // Build where clause
    const whereClause: any = { userId: user.id };
    
    if (start && end) {
      whereClause.date = {
        gte: new Date(start),
        lte: new Date(end)
      };
    }

    // Fetch attendance records
    const attendanceRecords = await db.attendance.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });

    // Transform records to match frontend expectations
    const formattedRecords = attendanceRecords.map(record => {
      let status: 'present' | 'absent' | 'half_day' = 'absent';
      
      if (record.checkInTime && record.checkOutTime) {
        const hours = record.totalHours || 0;
        if (hours >= 4) {
          status = 'present';
        } else {
          status = 'half_day';
        }
      } else if (record.checkInTime) {
        status = 'half_day';
      }

      return {
        id: record.id,
        date: record.date.toISOString().split('T')[0],
        checkInTime: record.checkInTime?.toISOString() || undefined,
        checkOutTime: record.checkOutTime?.toISOString() || undefined,
        totalHours: record.totalHours || undefined,
        checkInLocation: record.checkInLocation || undefined,
        checkOutLocation: record.checkOutLocation || undefined,
        status
      };
    });

    return NextResponse.json(formattedRecords);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}