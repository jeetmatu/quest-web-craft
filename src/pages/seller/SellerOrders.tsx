import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Package, Truck, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SellerOrders = () => {
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        products (*),
        orders (*)
      `)
      .eq('seller_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setOrderItems(data || []);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Order status updated" });
      loadOrders();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "confirmed": return "bg-blue-500";
      case "processing": return "bg-blue-600";
      case "shipped": return "bg-purple-500";
      case "delivered": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/seller")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Customer Orders
          </h1>
          <p className="text-muted-foreground mt-1">Manage and process customer orders</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : orderItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No orders yet</p>
              <p className="text-muted-foreground">Orders will appear here when customers purchase your products</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orderItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order #{item.orders?.id.slice(0, 8)}</CardTitle>
                      <CardDescription>
                        Product: {item.products?.product_name}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(item.orders?.order_status)}>
                      {item.orders?.order_status?.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="font-semibold">{item.quantity} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unit Price</p>
                      <p className="font-semibold">₹{item.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-semibold text-primary">₹{item.price * item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="font-semibold">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Delivery Address:</p>
                    <p className="text-sm">{item.orders?.delivery_address}</p>
                  </div>

                  {item.orders?.order_status !== 'delivered' && (
                    <div className="flex items-center gap-4 pt-4">
                      <span className="text-sm font-medium">Update Status:</span>
                      <Select 
                        value={item.orders?.order_status} 
                        onValueChange={(value) => updateOrderStatus(item.orders?.id, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;