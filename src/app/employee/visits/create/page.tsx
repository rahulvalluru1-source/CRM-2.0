'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Calendar, 
  Clock, 
  User,
  Building,
  Phone,
  Mail
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

export default function CreateVisitPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [visitData, setVisitData] = useState({
    visitType: '',
    scheduledTime: '',
    location: '',
    notes: ''
  });
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCustomers();
    }
  }, [user]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/employee/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let customerId = selectedCustomer;
      
      // Create new customer if needed
      if (isNewCustomer && newCustomer.name) {
        const customerResponse = await fetch('/api/employee/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCustomer)
        });
        
        if (customerResponse.ok) {
          const customer = await customerResponse.json();
          customerId = customer.id;
        } else {
          throw new Error('Failed to create customer');
        }
      }

      if (!customerId) {
        throw new Error('Please select or create a customer');
      }

      // Create visit
      const visitResponse = await fetch('/api/employee/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          visitType: visitData.visitType,
          scheduledTime: new Date(visitData.scheduledTime).toISOString(),
          location: visitData.location,
          notes: visitData.notes
        })
      });

      if (visitResponse.ok) {
        toast({
          title: 'Success',
          description: 'Visit created successfully',
        });
        router.push('/employee/visits');
      } else {
        throw new Error('Failed to create visit');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create visit',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/employee/visits')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Visits
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Visit</h1>
                <p className="text-sm text-gray-600">Schedule a new customer visit</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Selection */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Customer Type</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={!isNewCustomer ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsNewCustomer(false)}
                    >
                      Existing Customer
                    </Button>
                    <Button
                      type="button"
                      variant={isNewCustomer ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsNewCustomer(true)}
                    >
                      New Customer
                    </Button>
                  </div>
                </div>

                {!isNewCustomer ? (
                  <div>
                    <Label htmlFor="customer">Select Customer</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a customer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {selectedCustomer && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        {(() => {
                          const customer = customers.find(c => c.id === selectedCustomer);
                          return customer ? (
                            <div className="space-y-1">
                              <p className="font-medium">{customer.name}</p>
                              {customer.company && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {customer.company}
                                </p>
                              )}
                              {customer.email && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {customer.email}
                                </p>
                              )}
                              {customer.phone && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone}
                                </p>
                              )}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="customerName">Customer Name *</Label>
                      <Input
                        id="customerName"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter customer name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerCompany">Company</Label>
                      <Input
                        id="customerCompany"
                        value={newCustomer.company}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone">Phone</Label>
                      <Input
                        id="customerPhone"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Visit Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Visit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="visitType">Visit Type *</Label>
                    <Select value={visitData.visitType} onValueChange={(value) => setVisitData(prev => ({ ...prev, visitType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select visit type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales Visit">Sales Visit</SelectItem>
                        <SelectItem value="Support Visit">Support Visit</SelectItem>
                        <SelectItem value="Installation">Installation</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Demo">Demo</SelectItem>
                        <SelectItem value="Training">Training</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="scheduledTime">Scheduled Date & Time *</Label>
                    <Input
                      id="scheduledTime"
                      type="datetime-local"
                      value={visitData.scheduledTime}
                      onChange={(e) => setVisitData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      min={getCurrentDateTime()}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={visitData.location}
                    onChange={(e) => setVisitData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter visit location"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Visit Notes</Label>
                  <Textarea
                    id="notes"
                    value={visitData.notes}
                    onChange={(e) => setVisitData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes about this visit..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/employee/visits')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Creating...' : 'Create Visit'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
}