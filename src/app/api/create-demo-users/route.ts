import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    // Create demo admin user
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await db.user.create({
      data: {
        email: 'admin@crm.com',
        password: hashedAdminPassword,
        name: 'System Administrator',
        role: 'ADMIN',
        department: 'IT',
        designation: 'System Admin',
        phone: '+1234567890',
        employeeId: 'ADMIN001',
        isActive: true,
        joiningDate: new Date(),
      }
    });

    // Create demo employee user
    const hashedEmployeePassword = await bcrypt.hash('1234', 10);
    const employeeUser = await db.user.create({
      data: {
        email: 'john@crm.com',
        password: hashedEmployeePassword,
        name: 'John Doe',
        role: 'EMPLOYEE',
        department: 'Sales',
        designation: 'Sales Executive',
        phone: '+1234567891',
        employeeId: 'EMP001',
        isActive: true,
        joiningDate: new Date(),
      }
    });

    // Create another employee for testing assignment
    const employeeUser2 = await db.user.create({
      data: {
        email: 'jane@crm.com',
        password: hashedEmployeePassword,
        name: 'Jane Smith',
        role: 'EMPLOYEE',
        department: 'Support',
        designation: 'Support Executive',
        phone: '+1234567892',
        employeeId: 'EMP002',
        isActive: true,
        joiningDate: new Date(),
      }
    });

    return NextResponse.json({
      message: 'Demo users created successfully',
      users: {
        admin: adminUser,
        employee: employeeUser,
        employee2: employeeUser2
      }
    });
  } catch (error: any) {
    console.error('Error creating demo users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create demo users' },
      { status: 500 }
    );
  }
}