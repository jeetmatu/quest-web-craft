import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    } else {
      setCartItems(data || []);
    }
    setLoading(false);
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      loadCart();
    }
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Item removed from cart" });
      loadCart();
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + (item.products?.price || 0) * item.quantity;
  }, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({ title: "Error", description: "Your cart is empty", variant: "destructive" });
      return;
    }
    navigate("/buyer/checkout");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/buyer/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Button>

        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground mt-1">Review your items before checkout</p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading cart...</div>
        ) : cartItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">Your cart is empty</p>
              <p className="text-muted-foreground mb-4">Add some products to get started</p>
              <Button onClick={() => navigate("/buyer/products")}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.products?.product_name}</h3>
                        <p className="text-sm text-muted-foreground">{item.products?.brand}</p>
                        <p className="text-primary font-semibold mt-1">₹{item.products?.price}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className="font-bold">₹{(item.products?.price || 0) * item.quantity}</p>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-bold">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <hr />
                <div className="flex justify-between text-xl">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">₹{totalAmount.toFixed(2)}</span>
                </div>
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;