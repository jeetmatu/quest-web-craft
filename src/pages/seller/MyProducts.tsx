import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Trash2, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MyProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Product deleted successfully" });
      loadProducts();
    }
  };

  const getPetTypeEmoji = (petType: string) => {
    const emojis: {[key: string]: string} = {
      dog: "🐕",
      cat: "🐈",
      bird: "🐦",
      fish: "🐠",
      small_pet: "🐹",
      reptile: "🐢"
    };
    return emojis[petType] || "🐾";
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
              My Products
            </h1>
            <p className="text-muted-foreground mt-1">Manage your pet food inventory</p>
          </div>
          <Button onClick={() => navigate("/seller/add-product")}>
            <Package className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No products yet</p>
              <p className="text-muted-foreground mb-4">Start by adding your first product</p>
              <Button onClick={() => navigate("/seller/add-product")}>
                <Package className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{product.product_name}</CardTitle>
                      <CardDescription>{product.brand}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-lg">
                      {getPetTypeEmoji(product.pet_type)} {product.pet_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold text-primary">₹{product.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock:</span>
                    <Badge variant={product.stock_quantity < 10 ? "destructive" : "default"}>
                      {product.stock_quantity} units
                    </Badge>
                  </div>
                  {product.nutrition_details && (
                    <p className="text-sm text-muted-foreground pt-2 border-t line-clamp-2">
                      {product.nutrition_details}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate(`/seller/edit-product/${product.id}`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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

export default MyProducts;