import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"seller" | "buyer">("buyer");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        checkUserRole(session.user.id);
      }
    });
  }, []);

  const checkUserRole = async (userId: string) => {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleData) {
      navigate(`/${roleData.role}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAdminLogin) {
      // Admin login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleData?.role === 'admin') {
        toast({ title: "Success", description: "Admin login successful!" });
        navigate('/admin');
      } else {
        await supabase.auth.signOut();
        toast({ title: "Error", description: "Unauthorized", variant: "destructive" });
      }
    } else if (isLogin) {
      // Regular login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleData) {
        toast({ title: "Success", description: "Login successful!" });
        navigate(`/${roleData.role}`);
      }
    } else {
      // Sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      if (data.user) {
        await supabase.from('user_roles').insert({ user_id: data.user.id, role });
        toast({ title: "Success", description: "Registration successful!" });
        navigate(`/${role}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            FishSupply
          </CardTitle>
          <CardDescription>
            {isAdminLogin ? "Admin Sign In" : isLogin ? "Sign in to your account" : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && !isAdminLogin && (
              <div className="space-y-2">
                <Label htmlFor="role">Register as</Label>
                <Select value={role} onValueChange={(value: any) => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seller">Seller (Fisherman)</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full">
              {isAdminLogin ? "Admin Sign In" : isLogin ? "Sign In" : "Register"}
            </Button>

            {!isAdminLogin && (
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline"
                >
                  {isLogin ? "Don't have an account? Register here" : "Already have an account? Sign in"}
                </button>
              </div>
            )}

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsAdminLogin(!isAdminLogin)}
                className="text-muted-foreground hover:text-primary"
              >
                {isAdminLogin ? "Back to regular login" : "Admin login"}
              </button>
            </div>

            <div className="text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
                Back to Home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
