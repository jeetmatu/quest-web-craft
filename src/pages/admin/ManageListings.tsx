import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Fish, Search, Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const ManageListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredListings, setFilteredListings] = useState<any[]>([]);

  useEffect(() => {
    const allFish = JSON.parse(localStorage.getItem("fishListings") || "[]");
    setListings(allFish);
    setFilteredListings(allFish);
  }, []);

  useEffect(() => {
    const filtered = listings.filter(fish => 
      fish.fishType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fish.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fish.sellerId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredListings(filtered);
  }, [searchTerm, listings]);

  const handleDelete = (fishId: string) => {
    const updatedListings = listings.filter(fish => fish.id !== fishId);
    localStorage.setItem("fishListings", JSON.stringify(updatedListings));
    setListings(updatedListings);
    toast.success("Fish listing deleted successfully");
  };

  const handleVerify = (fishId: string) => {
    const updatedListings = listings.map(fish => 
      fish.id === fishId ? { ...fish, verified: true } : fish
    );
    localStorage.setItem("fishListings", JSON.stringify(updatedListings));
    setListings(updatedListings);
    toast.success("Listing verified");
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
        <Button variant="ghost" onClick={() => navigate("/admin")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Manage Fish Listings
          </h1>
          <p className="text-muted-foreground mt-1">Review and moderate all fish listings</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Fish Listings</CardTitle>
                <CardDescription>{filteredListings.length} listings found</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Fish className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold mb-2">No listings found</p>
                <p className="text-muted-foreground">Try adjusting your search</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredListings.map((fish) => (
                  <div key={fish.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold capitalize text-lg">{fish.fishType}</p>
                          {fish.verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Seller: {fish.sellerId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getQualityColor(fish.quality)}>{fish.quality}</Badge>
                        <Badge variant={fish.status === "available" ? "default" : "secondary"}>
                          {fish.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-5 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Quantity</p>
                        <p className="font-semibold">{fish.quantity} kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-semibold">${fish.priceExpected}/kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-semibold">{fish.location}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Harvest Date</p>
                        <p className="font-semibold">{new Date(fish.harvestDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Listed On</p>
                        <p className="font-semibold">{new Date(fish.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {fish.description && (
                      <p className="text-sm text-muted-foreground mb-3 p-2 bg-muted rounded">
                        {fish.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      {!fish.verified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerify(fish.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Verify Quality
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(fish.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageListings;