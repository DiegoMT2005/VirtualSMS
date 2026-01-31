'use client';

import { useState } from 'react';
import { useAppointments } from '@/lib/hooks/useAppointments';
import { useUserProfile } from '@/lib/hooks/useAuth';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { useCreateBooking } from '@/lib/hooks/useBookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import { Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface AppointmentFilters {
  customer_name?: string;
  customer_phone?: string;
  status?: string;
  source?: string;
  date_from?: string;
  date_to?: string;
  client_id?: string;
}

// Simple service types for laundry business
const SERVICE_TYPES = [
  { id: 'wash-fold', name: 'Wash & Fold', basePrice: 25, pricePerLoad: 15 },
  { id: 'dry-cleaning', name: 'Dry Cleaning', basePrice: 35, pricePerLoad: 20 },
  { id: 'wash-iron', name: 'Wash & Iron', basePrice: 30, pricePerLoad: 18 },
  { id: 'pickup-delivery', name: 'Pickup & Delivery', basePrice: 20, pricePerLoad: 12 },
];

export default function AppointmentsPage() {
  const { data: profile } = useUserProfile();
  const [page, setPage] = useState(1);
  const [filters] = useState<AppointmentFilters>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    service_type: '',
    title: '',
    scheduled_at: '',
    number_of_loads: 1,
    special_instructions: '',
  });

  const { data, isLoading } = useAppointments(filters, page, 20);
  const { data: customersData } = useCustomers({ client_id: profile?.client_id || undefined }, 1, 100);
  const createBooking = useCreateBooking();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCustomer = customersData?.data.find(c => c.id === formData.customer_id);
    const selectedService = SERVICE_TYPES.find(s => s.id === formData.service_type);
    
    if (!selectedCustomer || !selectedService) {
      toast({
        title: 'Error',
        description: 'Please select a customer and service',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const paymentAmount = selectedService.basePrice + (selectedService.pricePerLoad * formData.number_of_loads);
      
      await createBooking.mutateAsync({
        client_id: profile?.client_id!,
        customer_name: selectedCustomer.name || '',
        customer_email: selectedCustomer.email || '',
        customer_phone: selectedCustomer.phone,
        service_type: selectedService.name,
        appointment_date: formData.scheduled_at.split('T')[0],
        appointment_time: formData.scheduled_at.split('T')[1] || '09:00',
        status: 'scheduled',
        source: 'manual',
        notes: formData.special_instructions || null,
        title: formData.title || selectedService.name,
        scheduled_at: new Date(formData.scheduled_at).toISOString(),
        duration_minutes: 30,
        pickup_address: selectedCustomer.address || '',
        number_of_loads: formData.number_of_loads,
        payment_status: 'pending',
        payment_amount: paymentAmount,
        payment_currency: 'CAD',
        reminder_sent: false,
        confirmation_sent: false,
      } as any);
      
      toast({
        title: 'Success',
        description: 'Appointment created successfully',
      });
      
      setIsDialogOpen(false);
      setFormData({
        customer_id: '',
        service_type: '',
        title: '',
        scheduled_at: '',
        number_of_loads: 1,
        special_instructions: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create appointment',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage all bookings and appointments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Appointment</DialogTitle>
                <DialogDescription>Schedule a new appointment for a customer</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_id">Customer *</Label>
                    <Select
                      value={formData.customer_id}
                      onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                      required
                    >
                      <SelectTrigger id="customer_id">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customersData?.data.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name || customer.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_type">Service Type *</Label>
                    <Select
                      value={formData.service_type}
                      onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                      required
                    >
                      <SelectTrigger id="service_type">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - ${service.basePrice} + ${service.pricePerLoad}/load
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Laundry Pickup (optional)"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_at">Date & Time *</Label>
                    <Input
                      id="scheduled_at"
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number_of_loads">Number of Loads *</Label>
                    <Input
                      id="number_of_loads"
                      type="number"
                      min="1"
                      value={formData.number_of_loads}
                      onChange={(e) => setFormData({ ...formData, number_of_loads: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="special_instructions">Special Instructions</Label>
                  <Textarea
                    id="special_instructions"
                    value={formData.special_instructions}
                    onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                    placeholder="Any special requests or notes..."
                    rows={3}
                  />
                </div>
                
                {formData.service_type && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">Estimated Total:</p>
                    <p className="text-2xl font-bold">
                      ${(SERVICE_TYPES.find(s => s.id === formData.service_type)?.basePrice || 0) + 
                        ((SERVICE_TYPES.find(s => s.id === formData.service_type)?.pricePerLoad || 0) * formData.number_of_loads)}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBooking.isPending}>
                  {createBooking.isPending ? 'Creating...' : 'Create Appointment'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {data?.pagination.total || 0} Total Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {data?.data.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">
                            {appointment.title || appointment.service_type}
                          </h3>
                          <Badge className={getStatusColor(appointment.status)} variant="secondary">
                            {appointment.status}
                          </Badge>
                          {appointment.payment_status && (
                            <Badge className={getPaymentStatusColor(appointment.payment_status)} variant="secondary">
                              {appointment.payment_status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {appointment.customer_name} • {appointment.customer_phone}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {appointment.scheduled_at 
                            ? formatDateTime(appointment.scheduled_at)
                            : `${appointment.appointment_date} at ${appointment.appointment_time}`
                          }
                          {appointment.duration_minutes && ` • ${appointment.duration_minutes} min`}
                        </p>
                        {appointment.pickup_address && (
                          <p className="text-sm text-gray-500 mt-1">
                            📍 {appointment.pickup_address}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {appointment.payment_amount && (
                        <p className="text-lg font-bold">
                          {formatCurrency(appointment.payment_amount, appointment.payment_currency || 'CAD')}
                        </p>
                      )}
                      {appointment.number_of_loads && (
                        <p className="text-sm text-gray-600">
                          {appointment.number_of_loads} loads
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= data.pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
