import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ViewRecords = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<any[]>([]);

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
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false });
      
      setOffers(data || []);
    };
    init();
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-500";
      case "rejected": return "bg-red-500";
      default: return "bg-yellow-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/seller")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Customer Records
          </h1>
          <p className="text-muted-foreground mt-1">View all customer offers and transactions</p>
        </div>

        {offers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No records yet</p>
              <p className="text-muted-foreground">Customer offers will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <Card key={offer.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Offer #{offer.id.slice(0, 8)}</CardTitle>
                      <CardDescription>Buyer: {offer.buyer_id}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(offer.status)}>{offer.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="font-semibold">{offer.quantity} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price per kg</p>
                      <p className="font-semibold">₹{offer.offered_price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="font-semibold text-primary">
                        ₹{(parseFloat(offer.offered_price) * parseFloat(offer.quantity)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">{new Date(offer.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {offer.message && (
                    <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">
                      Message: {offer.message}
                    </p>
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

export default ViewRecords;
