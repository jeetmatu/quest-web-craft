import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
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
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        ),
        payments (*)
      `)
      .eq('customer_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-5 w-5 text-yellow-500" />;
      case "confirmed": return <Package className="h-5 w-5 text-blue-500" />;
      case "processing": return <Package className="h-5 w-5 text-blue-500" />;
      case "shipped": return <Truck className="h-5 w-5 text-purple-500" />;
      case "delivered": return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
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
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/buyer")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            My Orders
          </h1>
          <p className="text-muted-foreground mt-1">Track and manage your orders</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No orders yet</p>
              <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
              <Button onClick={() => navigate("/buyer/products")}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(order.order_status)}
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <CardDescription>
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.order_status)}>
                      {order.order_status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <div>
                          <p className="font-medium">{item.products?.product_name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Amount</span>
                    <span className="font-bold text-primary">₹{order.total_amount}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Delivery Address:</strong> {order.delivery_address}</p>
                    <p><strong>Payment:</strong> {order.payments?.[0]?.payment_method?.toUpperCase()} - {order.payments?.[0]?.payment_status}</p>
                  </div>
                  {order.order_status === 'delivered' && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate(`/buyer/review/${order.id}`)}
                    >
                      Write a Review
                    </Button>
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

export default Orders;