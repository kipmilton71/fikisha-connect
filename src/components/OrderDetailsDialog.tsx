import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Phone, Navigation } from 'lucide-react';

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onAccept: (order: any) => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({ 
  open, 
  onOpenChange, 
  order,
  onAccept 
}) => {
  if (!order) return null;

  const handleAccept = () => {
    onAccept(order);
    onOpenChange(false);
  };

  const openInMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Order Details
          </DialogTitle>
          <DialogDescription>
            Review the order details before accepting
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-primary">KSh {order.delivery_amount}</h3>
              <p className="text-sm text-muted-foreground">{order.tracking_code}</p>
              <p className="text-sm text-muted-foreground">{order.distance}</p>
            </div>
            <Badge variant="outline" className="text-sm">
              {order.package_description}
            </Badge>
          </div>

          {/* Customer Information */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold mb-2">Customer Details</h4>
            <div className="space-y-1">
              <p className="font-medium">{order.receiver_name}</p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{order.receiver_phone}</p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-4">
            {/* Pickup Location */}
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Pickup Location</p>
                    <p className="text-sm text-muted-foreground">{order.pickup_address}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openInMaps(order.pickup_address)}
                    className="h-8 w-8 p-0"
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Connection Line */}
            <div className="ml-6 border-l-2 border-dashed border-muted h-6"></div>
            
            {/* Drop-off Location */}
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-700">Drop-off Location</p>
                    <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openInMaps(order.delivery_address)}
                    className="h-8 w-8 p-0"
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Package Information */}
          {order.package_description && (
            <div className="p-3 bg-accent/10 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">Package Information</h4>
              <p className="text-sm text-muted-foreground">{order.package_description}</p>
            </div>
          )}

          {/* Distance & Earnings Breakdown */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="font-semibold">{order.distance}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Earnings</p>
              <p className="font-semibold text-primary">KSh {order.delivery_amount}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAccept}
              className="flex-1"
            >
              Accept Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;