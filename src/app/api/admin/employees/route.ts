import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    let whereClause: any = {}
    
    if (status && status !== 'all') {
      whereClause.status = status
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get employees with pagination
    const employees = await db.user.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        attendances: {
          where: {
            date: {
              gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
              lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
            }
          },
          orderBy: {
            checkInTime: 'desc'
          }
        },
        _count: {
          select: {
            visits: true,
            attendances: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Get total count for pagination
    const total = await db.user.count({
      where: whereClause
    })

    // Format response
    const formattedEmployees = employees.map(employee => {
      const todayAttendance = employee.attendances[0]
      const hoursToday = todayAttendance ? 
        (todayAttendance.checkOutTime ? 
          (new Date(todayAttendance.checkOutTime).getTime() - new Date(todayAttendance.checkInTime).getTime()) / (1000 * 60 * 60) :
          (new Date().getTime() - new Date(todayAttendance.checkInTime).getTime()) / (1000 * 60 * 60)
        ) : 0

      return {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        status: employee.isActive ? 'active' : 'inactive',
        avatar: employee.avatar,
        lastSeen: employee.lastActive?.toISOString() || null,
        hoursToday: Math.round(hoursToday * 10) / 10,
        totalVisits: employee._count.visits,
        totalAttendances: employee._count.attendances,
        phone: employee.phone,
        department: employee.department,
        designation: employee.designation,
        employeeId: employee.employeeId
      }
    })

    return NextResponse.json({
      employees: formattedEmployees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, role, phone, department, password } = body

    // Check if employee already exists
    const existingEmployee = await db.user.findUnique({
      where: { email }
    })

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      )
    }

    // Create new employee
    const employee = await db.user.create({
      data: {
        name,
        email,
        role: role || 'EMPLOYEE',
        phone,
        department,
        designation,
        password, // In production, this should be hashed
        isActive: true,
        avatar: `/avatars/${name.toLowerCase().replace(' ', '-')}.jpg`
      }
    })

    return NextResponse.json({
      message: 'Employee created successfully',
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        status: employee.isActive ? 'active' : 'inactive'
      }
    })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}