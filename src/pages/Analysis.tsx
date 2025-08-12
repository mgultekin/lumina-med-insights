import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import { ArrowLeft, FileText, Eye, Download, RefreshCw, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Analysis {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  modality: string;
  body_region: string;
  notes: string;
  image_path: string;
  analysis_result: string;
  report_text: string;
  article_text: string;
  published_url: string;
}

export const Analysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");

  useEffect(() => {
    if (id && user) {
      fetchAnalysis();
    }
  }, [id, user]);

  const fetchAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      setAnalysis(data);
      setEditedNotes(data.notes || "");
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load analysis",
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!analysis) return;

    try {
      const { error } = await supabase
        .from('analyses')
        .update({ notes: editedNotes })
        .eq('id', analysis.id);

      if (error) throw error;

      setAnalysis({ ...analysis, notes: editedNotes });
      toast({
        title: "Saved",
        description: "Notes updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive"
      });
    }
  };

  const handleGenerateReport = async () => {
    if (!analysis) return;

    setIsGeneratingReport(true);
    try {
      const { error } = await supabase.functions.invoke('generate-report', {
        body: {
          analysis_id: analysis.id,
          analysis_result: analysis.analysis_result
        }
      });

      if (error) throw error;

      toast({
        title: "Report Generation Started",
        description: "Your clinical report is being generated",
      });
      
      // Refresh the analysis to get updated data
      await fetchAnalysis();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGenerateArticle = async () => {
    if (!analysis) return;

    setIsGeneratingArticle(true);
    try {
      const { error } = await supabase.functions.invoke('generate-article', {
        body: {
          analysis_id: analysis.id,
          analysis_result: analysis.analysis_result,
          report_text: analysis.report_text
        }
      });

      if (error) throw error;

      toast({
        title: "Article Generation Started",
        description: "Your academic article is being generated",
      });
      
      navigate(`/article/${analysis.id}`);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate article",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  const handleReanalyze = async () => {
    if (!analysis) return;

    setIsReanalyzing(true);
    try {
      const { error } = await supabase.functions.invoke('analyze-medical-image', {
        body: {
          analysis_id: analysis.id,
          user_id: analysis.user_id,
          image_path: analysis.image_path,
          modality: analysis.modality,
          body_region: analysis.body_region,
          notes: analysis.notes,
          template: 'general'
        }
      });

      if (error) throw error;

      toast({
        title: "Re-analysis Started",
        description: "Your image is being re-analyzed with updated models",
      });
      
      await fetchAnalysis();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to re-analyze image",
        variant: "destructive"
      });
    } finally {
      setIsReanalyzing(false);
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

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-96">
            <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!analysis) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-medical-primary mb-4">Analysis Not Found</h2>
            <Button onClick={() => navigate('/dashboard')} variant="medical">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-medical-primary">Medical Analysis</h1>
              <p className="text-muted-foreground">
                Created {new Date(analysis.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge variant={getStatusColor(analysis.status)}>
              {getStatusLabel(analysis.status)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image and Metadata */}
          <Card className="clinical-shadow">
            <CardHeader>
              <CardTitle>Image Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square bg-clinical-surface rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Medical Image</p>
                  <p className="text-xs text-muted-foreground">{analysis.image_path?.split('/').pop()}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium">Modality</label>
                  <p className="text-sm text-muted-foreground">{analysis.modality}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Body Region</label>
                  <p className="text-sm text-muted-foreground">{analysis.body_region}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    className="mt-1"
                    placeholder="Clinical notes..."
                  />
                  <Button 
                    onClick={handleSave}
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    disabled={editedNotes === analysis.notes}
                  >
                    Save Notes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Findings */}
          <Card className="clinical-shadow">
            <CardHeader>
              <CardTitle>AI Findings</CardTitle>
              <CardDescription>
                AI-powered analysis results and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.analysis_result ? (
                <div className="whitespace-pre-wrap text-sm bg-clinical-surface p-4 rounded-lg">
                  {analysis.analysis_result}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No analysis results yet</p>
                  <p className="text-sm text-muted-foreground">
                    Analysis may still be processing
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button
            onClick={handleGenerateReport}
            disabled={!analysis.analysis_result || isGeneratingReport}
            variant="medical"
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>

          <Button
            onClick={() => navigate(`/templates/${analysis.id}`)}
            disabled={!analysis.analysis_result}
            variant="outline"
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Article
          </Button>

          <Button
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            variant="outline"
          >
            {isReanalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Re-analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Re-run Analysis
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
};