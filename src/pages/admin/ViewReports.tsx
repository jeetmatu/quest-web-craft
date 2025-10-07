import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ViewReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roleData?.role !== 'admin') {
        navigate("/");
        return;
      }

      await loadReports();
    };
    checkAuthAndLoad();
  }, [navigate]);

  const loadReports = async () => {
    const { data } = await supabase
      .from('purchase_reports')
      .select('*')
      .order('created_at', { ascending: false });
    setReports(data || []);
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
            Purchase Reports
          </h1>
          <p className="text-muted-foreground mt-1">View all buyer purchase reports</p>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No reports yet</p>
              <p className="text-muted-foreground">Buyer reports will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle>Report from {new Date(report.created_at).toLocaleDateString()}</CardTitle>
                  <CardDescription>Buyer ID: {report.buyer_id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto">
                    {JSON.stringify(report.report_data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReports;
