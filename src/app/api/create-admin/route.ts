import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export async function POST() {
  try {
    console.log("Creating admin user...")
    
    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10)
    const admin = await db.user.create({
      data: {
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

    console.log("Admin user created:", admin)

    return NextResponse.json({
      message: "Admin user created successfully",
      user: {
        email: "admin@crm.com",
        password: "admin123",
        name: admin.name,
        role: admin.role
      }
    })
  } catch (error) {
    console.error("Create admin error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
