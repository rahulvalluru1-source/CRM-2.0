'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Star,
  User,
  Camera,
  CheckCircle,
  XCircle,
  Navigation
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Visit {
  id: string;
  customerName: string;
  visitType: string;
  scheduledTime: string;
  status: 'pending' | 'in_progress' | 'completed';
  location?: string;
  rating?: number;
  summary?: string;
  selfieUrl?: string;
  timestamp?: string;
}

export default function EmployeeVisits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchVisits();
    }
  }, [user]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employee/visits');
      if (response.ok) {
        const data = await response.json();
        setVisits(data);
      }
    } catch (error) {
      console.error('Error fetching visits:', error);
      toast({
        title: 'Error',
        description: 'Failed to load visits',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = visit.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         visit.visitType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || visit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleStartVisit = async (visitId: string) => {
    try {
      const response = await fetch(`/api/employee/visits/${visitId}/start`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: 'Visit Started',
          description: 'Visit has been marked as in progress',
        });
        fetchVisits();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start visit',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteVisit = async (visitId: string) => {
    try {
      const response = await fetch(`/api/employee/visits/${visitId}/complete`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: 'Visit Completed',
          description: 'Visit has been marked as completed',
        });
        fetchVisits();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete visit',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading visits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Visits</h1>
              <p className="text-sm text-gray-600">Manage your customer visits and activities</p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => router.push('/employee')}>
                Back to Dashboard
              </Button>
              <Button onClick={() => router.push('/employee/visits/create')}>
                <Plus className="h-4 w-4 mr-2" />
                New Visit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by customer name or visit type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visits List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading visits...</p>
            </div>
          ) : filteredVisits.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No visits found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Get started by creating your first visit'}
                </p>
                <Button onClick={() => router.push('/employee/visits/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Visit
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredVisits.map((visit) => (
              <Card key={visit.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{visit.customerName}</h3>
                        <Badge className={getStatusColor(visit.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(visit.status)}
                            {visit.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(visit.scheduledTime), 'MMM d, yyyy h:mm a')}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {visit.location || 'No location specified'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          {visit.visitType}
                        </div>
                        {visit.rating && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {visit.rating}/5
                          </div>
                        )}
                      </div>
                      
                      {visit.summary && (
                        <p className="text-gray-700 mb-4">{visit.summary}</p>
                      )}
                      
                      {visit.selfieUrl && (
                        <div className="mb-4">
                          <img 
                            src={visit.selfieUrl} 
                            alt="Visit selfie" 
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {visit.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStartVisit(visit.id)}
                          className="whitespace-nowrap"
                        >
                          <Navigation className="h-4 w-4 mr-2" />
                          Start Visit
                        </Button>
                      )}
                      {visit.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleCompleteVisit(visit.id)}
                          className="whitespace-nowrap"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/employee/visits/${visit.id}`)}
                        className="whitespace-nowrap"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}