import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0
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

      if (roleData?.role !== 'admin') {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      await loadStats();
    };
    init();
  }, [navigate]);

  const loadStats = async () => {
    const { count: usersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: reportsCount } = await supabase
      .from('purchase_reports')
      .select('*', { count: 'exact', head: true });

    setStats({
      totalUsers: usersCount || 0,
      totalReports: reportsCount || 0
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
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">{user.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Purchase Reports"
            value={stats.totalReports}
            color="from-green-500 to-emerald-500"
          />
        </div>

        {/* Admin Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Tools</CardTitle>
            <CardDescription>Manage your platform</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-4">
            <ActionButton
              title="Manage Users"
              description="View and manage all users"
              onClick={() => navigate("/admin/users")}
            />
            <ActionButton
              title="Transactions"
              description="View all transactions"
              onClick={() => navigate("/admin/transactions")}
            />
            <ActionButton
              title="Manage Listings"
              description="Verify quality tags"
              onClick={() => navigate("/admin/listings")}
            />
            <ActionButton
              title="Purchase Reports"
              description="View buyer purchase reports"
              onClick={() => navigate("/admin/view-reports")}
            />
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Configure platform settings</CardDescription>
          </CardHeader>
          <CardContent>
            <ActionButton
              title="System Settings"
              description="Configure system settings"
              onClick={() => navigate("/admin/settings")}
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

export default AdminDashboard;
