import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, TrendingUp } from "lucide-react";

const ViewTransactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    totalValue: 0
  });

  useEffect(() => {
    const allOffers = JSON.parse(localStorage.getItem("offers") || "[]");
    setTransactions(allOffers);

    const completed = allOffers.filter((o: any) => o.status === "accepted").length;
    const pending = allOffers.filter((o: any) => o.status === "pending").length;
    const totalValue = allOffers
      .filter((o: any) => o.status === "accepted")
      .reduce((sum: number, offer: any) => {
        return sum + (parseFloat(offer.offeredPrice) * parseFloat(offer.quantity));
      }, 0);

    setStats({
      total: allOffers.length,
      completed,
      pending,
      totalValue
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-yellow-500";
      case "accepted": return "bg-green-500";
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
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
            Transaction History
          </h1>
          <p className="text-muted-foreground mt-1">Monitor all platform transactions</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Value</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">${stats.totalValue.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>Complete transaction log</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold mb-2">No transactions yet</p>
                <p className="text-muted-foreground">Transactions will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold capitalize">{transaction.fishType}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.buyerId} → {transaction.sellerId}
                        </p>
                      </div>
                      <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Quantity</p>
                        <p className="font-semibold">{transaction.quantity} kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-semibold">${transaction.offeredPrice}/kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-semibold">
                          ${(parseFloat(transaction.offeredPrice) * parseFloat(transaction.quantity)).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-semibold">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                      </div>
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

export default ViewTransactions;