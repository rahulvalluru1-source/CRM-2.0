import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export async function POST() {
  try {
    console.log("Creating sample users...")
    
    // Create employee user
    const employeePassword = await bcrypt.hash("emp123", 10)
    const employee = await db.user.create({
      data: {
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

    // Create support user
    const supportPassword = await bcrypt.hash("support123", 10)
    const support = await db.user.create({
      data: {
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

    // Create sales user
    const salesPassword = await bcrypt.hash("sales123", 10)
    const sales = await db.user.create({
      data: {
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
    console.error("Create users error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
