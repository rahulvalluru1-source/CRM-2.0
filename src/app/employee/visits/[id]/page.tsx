'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Star, 
  Camera,
  Navigation,
  CheckCircle,
  XCircle,
  Save,
  ArrowLeft,
  Phone,
  Mail,
  Building
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface VisitDetail {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerCompany?: string;
  visitType: string;
  scheduledTime: string;
  status: 'pending' | 'in_progress' | 'completed';
  location?: string;
  coordinates?: string;
  rating?: number;
  summary?: string;
  selfieUrl?: string;
  signatureUrl?: string;
  timestamp?: string;
  createdAt: string;
}

export default function VisitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    summary: '',
    rating: 5,
  });

  useEffect(() => {
    if (user && params.id) {
      fetchVisitDetail();
    }
  }, [user, params.id]);

  const fetchVisitDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employee/visits/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setVisit(data);
        setFormData({
          summary: data.summary || '',
          rating: data.rating || 5,
        });
      } else {
        throw new Error('Visit not found');
      }
    } catch (error) {
      console.error('Error fetching visit:', error);
      toast({
        title: 'Error',
        description: 'Failed to load visit details',
        variant: 'destructive',
      });
      router.push('/employee/visits');
    } finally {
      setLoading(false);
    }
  };

  const handleStartVisit = async () => {
    try {
      const response = await fetch(`/api/employee/visits/${params.id}/start`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: 'Visit Started',
          description: 'Visit has been marked as in progress',
        });
        fetchVisitDetail();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start visit',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteVisit = async () => {
    try {
      const response = await fetch(`/api/employee/visits/${params.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast({
          title: 'Visit Completed',
          description: 'Visit has been marked as completed',
        });
        setIsEditing(false);
        fetchVisitDetail();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete visit',
        variant: 'destructive',
      });
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/employee/visits/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Visit updated successfully',
        });
        setIsEditing(false);
        fetchVisitDetail();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update visit',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = async (type: 'selfie' | 'signature') => {
    // In a real app, this would upload to a service like Cloudinary
    toast({
      title: 'Feature Coming Soon',
      description: `${type} upload will be available soon`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading visit...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading visit details...</p>
        </div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Visit Not Found</h2>
          <Button onClick={() => router.push('/employee/visits')}>
            Back to Visits
          </Button>
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
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/employee/visits')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Visits
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Visit Details</h1>
                <p className="text-sm text-gray-600">{visit.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={getStatusColor(visit.status)}>
                {visit.status.replace('_', ' ').toUpperCase()}
              </Badge>
              {visit.status === 'pending' && (
                <Button onClick={handleStartVisit}>
                  <Navigation className="h-4 w-4 mr-2" />
                  Start Visit
                </Button>
              )}
              {visit.status === 'in_progress' && (
                <Button onClick={handleCompleteVisit}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Visit
                </Button>
              )}
              {visit.status === 'completed' && !isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Details
                </Button>
              )}
              {isEditing && (
                <Button onClick={handleSaveChanges}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{visit.customerName}</h3>
                {visit.customerCompany && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {visit.customerCompany}
                  </p>
                )}
              </div>
              
              {visit.customerEmail && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${visit.customerEmail}`} className="text-blue-600 hover:underline">
                    {visit.customerEmail}
                  </a>
                </div>
              )}
              
              {visit.customerPhone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${visit.customerPhone}`} className="text-blue-600 hover:underline">
                    {visit.customerPhone}
                  </a>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  Scheduled Time
                </div>
                <p className="font-medium">
                  {format(new Date(visit.scheduledTime), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              
              {visit.location && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </div>
                  <p className="text-sm">{visit.location}</p>
                </div>
              )}
              
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <User className="h-4 w-4" />
                  Visit Type
                </div>
                <Badge variant="outline">{visit.visitType}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Visit Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Visit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div>
                <Label htmlFor="summary">Visit Summary</Label>
                {isEditing ? (
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Describe what happened during the visit..."
                    rows={4}
                  />
                ) : (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md min-h-[100px]">
                    {visit.summary || (
                      <p className="text-gray-500 italic">No summary provided</p>
                    )}
                  </div>
                )}
              </div>

              {/* Rating */}
              {visit.status === 'completed' && (
                <div>
                  <Label>Customer Rating</Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= formData.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {formData.rating} out of 5
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 ${
                            star <= (visit.rating || 0)
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {visit.rating || 0} out of 5
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Photo Evidence */}
              <div>
                <Label>Photo Evidence</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Selfie</p>
                    {visit.selfieUrl ? (
                      <img 
                        src={visit.selfieUrl} 
                        alt="Visit selfie" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleImageUpload('selfie')}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Add Selfie
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Customer Signature</p>
                    {visit.signatureUrl ? (
                      <img 
                        src={visit.signatureUrl} 
                        alt="Customer signature" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleImageUpload('signature')}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Add Signature
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              {visit.timestamp && (
                <div>
                  <Label>Completed At</Label>
                  <p className="mt-2 text-sm text-gray-600">
                    {format(new Date(visit.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}