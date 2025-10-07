import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PurchaseHistory = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase
        .from('offers')
        .select('*')
        .eq('buyer_id', session.user.id)
        .eq('status', 'accepted');

      const acceptedOffers = data || [];
      setPurchases(acceptedOffers);

      const total = acceptedOffers.reduce((sum: number, offer: any) => {
        return sum + (parseFloat(String(offer.offered_price)) * parseFloat(String(offer.quantity)));
      }, 0);
      setTotalSpent(total);
    };
    init();
  }, [navigate]);

  const handleExportReport = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const reportData = {
      totalSpent,
      totalPurchases: purchases.length,
      purchases: purchases.map(p => ({
        quantity: p.quantity,
        price: p.offered_price,
        date: p.created_at
      }))
    };

    const { error } = await supabase.from('purchase_reports').insert({
      buyer_id: session.user.id,
      report_data: reportData
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Report sent to admin successfully!" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/buyer")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Purchase History
            </h1>
            <p className="text-muted-foreground mt-1">Review your past transactions</p>
          </div>
          {purchases.length > 0 && (
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="mr-2 h-4 w-4" />
              Send Report to Admin
            </Button>
          )}
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle>Total Spending</CardTitle>
            <CardDescription>All-time purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">₹{totalSpent.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">{purchases.length} transactions completed</p>
          </CardContent>
        </Card>

        {purchases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No purchases yet</p>
              <p className="text-muted-foreground mb-4">Your accepted offers will appear here</p>
              <Button onClick={() => navigate("/buyer/fish-list")}>
                Browse Fish
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Purchase #{purchase.id.slice(0, 8)}</CardTitle>
                      <CardDescription>Seller: {purchase.seller_id}</CardDescription>
                    </div>
                    <Badge className="bg-green-500">Completed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="font-semibold">{purchase.quantity} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price per kg</p>
                      <p className="font-semibold">₹{purchase.offered_price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                      <p className="font-semibold text-primary">
                        ₹{(parseFloat(String(purchase.offered_price)) * parseFloat(String(purchase.quantity))).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Purchase Date</p>
                      <p className="font-semibold">{new Date(purchase.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;