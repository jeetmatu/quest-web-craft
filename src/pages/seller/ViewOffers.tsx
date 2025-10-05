import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";

const ViewOffers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const allOffers = JSON.parse(localStorage.getItem("offers") || "[]");
    const userOffers = allOffers.filter((offer: any) => offer.sellerId === currentUser.email);
    setOffers(userOffers);
  }, []);

  const handleAccept = (offerId: string) => {
    const allOffers = JSON.parse(localStorage.getItem("offers") || "[]");
    const updatedOffers = allOffers.map((offer: any) => 
      offer.id === offerId ? { ...offer, status: "accepted" } : offer
    );
    localStorage.setItem("offers", JSON.stringify(updatedOffers));
    setOffers(updatedOffers.filter((offer: any) => offer.sellerId === JSON.parse(localStorage.getItem("currentUser") || "{}").email));
    toast.success("Offer accepted successfully!");
  };

  const handleReject = (offerId: string) => {
    const allOffers = JSON.parse(localStorage.getItem("offers") || "[]");
    const updatedOffers = allOffers.map((offer: any) => 
      offer.id === offerId ? { ...offer, status: "rejected" } : offer
    );
    localStorage.setItem("offers", JSON.stringify(updatedOffers));
    setOffers(updatedOffers.filter((offer: any) => offer.sellerId === JSON.parse(localStorage.getItem("currentUser") || "{}").email));
    toast.info("Offer rejected");
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
        <Button variant="ghost" onClick={() => navigate("/seller")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Buyer Offers
          </h1>
          <p className="text-muted-foreground mt-1">Review and respond to offers from buyers</p>
        </div>

        {offers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No offers yet</p>
              <p className="text-muted-foreground">Offers from buyers will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <Card key={offer.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="capitalize">{offer.fishType}</CardTitle>
                      <CardDescription>From: {offer.buyerId}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(offer.status)}>{offer.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="font-semibold">{offer.quantity} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Offered Price</p>
                      <p className="font-semibold text-green-600">${offer.offeredPrice}/kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="font-semibold">${(parseFloat(offer.offeredPrice) * parseFloat(offer.quantity)).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">{new Date(offer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {offer.message && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-semibold mb-1">Message from buyer:</p>
                      <p className="text-sm">{offer.message}</p>
                    </div>
                  )}
                  {offer.status === "pending" && (
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleAccept(offer.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept Offer
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="flex-1"
                        onClick={() => handleReject(offer.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Offer
                      </Button>
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

export default ViewOffers;