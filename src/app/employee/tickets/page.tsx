'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Download, 
  Calendar,
  User,
  Building,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpDown
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Ticket {
  $id: string;
  ticketId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCompany: string;
  subject: string;
  description: string;
  priority: 'low' | 'high';
  status: 'pending' | 'open' | 'closed' | 'escalate';
  source: 'phone' | 'email' | 'website' | 'walkin' | 'social';
  assignedTo: string;
  assignedToName: string;
  createdBy: string;
  createdByName: string;
  resolution: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

interface Employee {
  $id: string;
  name: string;
  email: string;
  role: string;
}

export default function MyTicketsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '',
    priority: '',
    resolution: '',
    assignedTo: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (user) {
      fetchTickets();
      fetchEmployees();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tickets/my-tickets');
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const filteredAndSortedTickets = tickets
    .filter(ticket => {
      const matchesSearch = 
        ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'priority':
          comparison = a.priority === 'high' ? -1 : 1;
          break;
        case 'status':
          const statusOrder = { pending: 0, open: 1, escalate: 2, closed: 3 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: 'createdAt' | 'priority' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const openTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditForm({
      status: ticket.status,
      priority: ticket.priority,
      resolution: ticket.resolution || '',
      assignedTo: ticket.assignedTo
    });
    setIsDetailsOpen(true);
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/tickets/${selectedTicket.$id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to update ticket');

      await fetchTickets();
      setIsEditOpen(false);
      setIsDetailsOpen(false);
      toast({
        title: 'Success',
        description: 'Ticket updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update ticket',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'escalate': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      case 'escalate': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
              <p className="text-gray-600 mt-1">
                Manage tickets you created or are assigned to
              </p>
            </div>
            <Link href="/employee/tickets/create">
              <Button className="mt-4 sm:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="escalate">Escalated</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tickets ({filteredAndSortedTickets.length})</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center gap-1"
                >
                  <Calendar className="h-4 w-4" />
                  Date
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('priority')}
                  className="flex items-center gap-1"
                >
                  Priority
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1"
                >
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAndSortedTickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <AlertCircle className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first ticket to get started'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Ticket ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Subject</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Priority</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Assigned To</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedTickets.map((ticket) => (
                      <tr key={ticket.$id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">#{ticket.ticketId}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{ticket.customerName}</div>
                            <div className="text-sm text-gray-500">{ticket.customerCompany}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-xs truncate" title={ticket.subject}>
                            {ticket.subject}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(ticket.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(ticket.status)}
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </span>
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={''} />
                              <AvatarFallback className="text-xs">
                                {ticket.assignedToName?.charAt(0) || 'N/A'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{ticket.assignedToName || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openTicketDetails(ticket)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Ticket Details</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  #{selectedTicket?.ticketId}
                </span>
              </DialogTitle>
            </DialogHeader>
            
            {selectedTicket && (
              <div className="space-y-6">
                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Name</Label>
                        <p className="text-gray-900">{selectedTicket.customerName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Company</Label>
                        <p className="text-gray-900">{selectedTicket.customerCompany}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {selectedTicket.customerEmail}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Phone</Label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {selectedTicket.customerPhone}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Ticket Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Subject</Label>
                        <p className="text-gray-900">{selectedTicket.subject}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedTicket.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Status</Label>
                          <Badge className={getStatusColor(selectedTicket.status)}>
                            {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Priority</Label>
                          <Badge className={getPriorityColor(selectedTicket.priority)}>
                            {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Source</Label>
                        <p className="text-gray-900 capitalize">{selectedTicket.source}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Resolution */}
                {selectedTicket.resolution && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Resolution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedTicket.resolution}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Timestamps */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Timestamps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Created</Label>
                        <p className="text-gray-900">
                          {format(new Date(selectedTicket.createdAt), 'PPP p')}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                        <p className="text-gray-900">
                          {format(new Date(selectedTicket.updatedAt), 'PPP p')}
                        </p>
                      </div>
                      {selectedTicket.closedAt && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Closed</Label>
                          <p className="text-gray-900">
                            {format(new Date(selectedTicket.closedAt), 'PPP p')}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailsOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => setIsEditOpen(true)}
                    disabled={selectedTicket.status === 'closed'}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Update Ticket
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Ticket Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Update Ticket</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="escalate">Escalate</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={editForm.priority}
                    onValueChange={(value) => setEditForm({ ...editForm, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="assignedTo">Assign To</Label>
                <Select
                  value={editForm.assignedTo}
                  onValueChange={(value) => setEditForm({ ...editForm, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.$id} value={employee.$id}>
                        {employee.name} ({employee.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="resolution">Resolution / Notes</Label>
                <Textarea
                  id="resolution"
                  placeholder="Add resolution details or notes..."
                  value={editForm.resolution}
                  onChange={(e) => setEditForm({ ...editForm, resolution: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateTicket} disabled={isUpdating}>
                  {isUpdating ? 'Updating...' : 'Update Ticket'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}