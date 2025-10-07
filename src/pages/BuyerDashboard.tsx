import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    activeOffers: 0,
    totalSpent: 0
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
    const { data: offers } = await supabase
      .from('offers')
      .select('*')
      .eq('buyer_id', userId);

    const acceptedOffers = offers?.filter(o => o.status === 'accepted') || [];
    const activeOffers = offers?.filter(o => o.status === 'pending') || [];
    const totalSpent = acceptedOffers.reduce((sum, o) => sum + (parseFloat(String(o.offered_price)) * parseFloat(String(o.quantity))), 0);

    setStats({
      totalPurchases: acceptedOffers.length,
      activeOffers: activeOffers.length,
      totalSpent
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
              Buyer Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">{user.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            title="Total Purchases"
            value={stats.totalPurchases}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Active Offers"
            value={stats.activeOffers}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            title="Total Spent"
            value={`₹${stats.totalSpent}`}
            color="from-purple-500 to-pink-500"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Browse fish and manage your purchases</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            <ActionButton
              title="Browse Fish"
              description="Search available fish listings"
              onClick={() => navigate("/buyer/fish-list")}
            />
            <ActionButton
              title="Track Offers"
              description="Track your offers"
              onClick={() => navigate("/buyer/track-offers")}
            />
            <ActionButton
              title="Purchase History"
              description="View past purchases"
              onClick={() => navigate("/buyer/purchase-history")}
            />
            <ActionButton
              title="Messages"
              description="View your messages"
              onClick={() => navigate("/buyer/contacts")}
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

export default BuyerDashboard;
