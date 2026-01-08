import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, CreditCard, Banknote, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (*)
      `)
      .eq('customer_id', session.user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (!data || data.length === 0) {
      navigate("/buyer/cart");
    } else {
      setCartItems(data);
    }
    setLoading(false);
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + (item.products?.price || 0) * item.quantity;
  }, 0);

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast({ title: "Error", description: "Please enter delivery address", variant: "destructive" });
      return;
    }

    setProcessing(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: session.user.id,
          total_amount: totalAmount,
          delivery_address: address,
          order_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        seller_id: item.products.seller_id,
        quantity: item.quantity,
        price: item.products.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'completed',
          amount: totalAmount
        });

      if (paymentError) throw paymentError;

      // Update product stock
      for (const item of cartItems) {
        const newStock = item.products.stock_quantity - item.quantity;
        await supabase
          .from('products')
          .update({ stock_quantity: Math.max(0, newStock) })
          .eq('id', item.product_id);
      }

      // Clear cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', session.user.id);

      toast({ title: "Success", description: "Order placed successfully!" });
      navigate("/buyer/orders");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/buyer/cart")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Button>

        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Checkout
          </h1>
          <p className="text-muted-foreground mt-1">Complete your order</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
                <CardDescription>Where should we deliver your order?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your complete delivery address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select how you'd like to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay when you receive</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-sm text-muted-foreground">Pay securely online</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Wallet className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">UPI Payment</p>
                        <p className="text-sm text-muted-foreground">Pay via UPI apps</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.products?.product_name} x {item.quantity}</span>
                    <span>₹{(item.products?.price || 0) * item.quantity}</span>
                  </div>
                ))}
                <hr />
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <hr />
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handlePlaceOrder}
                  disabled={processing}
                >
                  {processing ? "Processing..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;