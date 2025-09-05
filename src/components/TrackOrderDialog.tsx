import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Clock, CheckCircle, Truck, User } from 'lucide-react';

interface TrackOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
}

const TrackOrderDialog: React.FC<TrackOrderDialogProps> = ({ open, onOpenChange, orderId }) => {
  // Mock order data - will be replaced with real data
  const orderData = {
    id: '1',
    tracking_code: 'FKS12345678',
    receiver_name: 'John Doe',
    receiver_phone: '+254712345678',
    pickup_address: 'Downtown Mall, 2nd Floor',
    delivery_address: 'Westlands Office Tower, Suite 405',
    package_description: 'Documents package',
    delivery_amount: 250,
    status: 'out_for_delivery',
    driver: {
      name: 'Peter Mwangi',
      phone: '+254700123456',
      vehicle_type: 'Motorcycle',
      rating: 4.8
    },
    timeline: [
      {
        status: 'Order Created',
        time: '10:30 AM',
        completed: true,
        icon: Package
      },
      {
        status: 'Driver Assigned',
        time: '10:45 AM',
        completed: true,
        icon: User
      },
      {
        status: 'Package Picked Up',
        time: '11:15 AM',
        completed: true,
        icon: CheckCircle
      },
      {
        status: 'Out for Delivery',
        time: '11:30 AM',
        completed: true,
        icon: Truck
      },
      {
        status: 'Delivered',
        time: 'Pending',
        completed: false,
        icon: MapPin
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-success text-success-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!orderId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Track Order
          </DialogTitle>
          <DialogDescription>
            Track your package delivery in real-time
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{orderData.tracking_code}</h3>
              <Badge className={getStatusColor(orderData.status)}>
                {formatStatus(orderData.status)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">To</p>
                <p className="font-medium">{orderData.receiver_name}</p>
                <p className="text-muted-foreground">{orderData.receiver_phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium text-primary">KSh {orderData.delivery_amount}</p>
              </div>
            </div>
          </div>

          {/* Driver Information */}
          {orderData.driver && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Your Driver
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{orderData.driver.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {orderData.driver.vehicle_type} • Rating: {orderData.driver.rating}⭐
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="text-sm font-medium">{orderData.driver.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Addresses */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
              <div>
                <p className="text-sm font-medium">Pickup Location</p>
                <p className="text-sm text-muted-foreground">{orderData.pickup_address}</p>
              </div>
            </div>
            
            <div className="ml-6 border-l-2 border-dashed border-muted h-4"></div>
            
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
              <div>
                <p className="text-sm font-medium">Delivery Location</p>
                <p className="text-sm text-muted-foreground">{orderData.delivery_address}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <h4 className="font-semibold">Delivery Timeline</h4>
            <div className="space-y-3">
              {orderData.timeline.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.completed 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        item.completed ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {item.status}
                      </p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                    {item.completed && (
                      <CheckCircle className="h-4 w-4 text-success" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Package Description */}
          {orderData.package_description && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-1">Package Description</p>
              <p className="text-sm text-muted-foreground">{orderData.package_description}</p>
            </div>
          )}

          {/* Live Location (Placeholder) */}
          {orderData.status === 'out_for_delivery' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-blue-800">Live Tracking</p>
              </div>
              <p className="text-sm text-blue-700">
                Your driver is on the way! Estimated arrival: 15-20 minutes
              </p>
              <div className="mt-3 bg-blue-100 rounded p-3 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-xs text-blue-600">Live map integration would appear here</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrackOrderDialog;