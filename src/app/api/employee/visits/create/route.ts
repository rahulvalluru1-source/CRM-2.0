import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const customerId = formData.get('customerId') as string
    const summary = formData.get('summary') as string
    const coordinates = formData.get('coordinates') as string
    const rating = parseInt(formData.get('rating') as string)
    const selfieFile = formData.get('selfie') as File
    const signatureFile = formData.get('signature') as File

    // Handle file uploads (implement your file storage solution)
    const selfieUrl = await uploadFile(selfieFile)
    const signatureUrl = await uploadFile(signatureFile)

    const visit = await db.visit.create({
      data: {
        userId: session.user.id,
        customerId,
        customerName: (await db.customer.findUnique({ where: { id: customerId } }))?.name || '',
        summary,
        coordinates,
        rating,
        selfieUrl,
        signatureUrl
      }
    })

    // Create notification for new visit
    await db.notification.create({
      data: {
        userId: session.user.id,
        message: `New visit logged for ${visit.customerName}`,
        type: 'VISIT_COMPLETED',
        status: 'UNREAD'
      }
    })

    return NextResponse.json(visit)
  } catch (error) {
    console.error('Error creating visit:', error)
    return NextResponse.json(
      { error: 'Failed to create visit' },
      { status: 500 }
    )
  }
}

async function uploadFile(file: File): Promise<string> {
  // Implement file upload to your storage solution
  // This is a placeholder that should be replaced with actual file upload logic
  return 'placeholder-url'
}