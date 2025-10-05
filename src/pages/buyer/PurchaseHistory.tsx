import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Download } from "lucide-react";

const PurchaseHistory = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const allOffers = JSON.parse(localStorage.getItem("offers") || "[]");
    const acceptedOffers = allOffers.filter(
      (offer: any) => offer.buyerId === currentUser.email && offer.status === "accepted"
    );
    
    setPurchases(acceptedOffers);
    
    const total = acceptedOffers.reduce((sum: number, offer: any) => {
      return sum + (parseFloat(offer.offeredPrice) * parseFloat(offer.quantity));
    }, 0);
    setTotalSpent(total);
  }, []);

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
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          )}
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle>Total Spending</CardTitle>
            <CardDescription>All-time purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">${totalSpent.toFixed(2)}</p>
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
                      <CardTitle className="capitalize">{purchase.fishType}</CardTitle>
                      <CardDescription>Purchased from: {purchase.sellerId}</CardDescription>
                    </div>
                    <Badge className="bg-green-500">Completed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="font-semibold">{purchase.quantity} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price per kg</p>
                      <p className="font-semibold">${purchase.offeredPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                      <p className="font-semibold text-primary">
                        ${(parseFloat(purchase.offeredPrice) * parseFloat(purchase.quantity)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Purchase Date</p>
                      <p className="font-semibold">{new Date(purchase.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-end">
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Invoice
                      </Button>
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