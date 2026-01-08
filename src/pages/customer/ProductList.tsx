import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Package, Search, ShoppingCart, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPetType, setFilterPetType] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProducts(data || []);
      setFilteredProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterPetType !== "all") {
      filtered = filtered.filter(product => product.pet_type === filterPetType);
    }

    if (filterBrand !== "all") {
      filtered = filtered.filter(product => product.brand === filterBrand);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, filterPetType, filterBrand, products]);

  const addToCart = async (product: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('customer_id', session.user.id)
      .eq('product_id', product.id)
      .single();

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Cart updated!" });
      }
    } else {
      // Add new item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          customer_id: session.user.id,
          product_id: product.id,
          quantity: 1
        });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Added to cart!" });
      }
    }
  };

  const uniqueBrands = [...new Set(products.map(p => p.brand))];

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
              Pet Food Products
            </h1>
            <p className="text-muted-foreground mt-1">Browse and shop for your pet's nutrition</p>
          </div>
          <Button onClick={() => navigate("/buyer/cart")}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            View Cart
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Find the perfect food for your pet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products or brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pet Type</label>
                <Select value={filterPetType} onValueChange={setFilterPetType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pets</SelectItem>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="bird">Bird</SelectItem>
                    <SelectItem value="fish">Fish</SelectItem>
                    <SelectItem value="small_pet">Small Pet</SelectItem>
                    <SelectItem value="reptile">Reptile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Brand</label>
                <Select value={filterBrand} onValueChange={setFilterBrand}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {uniqueBrands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No products available</p>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{product.product_name}</CardTitle>
                      <CardDescription>{product.brand}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="capitalize">{product.pet_type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                    <span className="text-sm text-muted-foreground">Stock: {product.stock_quantity}</span>
                  </div>
                  {product.nutrition_details && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.nutrition_details}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/buyer/product/${product.id}`)}
                    >
                      View Details
                    </Button>
                    <Button onClick={() => addToCart(product)}>
                      <ShoppingCart className="mr-1 h-4 w-4" />
                      Add
                    </Button>
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

export default ProductList;