import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Messages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [listing, setListing] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(session.user.id);

      if (location.state?.listingId) {
        await loadListing(location.state.listingId);
        await loadMessages(location.state.listingId);
        subscribeToMessages(location.state.listingId);
      }
    };
    init();
  }, [navigate, location]);

  const loadListing = async (listingId: string) => {
    const { data } = await supabase
      .from('fish_listings')
      .select('*')
      .eq('id', listingId)
      .single();
    setListing(data);
  };

  const loadMessages = async (listingId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const subscribeToMessages = (listingId: string) => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `listing_id=eq.${listingId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !listing) return;

    const receiverId = currentUserId === listing.seller_id ? 
      (location.state?.buyerId || listing.seller_id) : 
      listing.seller_id;

    const { error } = await supabase.from('messages').insert({
      listing_id: listing.id,
      sender_id: currentUserId,
      receiver_id: receiverId,
      message: newMessage
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>
              {listing ? `Regarding: ${listing.fish_type} from ${listing.location}` : 'Loading...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.sender_id === currentUserId
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted mr-12'
                  }`}
                >
                  <p>{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
                rows={2}
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
