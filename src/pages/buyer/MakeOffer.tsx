import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign } from "lucide-react";
import { toast } from "sonner";

const MakeOffer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fish = location.state?.fish;

  const [offerData, setOfferData] = useState({
    offeredPrice: "",
    quantity: fish?.quantity || "",
    message: ""
  });

  if (!fish) {
    navigate("/buyer/fish-list");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const existingOffers = JSON.parse(localStorage.getItem("offers") || "[]");
    
    const newOffer = {
      id: Date.now().toString(),
      fishId: fish.id,
      fishType: fish.fishType,
      sellerId: fish.sellerId,
      buyerId: currentUser.email,
      ...offerData,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    existingOffers.push(newOffer);
    localStorage.setItem("offers", JSON.stringify(existingOffers));
    
    toast.success("Offer submitted successfully!");
    navigate("/buyer/track-offers");
  };

  const totalValue = (parseFloat(offerData.offeredPrice) || 0) * (parseFloat(offerData.quantity) || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/buyer/fish-list")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Fish List
        </Button>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Fish Details</CardTitle>
              <CardDescription>Information about the listing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Fish Type</p>
                <p className="font-semibold text-lg capitalize">{fish.fishType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quality</p>
                <Badge className="mt-1">{fish.quality}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available Quantity:</span>
                <span className="font-semibold">{fish.quantity} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Price:</span>
                <span className="font-semibold">${fish.priceExpected}/kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-semibold">{fish.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Harvest Date:</span>
                <span className="font-semibold">{new Date(fish.harvestDate).toLocaleDateString()}</span>
              </div>
              {fish.description && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Description:</p>
                  <p className="text-sm">{fish.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-primary" />
                Make Your Offer
              </CardTitle>
              <CardDescription>Submit your price proposal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="offeredPrice">Your Offer ($/kg) *</Label>
                  <Input
                    id="offeredPrice"
                    type="number"
                    placeholder="e.g., 11.50"
                    step="0.01"
                    value={offerData.offeredPrice}
                    onChange={(e) => setOfferData({...offerData, offeredPrice: e.target.value})}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Seller expects: ${fish.priceExpected}/kg
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (kg) *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder={`Max: ${fish.quantity} kg`}
                    value={offerData.quantity}
                    onChange={(e) => setOfferData({...offerData, quantity: e.target.value})}
                    max={fish.quantity}
                    required
                  />
                </div>

                {totalValue > 0 && (
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold text-primary">${totalValue.toFixed(2)}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add any notes or details about your offer..."
                    value={offerData.message}
                    onChange={(e) => setOfferData({...offerData, message: e.target.value})}
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Submit Offer
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MakeOffer;