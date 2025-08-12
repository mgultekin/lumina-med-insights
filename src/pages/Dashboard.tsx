import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { Plus, Eye, FileText, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Analysis {
  id: string;
  created_at: string;
  status: string;
  modality: string;
  body_region: string;
  image_path: string;
  analysis_result: string;
}

export const Dashboard = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('id, created_at, status, modality, body_region, image_path, analysis_result')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load analyses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, imagePath: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      if (imagePath) {
        await supabase.storage.from('medical-images').remove([imagePath]);
      }

      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAnalyses(analyses.filter(a => a.id !== id));
      toast({
        title: "Deleted",
        description: "Analysis deleted successfully",
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete analysis",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'secondary';
      case 'analyzing': return 'default';
      case 'analyzed': return 'default';
      case 'report_draft': return 'default';
      case 'article_draft': return 'default';
      case 'published': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'uploaded': return 'Uploaded';
      case 'analyzing': return 'Analyzing';
      case 'analyzed': return 'Analysis Complete';
      case 'report_draft': return 'Report Draft';
      case 'article_draft': return 'Article Draft';
      case 'published': return 'Published';
      default: return status;
    }
  };

  return (
    <Layout isAuthenticated onSignOut={signOut}>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-medical-primary">Dashboard</h1>
            <p className="text-muted-foreground">Manage your medical image analyses</p>
          </div>
          <Button 
            onClick={() => navigate('/new-analysis')} 
            variant="medical"
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Analysis</span>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
          </div>
        ) : analyses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-medical-primary mb-2">No analyses yet</h3>
              <p className="text-muted-foreground mb-6">Upload your first medical case to get started</p>
              <Button onClick={() => navigate('/new-analysis')} variant="medical">
                <Plus className="mr-2 h-4 w-4" />
                Create First Analysis
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((analysis) => (
              <Card key={analysis.id} className="clinical-shadow hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={getStatusColor(analysis.status)}>
                      {getStatusLabel(analysis.status)}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square bg-clinical-surface rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {analysis.image_path?.split('/').pop()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Modality</p>
                      <p className="text-sm text-muted-foreground">{analysis.modality}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Body Region</p>
                      <p className="text-sm text-muted-foreground">{analysis.body_region}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Button 
                      onClick={() => navigate(`/analysis/${analysis.id}`)}
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      <Eye className="mr-2 h-3 w-3" />
                      View
                    </Button>
                    
                    {analysis.analysis_result && (
                      <Button 
                        onClick={() => navigate(`/article/${analysis.id}`)}
                        variant="outline" 
                        size="sm"
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button 
                      onClick={() => handleDelete(analysis.id, analysis.image_path)}
                      variant="outline" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};