import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Get demo users
    const users = await db.user.findMany();

    if (users.length < 2) {
      return NextResponse.json(
        { error: 'Please create demo users first' },
        { status: 400 }
      );
    }

    const employee = users.find(u => u.email === 'john@crm.com');
    const assignee = users.find(u => u.email === 'jane@crm.com');

    if (!employee) {
      return NextResponse.json(
        { error: 'Demo employee not found' },
        { status: 404 }
      );
    }

    // Generate a 5-digit ticket ID
    const ticketId = Math.floor(10000 + Math.random() * 90000).toString();

    // Create demo customers first
    const customer1 = await db.customer.create({
      data: {
        name: 'Acme Corporation',
        company: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1234567890',
        addedBy: employee.id,
      }
    });

    const customer2 = await db.customer.create({
      data: {
        name: 'Tech Solutions Inc',
        company: 'Tech Solutions Inc',
        email: 'support@techsolutions.com',
        phone: '+1234567891',
        addedBy: employee.id,
      }
    });

    const customer3 = await db.customer.create({
      data: {
        name: 'Global Enterprises',
        company: 'Global Enterprises',
        email: 'it@globalenterprises.com',
        phone: '+1234567892',
        addedBy: employee.id,
      }
    });

    // Create demo ticket
    const ticket = await db.ticket.create({
      data: {
        ticketId,
        customerId: customer1.id,
        subject: 'SUPPORT_REQUEST',
        description: 'Our website is experiencing slow loading times, especially during peak hours. This is affecting our customer experience and sales. We need this resolved as soon as possible.',
        priority: 'HIGH',
        status: 'OPEN',
        source: 'email',
        assignedTo: assignee?.id || employee.id,
        createdBy: employee.id,
        resolution: '',
      }
    });

    // Create another demo ticket
    const ticketId2 = Math.floor(10000 + Math.random() * 90000).toString();
    const ticket2 = await db.ticket.create({
      data: {
        ticketId: ticketId2,
        customerId: customer2.id,
        subject: 'INQUIRY',
        description: 'Several users are reporting issues with logging into their accounts. They are getting invalid password errors even with correct credentials.',
        priority: 'LOW',
        status: 'PENDING',
        source: 'phone',
        assignedTo: employee.id,
        createdBy: employee.id,
        resolution: '',
        createdAt: new Date(Date.now() - 86400000), // Yesterday
        updatedAt: new Date(Date.now() - 86400000)
      }
    });

    // Create a closed ticket
    const ticketId3 = Math.floor(10000 + Math.random() * 90000).toString();
    const ticket3 = await db.ticket.create({
      data: {
        ticketId: ticketId3,
        customerId: customer3.id,
        subject: 'INSTALLATION',
        description: 'Need help setting up email configuration for our domain. We want to use custom email addresses with our company domain.',
        priority: 'LOW',
        status: 'CLOSED',
        source: 'website',
        assignedTo: employee.id,
        createdBy: employee.id,
        resolution: 'Successfully configured email settings for the domain. Created necessary MX records and SPF records. User can now send and receive emails using custom domain addresses.',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        updatedAt: new Date(Date.now() - 86400000)
      }
    });

    return NextResponse.json({
      message: 'Demo tickets created successfully',
      tickets: {
        open: ticket,
        pending: ticket2,
        closed: ticket3
      }
    });
  } catch (error: any) {
    console.error('Error creating demo tickets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create demo tickets' },
      { status: 500 }
    );
  }
}