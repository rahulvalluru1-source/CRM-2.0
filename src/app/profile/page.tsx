"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Mail, Phone, Building, Calendar, Edit2, Save, X } from "lucide-react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    address: "",
    city: "",
    region: "",
    employeeId: "",
    joiningDate: "",
    avatar: "",
    signature: ""
  })
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    fetchProfile()
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      // This will be implemented with actual API calls
      // Mock data for now
      setProfile({
        name: session?.user?.name || "John Doe",
        email: session?.user?.email || "john@crm.com",
        phone: "+1234567890",
        department: "Sales",
        designation: "Field Executive",
        address: "123 Main St",
        city: "New York",
        region: "NY",
        employeeId: "EMP001",
        joiningDate: "2024-01-15",
        avatar: "",
        signature: ""
      })
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage("")

    try {
      // This will be implemented with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage("Profile updated successfully!")
      setEditing(false)
    } catch (error) {
      setMessage("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    fetchProfile()
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {session?.user.role}
              </Badge>
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback>
                  {profile.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold">{profile.name}</h3>
                <p className="text-sm text-gray-500">{profile.designation}</p>
                <Badge variant="outline" className="mt-2">
                  {profile.employeeId}
                </Badge>
              </div>
              {editing && (
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Manage your personal and professional information
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  {editing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      value={profile.employeeId}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={profile.department}
                      onChange={(e) => setProfile({...profile, department: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={profile.designation}
                      onChange={(e) => setProfile({...profile, designation: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joiningDate">Joining Date</Label>
                    <Input
                      id="joiningDate"
                      type="date"
                      value={profile.joiningDate}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={profile.address}
                      onChange={(e) => setProfile({...profile, address: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profile.city}
                      onChange={(e) => setProfile({...profile, city: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region/State</Label>
                    <Input
                      id="region"
                      value={profile.region}
                      onChange={(e) => setProfile({...profile, region: e.target.value})}
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Digital Signature */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Digital Signature</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {profile.signature ? (
                    <img src={profile.signature} alt="Signature" className="h-16 mx-auto" />
                  ) : (
                    <p className="text-gray-500">No signature uploaded</p>
                  )}
                  {editing && (
                    <Button variant="outline" size="sm" className="mt-4">
                      <Edit2 className="h-4 w-4 mr-2" />
                      {profile.signature ? "Update Signature" : "Add Signature"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}