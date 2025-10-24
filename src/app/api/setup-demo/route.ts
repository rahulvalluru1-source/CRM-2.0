import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    // First create demo users
    const usersResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/create-demo-users`, {
      method: 'POST',
    });
    
    if (!usersResponse.ok) {
      const error = await usersResponse.json();
      return NextResponse.json({ error: 'Failed to create users', details: error }, { status: 500 });
    }
    
    // Then create demo tickets
    const ticketsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/create-demo-ticket`, {
      method: 'POST',
    });
    
    if (!ticketsResponse.ok) {
      const error = await ticketsResponse.json();
      return NextResponse.json({ error: 'Failed to create tickets', details: error }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Demo data setup completed successfully',
      credentials: {
        admin: { email: 'admin@crm.com', password: 'admin123' },
        employee: { email: 'john@crm.com', password: '1234' }
      }
    });
  } catch (error: any) {
    console.error('Error setting up demo data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to setup demo data' },
      { status: 500 }
    );
  }
}