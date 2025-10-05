import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Fish, DollarSign, Search } from "lucide-react";

const FishList = () => {
  const navigate = useNavigate();
  const [fishList, setFishList] = useState<any[]>([]);
  const [filteredFish, setFilteredFish] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterQuality, setFilterQuality] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const allFish = JSON.parse(localStorage.getItem("fishListings") || "[]");
    const availableFish = allFish.filter((fish: any) => fish.status === "available");
    setFishList(availableFish);
    setFilteredFish(availableFish);
  }, []);

  useEffect(() => {
    let filtered = fishList;

    if (searchTerm) {
      filtered = filtered.filter(fish => 
        fish.fishType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fish.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterQuality !== "all") {
      filtered = filtered.filter(fish => fish.quality === filterQuality);
    }

    if (filterType !== "all") {
      filtered = filtered.filter(fish => fish.fishType === filterType);
    }

    setFilteredFish(filtered);
  }, [searchTerm, filterQuality, filterType, fishList]);

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
        <Button variant="ghost" onClick={() => navigate("/buyer")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Available Fish
          </h1>
          <p className="text-muted-foreground mt-1">Browse and make offers on available fish</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Narrow down your search</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search fish type or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quality</label>
                <Select value={filterQuality} onValueChange={setFilterQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Qualities</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="high">High Quality</SelectItem>
                    <SelectItem value="medium">Medium Quality</SelectItem>
                    <SelectItem value="low">Low Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fish Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="salmon">Salmon</SelectItem>
                    <SelectItem value="tuna">Tuna</SelectItem>
                    <SelectItem value="mackerel">Mackerel</SelectItem>
                    <SelectItem value="sardine">Sardine</SelectItem>
                    <SelectItem value="cod">Cod</SelectItem>
                    <SelectItem value="trout">Trout</SelectItem>
                    <SelectItem value="shrimp">Shrimp</SelectItem>
                    <SelectItem value="crab">Crab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredFish.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Fish className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No fish available</p>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFish.map((fish) => (
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
                    <span className="font-semibold text-primary">${fish.priceExpected}/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harvest Date:</span>
                    <span className="font-semibold">{new Date(fish.harvestDate).toLocaleDateString()}</span>
                  </div>
                  {fish.description && (
                    <p className="text-sm text-muted-foreground pt-2 border-t">{fish.description}</p>
                  )}
                  <Button 
                    className="w-full mt-4"
                    onClick={() => navigate("/buyer/make-offer", { state: { fish } })}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Make an Offer
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

export default FishList;