import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Package, 
  Star, 
  Navigation, 
  Clock, 
  DollarSign,
  CheckCircle,
  Phone,
  MessageCircle,
  Weight
} from 'lucide-react';
import OrderDetailsDialog from '@/components/OrderDetailsDialog';
import DeliveryConfirmationDialog from '@/components/DeliveryConfirmationDialog';
import OrderChatDialog from '@/components/OrderChatDialog';

const DriverDashboard = () => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showDeliveryConfirmation, setShowDeliveryConfirmation] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Mock data - will be replaced with real data
  const availableOrders = [
    {
      id: '1',
      tracking_code: 'FKS12345678',
      receiver_name: 'John Doe',
      receiver_phone: '+254712345678',
      pickup_address: 'Downtown Mall, 2nd Floor',
      pickup_latitude: -1.2921,
      pickup_longitude: 36.8219,
      delivery_address: 'Westlands Office Tower, Suite 405',
      delivery_latitude: -1.2634,
      delivery_longitude: 36.8050,
      package_description: 'Documents package',
      product_category: 'documents',
      product_weight: 0.5,
      delivery_amount: 250,
      distance: '2.5 km',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      tracking_code: 'FKS87654321',
      receiver_name: 'Jane Smith',
      receiver_phone: '+254798765432',
      pickup_address: 'CBD Plaza, Ground Floor',
      pickup_latitude: -1.2847,
      pickup_longitude: 36.8173,
      delivery_address: 'Karen Shopping Center',
      delivery_latitude: -1.3197,
      delivery_longitude: 36.7025,
      package_description: 'Electronics',
      product_category: 'electronics',
      product_weight: 1.2,
      delivery_amount: 350,
      distance: '4.2 km',
      created_at: '2024-01-14T14:20:00Z'
    }
  ];

  const activeDeliveries = [
    {
      id: '3',
      tracking_code: 'FKS11111111',
      receiver_name: 'Mike Johnson',
      receiver_phone: '+254700111222',
      pickup_address: 'Town Center Mall',
      delivery_address: 'Kilimani Heights',
      package_description: 'Fashion items',
      product_category: 'clothing',
      product_weight: 0.8,
      delivery_amount: 400,
      status: 'picked_up',
      confirmation_code: 'ABC123',
      sender_id: '123',
      sender_name: 'Mike Johnson',
      sender_phone: '+254700111222'
    }
  ];

  const stats = {
    todayEarnings: 1250,
    todayDeliveries: 5,
    rating: 4.8,
    totalDeliveries: 127
  };

  const handleAcceptOrder = (order: any) => {
    // TODO: Implement order acceptance logic
    console.log('Accepting order:', order.id);
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCompleteDelivery = (order: any) => {
    setSelectedOrder(order);
    setShowDeliveryConfirmation(true);
  };

  const handleChatWithCustomer = (order: any) => {
    setSelectedOrder(order);
    setShowChat(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with availability toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Driver Dashboard</h1>
          <p className="text-muted-foreground">Manage your deliveries and earnings</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Available for deliveries</span>
          <Switch 
            checked={isAvailable} 
            onCheckedChange={setIsAvailable}
          />
          <Badge variant={isAvailable ? "default" : "secondary"}>
            {isAvailable ? "Online" : "Offline"}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-full">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Earnings</p>
                <p className="text-2xl font-bold">KSh {stats.todayEarnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Deliveries</p>
                <p className="text-2xl font-bold">{stats.todayDeliveries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold">{stats.rating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-full">
                <CheckCircle className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deliveries</p>
                <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Available Orders</TabsTrigger>
          <TabsTrigger value="active">Active Deliveries</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders Near You</CardTitle>
              <CardDescription>Accept orders that match your location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isAvailable ? (
                  availableOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">KSh {order.delivery_amount}</h4>
                          <p className="text-sm text-muted-foreground">{order.distance} • {order.tracking_code}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{order.product_category}</Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Weight className="h-3 w-3" />
                            {order.product_weight}kg
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Pickup</p>
                            <p className="text-sm text-muted-foreground">{order.pickup_address}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Drop-off</p>
                            <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                            <p className="text-sm text-muted-foreground">To: {order.receiver_name}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={() => handleViewOrder(order)}
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                        >
                          <Navigation className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button 
                          onClick={() => handleAcceptOrder(order)}
                          size="sm"
                          className="flex-1"
                        >
                          Accept Order
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold mb-2">You're offline</p>
                    <p className="text-muted-foreground mb-4">Turn on availability to see orders</p>
                    <Button onClick={() => setIsAvailable(true)}>Go Online</Button>
                  </div>
                )}
                
                {isAvailable && availableOrders.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold mb-2">No orders available</p>
                    <p className="text-muted-foreground">Check back soon for new delivery opportunities</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Deliveries</CardTitle>
              <CardDescription>Orders you're currently delivering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeDeliveries.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg">KSh {order.delivery_amount}</h4>
                        <p className="text-sm text-muted-foreground">{order.tracking_code}</p>
                        <Badge className="mt-1 bg-orange-100 text-orange-800">
                          {order.status === 'picked_up' ? 'Picked Up' : 'Out for Delivery'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{order.product_category}</Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Weight className="h-3 w-3" />
                          {order.product_weight}kg
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Deliver to</p>
                          <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                          <p className="text-sm text-muted-foreground">To: {order.receiver_name}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`tel:${order.receiver_phone}`)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleChatWithCustomer(order)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat
                      </Button>
                      <Button 
                        onClick={() => handleCompleteDelivery(order)}
                        size="sm"
                        className="flex-1"
                      >
                        Complete
                      </Button>
                    </div>
                  </div>
                ))}
                
                {activeDeliveries.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold mb-2">No active deliveries</p>
                    <p className="text-muted-foreground">Accept orders to start delivering</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <OrderDetailsDialog 
        open={showOrderDetails} 
        onOpenChange={setShowOrderDetails}
        order={selectedOrder}
        onAccept={handleAcceptOrder}
      />
      
      <DeliveryConfirmationDialog 
        open={showDeliveryConfirmation} 
        onOpenChange={setShowDeliveryConfirmation}
        order={selectedOrder}
      />
      
      <OrderChatDialog 
        open={showChat} 
        onOpenChange={setShowChat}
        order={selectedOrder}
        otherParty={{
          id: selectedOrder?.sender_id || '',
          name: selectedOrder?.sender_name || 'Customer',
          phone: selectedOrder?.sender_phone || selectedOrder?.receiver_phone || ''
        }}
      />
    </div>
  );
};

export default DriverDashboard;