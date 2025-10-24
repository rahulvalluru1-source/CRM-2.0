"use client"

import { useEffect, useState } from "react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Ticket, User, AlertTriangle } from "lucide-react"

export default function CreateTicketPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customers, setCustomers] = useState([])
  const [users, setUsers] = useState([])
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [message, setMessage] = useState("")
  const [ticketData, setTicketData] = useState({
    customerType: "existing",
    customerId: "",
    subject: "",
    description: "",
    priority: "LOW",
    transferTo: "",
    source: "",
    resolution: ""
  })
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    company: "",
    licenseNo: "",
    phone: "",
    email: ""
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    fetchCustomers()
    fetchUsers()
    setLoading(false)
  }, [session, status, router])

  const fetchCustomers = async () => {
    try {
      // This will be implemented with actual API calls
      // Mock data for now
      setCustomers([
        { id: "1", name: "ABC Corporation", company: "ABC Corp", licenseNo: "LIC001" },
        { id: "2", name: "XYZ Industries", company: "XYZ Ltd", licenseNo: "LIC002" },
        { id: "3", name: "StartUp Inc", company: "StartUp", licenseNo: "LIC003" }
      ])
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      // This will be implemented with actual API calls
      // Mock data for now
      setUsers([
        { id: "1", name: "John Doe", role: "EMPLOYEE" },
        { id: "2", name: "Jane Smith", role: "SUPPORT" },
        { id: "3", name: "Bob Johnson", role: "SALES" }
      ])
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  const generateTicketId = () => {
    return Math.floor(10000 + Math.random() * 90000).toString()
  }

  const handleCreateCustomer = async () => {
    try {
      // Validate new customer data
      if (!newCustomer.name || !newCustomer.phone || !newCustomer.email) {
        setMessage("Please fill in all required fields")
        return
      }

      // This will be implemented with actual API calls
      const newCustomerData = {
        id: Date.now().toString(),
        ...newCustomer
      }

      setCustomers([...customers, newCustomerData])
      setTicketData({...ticketData, customerId: newCustomerData.id})
      setShowCustomerDialog(false)
      setNewCustomer({ name: "", company: "", licenseNo: "", phone: "", email: "" })
      setMessage("Customer created successfully!")
    } catch (error) {
      setMessage("Failed to create customer")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      const ticketId = generateTicketId()
      
      // This will be implemented with actual API calls
      const ticket = {
        id: Date.now().toString(),
        ticketId,
        ...ticketData,
        createdBy: session?.user?.id,
        createdAt: new Date().toISOString()
      }

      console.log("Creating ticket:", ticket)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage(`Ticket ${ticketId} created successfully!`)
      
      // Reset form
      setTicketData({
        customerType: "existing",
        customerId: "",
        subject: "",
        description: "",
        priority: "LOW",
        transferTo: "",
        source: "",
        resolution: ""
      })

      // Redirect after delay
      setTimeout(() => {
        router.push("/tickets")
      }, 2000)
    } catch (error) {
      setMessage("Failed to create ticket")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Create Ticket</h1>
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Back
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Ticket className="h-5 w-5 mr-2" />
              Create New Ticket
            </CardTitle>
            <CardDescription>
              Fill in the details to create a new support ticket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Type */}
              <div className="space-y-2">
                <Label>Customer Type</Label>
                <RadioGroup
                  value={ticketData.customerType}
                  onValueChange={(value) => setTicketData({...ticketData, customerType: value})}
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

              {/* Customer Selection */}
              {ticketData.customerType === "existing" ? (
                <div className="space-y-2">
                  <Label htmlFor="customer">Select Customer</Label>
                  <Select
                    value={ticketData.customerId}
                    onValueChange={(value) => setTicketData({...ticketData, customerId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>New Customer Details</Label>
                    <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline">
                          <User className="h-4 w-4 mr-2" />
                          Create Customer
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Customer</DialogTitle>
                          <DialogDescription>
                            Fill in the customer details
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="custName">Name *</Label>
                              <Input
                                id="custName"
                                value={newCustomer.name}
                                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="custCompany">Company</Label>
                              <Input
                                id="custCompany"
                                value={newCustomer.company}
                                onChange={(e) => setNewCustomer({...newCustomer, company: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="custLicense">License No.</Label>
                              <Input
                                id="custLicense"
                                value={newCustomer.licenseNo}
                                onChange={(e) => setNewCustomer({...newCustomer, licenseNo: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="custPhone">Phone *</Label>
                              <Input
                                id="custPhone"
                                value={newCustomer.phone}
                                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="custEmail">Email *</Label>
                            <Input
                              id="custEmail"
                              type="email"
                              value={newCustomer.email}
                              onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                            />
                          </div>
                          <Button onClick={handleCreateCustomer} className="w-full">
                            Create Customer
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {ticketData.customerId && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Customer created and selected
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={ticketData.subject}
                  onValueChange={(value) => setTicketData({...ticketData, subject: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPPORT">Support</SelectItem>
                    <SelectItem value="LEAD_MARKETING_EXISTING">Lead Marketing (Existing)</SelectItem>
                    <SelectItem value="LEAD_MARKETING_NEW">Lead Marketing (New)</SelectItem>
                    <SelectItem value="DEMO">Demo</SelectItem>
                    <SelectItem value="INSTALLATION">Installation</SelectItem>
                    <SelectItem value="SALES">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue or request..."
                  value={ticketData.description}
                  onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
                  rows={4}
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <RadioGroup
                  value={ticketData.priority}
                  onValueChange={(value) => setTicketData({...ticketData, priority: value})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="HIGH" id="high" />
                    <Label htmlFor="high">High</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="LOW" id="low" />
                    <Label htmlFor="low">Low</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Transfer To */}
              <div className="space-y-2">
                <Label htmlFor="transferTo">Transfer To</Label>
                <Select
                  value={ticketData.transferTo}
                  onValueChange={(value) => setTicketData({...ticketData, transferTo: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not Applicable</SelectItem>
                    {users.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Resolution (if not transferred) */}
              {!ticketData.transferTo && (
                <div className="space-y-2">
                  <Label htmlFor="resolution">Resolution</Label>
                  <Textarea
                    id="resolution"
                    placeholder="Enter resolution details..."
                    value={ticketData.resolution}
                    onChange={(e) => setTicketData({...ticketData, resolution: e.target.value})}
                    rows={3}
                  />
                </div>
              )}

              {/* Source */}
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  placeholder="e.g., call, email, chat, referral"
                  value={ticketData.source}
                  onChange={(e) => setTicketData({...ticketData, source: e.target.value})}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !ticketData.customerId || !ticketData.subject}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Ticket className="h-4 w-4 mr-2" />
                  )}
                  Create Ticket
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}