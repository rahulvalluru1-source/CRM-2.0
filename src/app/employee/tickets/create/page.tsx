"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Upload, Camera, MapPin, Clock, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { EmployeeNavigation } from "@/components/employee-navigation"

interface TicketFormData {
  customerType: "existing" | "new"
  customerId?: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCompany: string
  subject: string
  description: string
  status: string
  priority: string
  transferTo?: string
  resolution?: string
  source: string
  attachments: File[]
}

export default function CreateTicketPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [customers, setCustomers] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [generatedTicketId, setGeneratedTicketId] = useState("")
  
  const [formData, setFormData] = useState<TicketFormData>({
    customerType: "existing",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerCompany: "",
    subject: "",
    description: "",
    status: "PENDING",
    priority: "LOW",
    transferTo: "",
    resolution: "",
    source: "PHONE",
    attachments: []
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "EMPLOYEE") {
      router.push("/login")
      return
    }

    // Generate ticket ID
    const ticketId = Math.floor(10000 + Math.random() * 90000).toString()
    setGeneratedTicketId(ticketId)

    // Fetch customers and employees for dropdowns
    fetchCustomers()
    fetchEmployees()
  }, [session, status, router])

  const fetchCustomers = async () => {
    try {
      // Mock data - replace with actual API call
      const mockCustomers = [
        { id: "1", name: "ABC Corporation", email: "contact@abc.com", phone: "123-456-7890" },
        { id: "2", name: "XYZ Solutions", email: "info@xyz.com", phone: "098-765-4321" },
        { id: "3", name: "Tech Industries", email: "support@tech.com", phone: "555-123-4567" }
      ]
      setCustomers(mockCustomers)
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    }
  }

  const fetchEmployees = async () => {
    try {
      // Mock data - replace with actual API call
      const mockEmployees = [
        { id: "1", name: "John Doe", email: "john@crm.com" },
        { id: "2", name: "Jane Smith", email: "jane@crm.com" }
      ]
      setEmployees(mockEmployees)
    } catch (error) {
      console.error("Failed to fetch employees:", error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Customer validation
    if (formData.customerType === "existing" && !formData.customerId) {
      newErrors.customerId = "Please select a customer"
    }
    if (formData.customerType === "new") {
      if (!formData.customerName.trim()) {
        newErrors.customerName = "Customer name is required"
      }
      if (!formData.customerEmail.trim()) {
        newErrors.customerEmail = "Customer email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
        newErrors.customerEmail = "Please enter a valid email address"
      }
      if (!formData.customerPhone.trim()) {
        newErrors.customerPhone = "Customer phone is required"
      }
    }

    // Ticket validation
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }
    if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setLoading(true)
    setErrors({})

    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Ticket #${generatedTicketId} created successfully!`)
      
      // Redirect to My Tickets page
      setTimeout(() => {
        router.push("/employee/tickets")
      }, 1500)
      
    } catch (error) {
      toast.error("Failed to create ticket. Please try again.")
      console.error("Ticket creation error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }))
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <Badge variant="outline">Ticket ID: {generatedTicketId}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Ticket</h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to create a new support ticket
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Customer Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Customer Information</span>
              </CardTitle>
              <CardDescription>
                Select an existing customer or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Type */}
              <div className="space-y-3">
                <Label>Customer Type</Label>
                <RadioGroup
                  value={formData.customerType}
                  onValueChange={(value) => handleInputChange("customerType", value)}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="existing" id="existing" />
                    <Label htmlFor="existing">Existing Customer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new">New Customer</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.customerType === "existing" ? (
                <div className="space-y-2">
                  <Label htmlFor="customerId">Select Customer</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => handleInputChange("customerId", value)}
                  >
                    <SelectTrigger className={errors.customerId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Choose a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.customerId && (
                    <p className="text-sm text-red-500">{errors.customerId}</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange("customerName", e.target.value)}
                      className={errors.customerName ? "border-red-500" : ""}
                      placeholder="Enter customer name"
                    />
                    {errors.customerName && (
                      <p className="text-sm text-red-500">{errors.customerName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerCompany">Company</Label>
                    <Input
                      id="customerCompany"
                      value={formData.customerCompany}
                      onChange={(e) => handleInputChange("customerCompany", e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                      className={errors.customerEmail ? "border-red-500" : ""}
                      placeholder="customer@example.com"
                    />
                    {errors.customerEmail && (
                      <p className="text-sm text-red-500">{errors.customerEmail}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone *</Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                      className={errors.customerPhone ? "border-red-500" : ""}
                      placeholder="+1-234-567-8900"
                    />
                    {errors.customerPhone && (
                      <p className="text-sm text-red-500">{errors.customerPhone}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ticket Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Ticket Details</span>
              </CardTitle>
              <CardDescription>
                Provide detailed information about the ticket
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    className={errors.subject ? "border-red-500" : ""}
                    placeholder="Brief description of the issue"
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-500">{errors.subject}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className={errors.description ? "border-red-500" : ""}
                  placeholder="Provide detailed description of the issue or request..."
                  rows={6}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
                <p className="text-sm text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="ESCALATED">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => handleInputChange("source", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHONE">Phone</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="WEBSITE">Website</SelectItem>
                      <SelectItem value="WALK_IN">Walk In</SelectItem>
                      <SelectItem value="SOCIAL">Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transferTo">Transfer To (Optional)</Label>
                <Select
                  value={formData.transferTo}
                  onValueChange={(value) => handleInputChange("transferTo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee to transfer" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution (Optional)</Label>
                <Textarea
                  id="resolution"
                  value={formData.resolution}
                  onChange={(e) => handleInputChange("resolution", e.target.value)}
                  placeholder="Describe the resolution if applicable..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Attachments</span>
              </CardTitle>
              <CardDescription>
                Add supporting documents or screenshots
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="attachments"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <Label htmlFor="attachments" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG, PDF, DOC, DOCX (max 10MB)
                    </span>
                  </div>
                </Label>
              </div>

              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files</Label>
                  {formData.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Camera className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Ticket
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}