import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SellerReviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Get products for this seller
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('seller_id', session.user.id);

    if (!products || products.length === 0) {
      setLoading(false);
      return;
    }

    const productIds = products.map(p => p.id);

    // Get reviews for these products
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        products (*)
      `)
      .in('product_id', productIds)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/seller")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Customer Reviews
          </h1>
          <p className="text-muted-foreground mt-1">See what customers say about your products</p>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardHeader>
            <CardTitle>Overall Rating</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="text-5xl font-bold text-primary">{averageRating}</div>
            <div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(parseFloat(averageRating) || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Based on {reviews.length} reviews</p>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No reviews yet</p>
              <p className="text-muted-foreground">Reviews will appear here when customers rate your products</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{review.products?.product_name}</CardTitle>
                      <CardDescription>
                        {new Date(review.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                {review.comment && (
                  <CardContent>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerReviews;