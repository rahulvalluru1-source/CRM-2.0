import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10)
    const admin = await db.user.upsert({
      where: { email: "admin@crm.com" },
      update: {},
      create: {
        email: "admin@crm.com",
        password: adminPassword,
        name: "System Administrator",
        role: "ADMIN",
        department: "IT",
        designation: "System Admin",
        phone: "+1234567890",
        employeeId: "ADMIN001",
        joiningDate: new Date(),
      }
    })

    // Create sample employee
    const employeePassword = await bcrypt.hash("emp123", 10)
    const employee = await db.user.upsert({
      where: { email: "john@crm.com" },
      update: {},
      create: {
        email: "john@crm.com",
        password: employeePassword,
        name: "John Doe",
        role: "EMPLOYEE",
        department: "Sales",
        designation: "Field Executive",
        phone: "+1234567891",
        employeeId: "EMP001",
        joiningDate: new Date(),
      }
    })

    // Create sample support user
    const supportPassword = await bcrypt.hash("support123", 10)
    const support = await db.user.upsert({
      where: { email: "support@crm.com" },
      update: {},
      create: {
        email: "support@crm.com",
        password: supportPassword,
        name: "Support Agent",
        role: "SUPPORT",
        department: "Customer Support",
        designation: "Support Specialist",
        phone: "+1234567892",
        employeeId: "SUP001",
        joiningDate: new Date(),
      }
    })

    // Create sample sales user
    const salesPassword = await bcrypt.hash("sales123", 10)
    const sales = await db.user.upsert({
      where: { email: "sales@crm.com" },
      update: {},
      create: {
        email: "sales@crm.com",
        password: salesPassword,
        name: "Sales Agent",
        role: "SALES",
        department: "Sales",
        designation: "Sales Representative",
        phone: "+1234567893",
        employeeId: "SAL001",
        joiningDate: new Date(),
      }
    })

    return NextResponse.json({
      message: "Sample users created successfully",
      users: {
        admin: { email: "admin@crm.com", password: "admin123" },
        employee: { email: "john@crm.com", password: "emp123" },
        support: { email: "support@crm.com", password: "support123" },
        sales: { email: "sales@crm.com", password: "sales123" }
      }
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}