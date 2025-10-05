import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Fish, Trash2 } from "lucide-react";
import { toast } from "sonner";

const MyFish = () => {
  const navigate = useNavigate();
  const [myFish, setMyFish] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const allFish = JSON.parse(localStorage.getItem("fishListings") || "[]");
    const userFish = allFish.filter((fish: any) => fish.sellerId === currentUser.email);
    setMyFish(userFish);
  }, []);

  const handleDelete = (fishId: string) => {
    const allFish = JSON.parse(localStorage.getItem("fishListings") || "[]");
    const updatedFish = allFish.filter((fish: any) => fish.id !== fishId);
    localStorage.setItem("fishListings", JSON.stringify(updatedFish));
    setMyFish(myFish.filter(fish => fish.id !== fishId));
    toast.success("Fish listing deleted successfully");
  };

  const getQualityColor = (quality: string) => {
    switch(quality) {
      case "premium": return "bg-gradient-to-r from-yellow-500 to-amber-500";
      case "high": return "bg-gradient-to-r from-green-500 to-emerald-500";
      case "medium": return "bg-gradient-to-r from-blue-500 to-cyan-500";
      case "low": return "bg-gradient-to-r from-gray-500 to-slate-500";
      default: return "bg-primary";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/seller")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Fish Listings
            </h1>
            <p className="text-muted-foreground mt-1">Manage your fish inventory</p>
          </div>
          <Button onClick={() => navigate("/seller/add-fish")}>
            <Fish className="mr-2 h-4 w-4" />
            Add New Fish
          </Button>
        </div>

        {myFish.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Fish className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No fish listings yet</p>
              <p className="text-muted-foreground mb-4">Start by adding your first fish listing</p>
              <Button onClick={() => navigate("/seller/add-fish")}>
                <Fish className="mr-2 h-4 w-4" />
                Add Fish
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myFish.map((fish) => (
              <Card key={fish.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="capitalize">{fish.fishType}</CardTitle>
                      <CardDescription>{fish.location}</CardDescription>
                    </div>
                    <Badge className={getQualityColor(fish.quality)}>{fish.quality}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-semibold">{fish.quantity} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Price:</span>
                    <span className="font-semibold">${fish.priceExpected}/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harvest Date:</span>
                    <span className="font-semibold">{new Date(fish.harvestDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={fish.status === "available" ? "default" : "secondary"}>
                      {fish.status}
                    </Badge>
                  </div>
                  {fish.description && (
                    <p className="text-sm text-muted-foreground pt-2 border-t">{fish.description}</p>
                  )}
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => handleDelete(fish.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Listing
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFish;