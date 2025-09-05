import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeliveryConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

const DeliveryConfirmationDialog: React.FC<DeliveryConfirmationDialogProps> = ({ 
  open, 
  onOpenChange, 
  order 
}) => {
  const { toast } = useToast();
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!order) return null;

  const handleCompleteDelivery = async () => {
    if (!confirmationCode.trim()) {
      toast({
        title: "Confirmation code required",
        description: "Please enter the confirmation code provided by the customer",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Implement actual delivery completion logic
      toast({
        title: "Delivery completed!",
        description: `Order ${order.tracking_code} has been marked as delivered successfully.`
      });

      setConfirmationCode('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error completing delivery",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Complete Delivery
          </DialogTitle>
          <DialogDescription>
            Confirm the delivery completion with the customer's code
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{order.tracking_code}</h3>
              <Badge variant="outline">{order.package_description}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              Delivered to: {order.receiver_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.delivery_address}
            </p>
            <p className="text-lg font-bold text-success mt-2">
              KSh {order.delivery_amount}
            </p>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Key className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Confirmation Required</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Ask the customer for their 6-digit confirmation code to complete this delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Code Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmation-code">Customer Confirmation Code</Label>
            <Input
              id="confirmation-code"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="text-center text-lg font-mono tracking-widest"
            />
            <p className="text-xs text-muted-foreground">
              This code is unique to this order and provided by the customer
            </p>
          </div>

          {/* Current Tracking Code Display */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Your tracking code:</p>
            <p className="font-mono text-lg font-bold">{order.tracking_code}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteDelivery}
              className="flex-1"
              disabled={isLoading || !confirmationCode.trim()}
            >
              {isLoading ? "Completing..." : "Complete Delivery"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryConfirmationDialog;