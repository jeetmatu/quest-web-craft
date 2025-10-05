import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";

const TrackOffers = () => {
  const navigate = useNavigate();
  const [myOffers, setMyOffers] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const allOffers = JSON.parse(localStorage.getItem("offers") || "[]");
    const userOffers = allOffers.filter((offer: any) => offer.buyerId === currentUser.email);
    setMyOffers(userOffers);
  }, []);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "pending": return <Clock className="h-5 w-5 text-yellow-500" />;
      case "accepted": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected": return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-yellow-500";
      case "accepted": return "bg-green-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/buyer")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Track My Offers
          </h1>
          <p className="text-muted-foreground mt-1">Monitor the status of your price proposals</p>
        </div>

        {myOffers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No offers yet</p>
              <p className="text-muted-foreground mb-4">Start by making an offer on available fish</p>
              <Button onClick={() => navigate("/buyer/fish-list")}>
                Browse Fish
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myOffers.map((offer) => (
              <Card key={offer.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="capitalize flex items-center gap-2">
                        {offer.fishType}
                        {getStatusIcon(offer.status)}
                      </CardTitle>
                      <CardDescription>Seller: {offer.sellerId}</CardDescription>
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
                      <p className="text-sm text-muted-foreground">Your Offer</p>
                      <p className="font-semibold text-primary">${offer.offeredPrice}/kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="font-semibold">${(parseFloat(offer.offeredPrice) * parseFloat(offer.quantity)).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="font-semibold">{new Date(offer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {offer.message && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-semibold mb-1">Your message:</p>
                      <p className="text-sm">{offer.message}</p>
                    </div>
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

export default TrackOffers;