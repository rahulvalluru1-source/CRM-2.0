"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAdminPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Admin Test Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>Status:</strong> {status}
            </div>
            <div>
              <strong>Session:</strong>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-sm">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Is Admin:</strong> {session?.user?.role === "ADMIN" ? "Yes" : "No"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}