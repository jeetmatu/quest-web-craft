import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const WriteReview = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [reviews, setReviews] = useState<{[key: string]: {rating: number, comment: string}}>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOrderItems();
  }, [orderId]);

  const loadOrderItems = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        products (*)
      `)
      .eq('order_id', orderId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setOrderItems(data || []);
      // Initialize reviews state
      const initialReviews: any = {};
      data?.forEach(item => {
        initialReviews[item.product_id] = { rating: 5, comment: "" };
      });
      setReviews(initialReviews);
    }
    setLoading(false);
  };

  const handleRatingChange = (productId: string, rating: number) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating }
    }));
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], comment }
    }));
  };

  const handleSubmit = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setSubmitting(true);
    try {
      const reviewsToInsert = Object.entries(reviews).map(([productId, review]) => ({
        product_id: productId,
        customer_id: session.user.id,
        rating: review.rating,
        comment: review.comment
      }));

      const { error } = await supabase
        .from('reviews')
        .insert(reviewsToInsert);

      if (error) throw error;

      toast({ title: "Success", description: "Reviews submitted successfully!" });
      navigate("/buyer/orders");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/buyer/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Write Reviews
          </h1>
          <p className="text-muted-foreground mt-1">Share your experience with these products</p>
        </div>

        <div className="space-y-4">
          {orderItems.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.products?.product_name}</CardTitle>
                <CardDescription>{item.products?.brand}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(item.product_id, star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= (reviews[item.product_id]?.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Your Review</Label>
                  <Textarea
                    placeholder="Share your experience with this product..."
                    value={reviews[item.product_id]?.comment || ""}
                    onChange={(e) => handleCommentChange(item.product_id, e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Reviews"}
        </Button>
      </div>
    </div>
  );
};

export default WriteReview;