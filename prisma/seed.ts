import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@crm.com' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@crm.com',
      password: adminPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      department: 'IT',
      designation: 'System Admin',
      phone: '+1234567890',
      employeeId: 'ADMIN001',
      isActive: true,
      joiningDate: new Date(),
    }
  })

  // Create employee user
  const employeePassword = await bcrypt.hash('1234', 12)
  const employee = await prisma.user.upsert({
    where: { email: 'john@crm.com' },
    update: {
      password: employeePassword,
      role: 'EMPLOYEE',
    },
    create: {
      email: 'john@crm.com',
      password: employeePassword,
      name: 'John Doe',
      role: 'EMPLOYEE',
      department: 'Sales',
      designation: 'Sales Executive',
      phone: '+1234567891',
      employeeId: 'EMP001',
      isActive: true,
      joiningDate: new Date(),
    }
  })

  // Create second employee user
  const employee2Password = await bcrypt.hash('1234', 12)
  const employee2 = await prisma.user.upsert({
    where: { email: 'jane@crm.com' },
    update: {
      password: employee2Password,
      role: 'EMPLOYEE',
    },
    create: {
      email: 'jane@crm.com',
      password: employee2Password,
      name: 'Jane Smith',
      role: 'EMPLOYEE',
      department: 'Support',
      designation: 'Support Executive',
      phone: '+1234567892',
      employeeId: 'EMP002',
      isActive: true,
      joiningDate: new Date(),
    }
  })

  console.log('Seeding finished.')
  console.log('Admin user:', admin)
  console.log('Employee user:', employee)
  console.log('Second employee user:', employee2)
  
  console.log('\n=== LOGIN CREDENTIALS ===')
  console.log('Admin: admin@crm.com / admin123')
  console.log('Employee: john@crm.com / 1234')
  console.log('Employee 2: jane@crm.com / 1234')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })