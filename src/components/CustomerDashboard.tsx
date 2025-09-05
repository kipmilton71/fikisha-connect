import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, MapPin, Clock, Truck, Star } from 'lucide-react';
import CreateOrderDialog from '@/components/CreateOrderDialog';
import TrackOrderDialog from '@/components/TrackOrderDialog';

const CustomerDashboard = () => {
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showTrackOrder, setShowTrackOrder] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Mock data - will be replaced with real data
  const recentOrders = [
    {
      id: '1',
      tracking_code: 'FKS12345678',
      receiver_name: 'John Doe',
      pickup_address: 'Downtown Mall',
      delivery_address: 'Westlands Office',
      status: 'pending',
      delivery_amount: 250,
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      tracking_code: 'FKS87654321',
      receiver_name: 'Jane Smith',
      pickup_address: 'CBD Plaza',
      delivery_address: 'Karen Shopping Center',
      status: 'out_for_delivery',
      delivery_amount: 350,
      created_at: '2024-01-14T14:20:00Z'
    }
  ];

  const nearbyDrivers = [
    {
      id: '1',
      full_name: 'Peter Mwangi',
      rating: 4.8,
      total_deliveries: 127,
      vehicle_type: 'Motorcycle',
      distance: '0.5 km away'
    },
    {
      id: '2',
      full_name: 'Mary Wanjiku',
      rating: 4.9,
      total_deliveries: 203,
      vehicle_type: 'Car',
      distance: '1.2 km away'
    }
  ];

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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Manage your deliveries and track packages</p>
        </div>
        <Button onClick={() => setShowCreateOrder(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Order
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => setShowCreateOrder(true)}>
          <CardContent className="p-6 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold">Send Package</h3>
            <p className="text-sm text-muted-foreground">Create a new delivery</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-accent" />
            <h3 className="font-semibold">Track Package</h3>
            <p className="text-sm text-muted-foreground">Monitor delivery status</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Truck className="h-8 w-8 mx-auto mb-2 text-success" />
            <h3 className="font-semibold">Find Drivers</h3>
            <p className="text-sm text-muted-foreground">See nearby drivers</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <h3 className="font-semibold">Order History</h3>
            <p className="text-sm text-muted-foreground">View past deliveries</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="drivers">Nearby Drivers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Track and manage your deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{order.tracking_code}</h4>
                        <Badge className={getStatusColor(order.status)}>
                          {formatStatus(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        To: {order.receiver_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.pickup_address} → {order.delivery_address}
                      </p>
                      <p className="text-sm font-medium text-primary mt-1">
                        KSh {order.delivery_amount}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setShowTrackOrder(true);
                        }}
                      >
                        Track
                      </Button>
                    </div>
                  </div>
                ))}
                {recentOrders.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setShowCreateOrder(true)}
                    >
                      Create your first order
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Drivers Nearby</CardTitle>
              <CardDescription>Connect with drivers in your area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nearbyDrivers.map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-semibold">
                          {driver.full_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{driver.full_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{driver.rating}</span>
                          <span>•</span>
                          <span>{driver.total_deliveries} deliveries</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {driver.vehicle_type} • {driver.distance}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Contact
                    </Button>
                  </div>
                ))}
              </div>
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
    </div>
  );
};

export default CustomerDashboard;