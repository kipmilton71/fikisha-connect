import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, MapPin, Clock, Truck, Star, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import CreateOrderDialog from './CreateOrderDialog';
import TrackOrderDialog from './TrackOrderDialog';
import PaymentDialog from './PaymentDialog';
import RatingDialog from './RatingDialog';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showTrackOrder, setShowTrackOrder] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadOrders();
      loadNearbyDrivers();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('driver_profiles')
        .select(`
          *,
          profiles!inner(full_name, role)
        `)
        .eq('is_available', true)
        .limit(5);

      if (error) throw error;
      setNearbyDrivers(data || []);
    } catch (error: any) {
      console.error('Error loading drivers:', error);
    }
  };

  const handleTrackOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowTrackOrder(true);
  };

  const handlePayOrder = (order: any) => {
    setSelectedOrder(order);
    setShowPayment(true);
  };

  const handleRateOrder = (order: any) => {
    setSelectedOrder(order);
    setShowRating(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customer Dashboard</h1>
          <p className="text-muted-foreground">Manage your deliveries</p>
        </div>
        <Button onClick={() => setShowCreateOrder(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => ['accepted', 'picked_up', 'out_for_delivery'].includes(o.status)).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="drivers">Nearby Drivers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">Start by creating your first delivery order</p>
                <Button onClick={() => setShowCreateOrder(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{order.tracking_code}</CardTitle>
                        <CardDescription>
                          To: {order.receiver_name} • {order.receiver_phone}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {formatStatus(order.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">From</p>
                          <p className="font-medium">{order.pickup_address}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">To</p>
                          <p className="font-medium">{order.delivery_address}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Amount: </span>
                          <span className="font-semibold text-primary">KSh {order.delivery_amount}</span>
                          {order.payment_status && (
                            <Badge 
                              variant={order.payment_status === 'paid' ? 'default' : 'secondary'}
                              className="ml-2"
                            >
                              {order.payment_status}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTrackOrder(order.id)}
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Track
                          </Button>
                          
                          {order.payment_status !== 'paid' && (
                            <Button
                              size="sm"
                              onClick={() => handlePayOrder(order)}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay
                            </Button>
                          )}
                          
                          {order.status === 'delivered' && order.driver_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRateOrder(order)}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Rate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Drivers</CardTitle>
              <CardDescription>
                Drivers currently available in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nearbyDrivers.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No drivers available nearby</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {nearbyDrivers.map((driver) => (
                    <div key={driver.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Truck className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{driver.profiles?.full_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{driver.rating?.toFixed(1) || '0.0'}</span>
                            <span>•</span>
                            <span>{driver.total_deliveries || 0} deliveries</span>
                            <span>•</span>
                            <span>{driver.vehicle_type || 'Vehicle'}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        Available
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateOrderDialog
        open={showCreateOrder}
        onOpenChange={setShowCreateOrder}
      />

      <TrackOrderDialog
        open={showTrackOrder}
        onOpenChange={setShowTrackOrder}
        orderId={selectedOrderId}
      />

      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        orderId={selectedOrder?.id}
        amount={selectedOrder?.delivery_amount || 0}
        onPaymentSuccess={() => {
          loadOrders();
          toast({
            title: "Payment Successful",
            description: "Your payment has been processed successfully"
          });
        }}
      />

      <RatingDialog
        open={showRating}
        onOpenChange={setShowRating}
        orderId={selectedOrder?.id}
        driverId={selectedOrder?.driver_id}
        driverName="Driver" // We'll need to fetch this from profiles
      />
    </div>
  );
};

export default CustomerDashboard;