import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    cartItems: 0
  });

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roleData?.role !== 'buyer') {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      await loadStats(session.user.id);
    };
    init();
  }, [navigate]);

  const loadStats = async (userId: string) => {
    // Get orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', userId);

    const pendingOrders = orders?.filter(o => o.order_status !== 'delivered') || [];
    const totalSpent = orders?.reduce((sum, o) => sum + parseFloat(String(o.total_amount)), 0) || 0;

    // Get cart items
    const { data: cartItems } = await supabase
      .from('cart_items')
      .select('*')
      .eq('customer_id', userId);

    setStats({
      totalOrders: orders?.length || 0,
      pendingOrders: pendingOrders.length,
      totalSpent,
      cartItems: cartItems?.length || 0
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              🐾 Customer Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">{user.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            color="from-yellow-500 to-orange-500"
          />
          <StatCard
            title="Total Spent"
            value={`₹${stats.totalSpent.toFixed(2)}`}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            title="Cart Items"
            value={stats.cartItems}
            color="from-green-500 to-emerald-500"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Shop for your pet's nutrition needs</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            <ActionButton
              title="Browse Products"
              description="Shop pet food products"
              onClick={() => navigate("/buyer/products")}
            />
            <ActionButton
              title="My Cart"
              description="View your shopping cart"
              onClick={() => navigate("/buyer/cart")}
            />
            <ActionButton
              title="My Orders"
              description="Track your orders"
              onClick={() => navigate("/buyer/orders")}
            />
            <ActionButton
              title="My Reviews"
              description="View your reviews"
              onClick={() => navigate("/buyer/my-reviews")}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }: any) => {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`}></div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

const ActionButton = ({ title, description, onClick }: any) => {
  return (
    <button onClick={onClick} className="p-6 rounded-xl bg-card border border-border hover:shadow-lg hover:scale-105 transition-all duration-300 text-left group">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
};

export default CustomerDashboard;