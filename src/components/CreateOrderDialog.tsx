import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [packageDescription, setPackageDescription] = useState('');
  const [deliveryAmount, setDeliveryAmount] = useState('');

  const resetForm = () => {
    setReceiverName('');
    setReceiverPhone('');
    setPickupAddress('');
    setDeliveryAddress('');
    setPackageDescription('');
    setDeliveryAmount('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    
    try {
      // For demo purposes, using dummy coordinates
      // In a real app, you'd geocode the addresses
      const pickupLat = -1.2921 + (Math.random() - 0.5) * 0.01;
      const pickupLng = 36.8219 + (Math.random() - 0.5) * 0.01;
      const deliveryLat = -1.2634 + (Math.random() - 0.5) * 0.01;
      const deliveryLng = 36.8050 + (Math.random() - 0.5) * 0.01;

      const { data, error } = await supabase
        .from('orders')
        .insert({
          sender_id: user.id,
          receiver_name: receiverName,
          receiver_phone: receiverPhone,
          pickup_address: pickupAddress,
          pickup_latitude: pickupLat,
          pickup_longitude: pickupLng,
          delivery_address: deliveryAddress,
          delivery_latitude: deliveryLat,
          delivery_longitude: deliveryLng,
          package_description: packageDescription || '',
          delivery_amount: parseFloat(deliveryAmount)
        } as any)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Order created successfully!",
        description: `Your order ${data.tracking_code} has been created and is now available for drivers to accept.`
      });

      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Error creating order",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Create New Order
          </DialogTitle>
          <DialogDescription>
            Fill in the details to create a new delivery order
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Receiver Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Receiver Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="receiver-name">Receiver Name *</Label>
                <Input
                  id="receiver-name"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiver-phone">Phone Number *</Label>
                <Input
                  id="receiver-phone"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  placeholder="+254712345678"
                  required
                />
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Addresses
            </h3>
            <div className="space-y-2">
              <Label htmlFor="pickup-address">Pickup Address *</Label>
              <Input
                id="pickup-address"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Downtown Mall, 2nd Floor, Shop 205"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-address">Delivery Address *</Label>
              <Input
                id="delivery-address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Westlands Office Tower, Suite 405"
                required
              />
            </div>
          </div>

          {/* Package Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Package Details</h3>
            <div className="space-y-2">
              <Label htmlFor="package-description">Package Description</Label>
              <Textarea
                id="package-description"
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                placeholder="Documents, Electronics, Food, etc."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-amount">Delivery Amount (KSh) *</Label>
              <Input
                id="delivery-amount"
                type="number"
                min="50"
                step="10"
                value={deliveryAmount}
                onChange={(e) => setDeliveryAmount(e.target.value)}
                placeholder="250"
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum delivery fee is KSh 50
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderDialog;