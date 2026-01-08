import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingOrders: 0,
    totalEarnings: 0,
    lowStock: 0
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

      if (roleData?.role !== 'seller') {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      await loadStats(session.user.id);
    };
    init();
  }, [navigate]);

  const loadStats = async (userId: string) => {
    // Get products
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', userId);

    const lowStockProducts = products?.filter(p => p.stock_quantity < 10) || [];

    // Get order items for this seller
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*, orders(*)')
      .eq('seller_id', userId);

    const pendingOrders = orderItems?.filter(item => 
      item.orders?.order_status === 'pending' || item.orders?.order_status === 'confirmed'
    ) || [];

    const totalEarnings = orderItems?.reduce((sum, item) => 
      sum + (parseFloat(String(item.price)) * item.quantity), 0
    ) || 0;

    setStats({
      totalProducts: products?.length || 0,
      pendingOrders: pendingOrders.length,
      totalEarnings,
      lowStock: lowStockProducts.length
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
              🐾 Seller Dashboard
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
            title="Total Products"
            value={stats.totalProducts}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            color="from-yellow-500 to-orange-500"
          />
          <StatCard
            title="Total Earnings"
            value={`₹${stats.totalEarnings.toFixed(2)}`}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStock}
            color="from-red-500 to-pink-500"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your pet food products and orders</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            <ActionButton
              title="Add Product"
              description="List a new pet food product"
              onClick={() => navigate("/seller/add-product")}
            />
            <ActionButton
              title="My Products"
              description="View and manage products"
              onClick={() => navigate("/seller/my-products")}
            />
            <ActionButton
              title="Orders"
              description="View and process orders"
              onClick={() => navigate("/seller/orders")}
            />
            <ActionButton
              title="Reviews"
              description="View customer reviews"
              onClick={() => navigate("/seller/reviews")}
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

export default SellerDashboard;