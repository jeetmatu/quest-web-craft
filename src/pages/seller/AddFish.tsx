import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Fish } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AddFish = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fishType: "",
    quantity: "",
    quality: "",
    priceExpected: "",
    location: "",
    description: "",
    contactNumber: "",
    harvestDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from('fish_listings').insert({
      seller_id: session.user.id,
      fish_type: formData.fishType,
      quantity: parseFloat(formData.quantity) || 0,
      quality: formData.quality,
      price_expected: parseFloat(formData.priceExpected) || 0,
      location: formData.location,
      description: formData.description,
      contact_number: formData.contactNumber,
      harvest_date: formData.harvestDate,
      status: "available"
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    
    toast({ title: "Success", description: "Fish listing added successfully!" });
    navigate("/seller");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/seller")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Fish className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Add New Fish Listing</CardTitle>
                <CardDescription>Fill in the details of your fish catch</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fishType">Fish Type *</Label>
                  <Select value={formData.fishType} onValueChange={(value) => setFormData({...formData, fishType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fish type" />
                    </SelectTrigger>
                    <SelectContent>
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

                <div className="space-y-2">
                  <Label htmlFor="quality">Quality Grade *</Label>
                  <Select value={formData.quality} onValueChange={(value) => setFormData({...formData, quality: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">Premium (A+)</SelectItem>
                      <SelectItem value="high">High Quality (A)</SelectItem>
                      <SelectItem value="medium">Medium Quality (B)</SelectItem>
                      <SelectItem value="low">Low Quality (C)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (kg) *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="e.g., 50"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceExpected">Expected Price (₹/kg) *</Label>
                  <Input
                    id="priceExpected"
                    type="number"
                    placeholder="e.g., 250"
                    step="0.01"
                    value={formData.priceExpected}
                    onChange={(e) => setFormData({...formData, priceExpected: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    placeholder="e.g., +91 9876543210"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Harbor Bay"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="harvestDate">Harvest Date *</Label>
                  <Input
                    id="harvestDate"
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional details about the fish..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                <Fish className="mr-2 h-4 w-4" />
                Add Fish Listing
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddFish;