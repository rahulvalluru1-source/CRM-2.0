import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET employee profile
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        designation: true,
        employeeId: true,
        avatar: true,
        signature: true,
        address: true,
        city: true,
        region: true,
        joiningDate: true,
        isActive: true,
        lastLogin: true,
        lastActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ employee })
  } catch (error) {
    console.error('Error fetching employee profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee profile' },
      { status: 500 }
    )
  }
}

// PUT update employee profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, email, phone, role, department, designation, address, city, region, isActive } = body

    const updatedEmployee = await db.user.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        role,
        department,
        designation,
        address,
        city,
        region,
        isActive
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        designation: true,
        employeeId: true,
        avatar: true,
        signature: true,
        address: true,
        city: true,
        region: true,
        joiningDate: true,
        isActive: true,
        lastLogin: true,
        lastActive: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Employee profile updated successfully',
      employee: updatedEmployee
    })
  } catch (error) {
    console.error('Error updating employee profile:', error)
    return NextResponse.json(
      { error: 'Failed to update employee profile' },
      { status: 500 }
    )
  }
}