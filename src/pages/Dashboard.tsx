import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { Plus, Eye, FileText, Trash2, Loader2, Globe, RefreshCw, ImageIcon, MonitorIcon } from "lucide-react";
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
  image_paths: string[];
  image_path: string;
  analysis_result: string;
  report_text: string;
  article_text: string;
  published_url: string;
  model: string;
  task: string;
}

export const Dashboard = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState<{[key: string]: string}>({});
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
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure image_paths is properly typed
      const transformedData = (data || []).map(item => ({
        ...item,
        image_paths: Array.isArray(item.image_paths) ? 
          item.image_paths.filter((path): path is string => typeof path === 'string') : 
          typeof item.image_paths === 'string' ? [item.image_paths] : [],
        analysis_result: item.analysis_result || '',
        report_text: item.report_text || '',
        article_text: item.article_text || '',
        published_url: item.published_url || '',
        modality: item.modality || '',
        body_region: item.body_region || '',
        notes: item.notes || '',
        model: item.model || 'gpt-4o-mini-vision',
        task: item.task || 'analysis',
        image_path: item.image_path || ''
      }));
      
      setAnalyses(transformedData);
      
      // Load thumbnails for images
      transformedData.forEach(async (analysis) => {
        const primaryImagePath = analysis.image_paths && analysis.image_paths.length > 0 ? 
          analysis.image_paths[0] : analysis.image_path;
        
        if (primaryImagePath && !primaryImagePath.toLowerCase().includes('.dcm')) {
          const thumbnailUrl = await getImageThumbnail(primaryImagePath);
          if (thumbnailUrl) {
            setThumbnails(prev => ({ ...prev, [analysis.id]: thumbnailUrl }));
          }
        }
      });
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

  const handleDelete = async (id: string, imagePaths: string[], imagePath: string) => {
    if (!confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) return;

    try {
      // Collect all image paths to delete
      const allImagePaths = [];
      if (imagePath) allImagePaths.push(imagePath);
      if (imagePaths && imagePaths.length > 0) allImagePaths.push(...imagePaths);
      
      // Remove duplicates
      const uniqueImagePaths = [...new Set(allImagePaths)];
      
      if (uniqueImagePaths.length > 0) {
        await supabase.storage.from('medical-images').remove(uniqueImagePaths);
      }

      const { error } = await supabase
        .from('analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAnalyses(analyses.filter(a => a.id !== id));
      setThumbnails(prev => {
        const newThumbnails = { ...prev };
        delete newThumbnails[id];
        return newThumbnails;
      });
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

  const getImageThumbnail = async (imagePath: string) => {
    if (!imagePath) return null;
    try {
      const { data, error } = await supabase.rpc('sign_image' as any, {
        p_path: imagePath,
        expires: 300
      });
      
      if (error) throw error;
      return data || null;
    } catch {
      return null;
    }
  };

  const handleGenerateReport = async (analysisId: string) => {
    try {
      const { error } = await supabase.functions.invoke('generate-report', {
        body: { analysis_id: analysisId }
      });
      
      if (error) throw error;
      
      toast({
        title: "Report Generation Started",
        description: "Your clinical report is being generated",
      });
      
      // Refresh analyses to update the UI
      setTimeout(() => fetchAnalyses(), 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    }
  };

  const handlePublish = async (analysisId: string) => {
    try {
      const analysis = analyses.find(a => a.id === analysisId);
      if (!analysis) return;
      
      const { error } = await supabase.functions.invoke('publish-article', {
        body: {
          analysis_id: analysisId,
          article_text: analysis.article_text,
          article_title: 'Medical Analysis Article',
          tone: 'Academic',
          keywords: [],
          citations: []
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Article Published!",
        description: "Your article has been published successfully",
      });
      
      // Refresh analyses to update the UI
      setTimeout(() => fetchAnalyses(), 1000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to publish article",
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

  const renderImageThumbnail = (analysis: Analysis) => {
    const primaryImagePath = analysis.image_paths && analysis.image_paths.length > 0 ? 
      analysis.image_paths[0] : analysis.image_path;
    
    const isDicom = primaryImagePath?.toLowerCase().includes('.dcm');
    const thumbnailUrl = thumbnails[analysis.id];

    if (isDicom) {
      return (
        <div className="w-full h-full bg-muted/20 rounded flex items-center justify-center">
          <MonitorIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      );
    }

    if (thumbnailUrl) {
      return (
        <img 
          src={thumbnailUrl} 
          alt="Medical image thumbnail"
          className="w-full h-full object-cover rounded"
        />
      );
    }

    return (
      <div className="w-full h-full bg-muted/20 rounded flex items-center justify-center">
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  };

  return (
    <Layout isAuthenticated onSignOut={signOut}>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-medical-primary">Dashboard</h1>
            <p className="text-muted-foreground">Manage your medical image analyses</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/templates')} 
              variant="outline"
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Preview Templates</span>
            </Button>
            <Button 
              onClick={() => navigate('/new-analysis')} 
              variant="medical"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Analysis</span>
            </Button>
          </div>
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
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={getStatusColor(analysis.status)} className="text-xs">
                        {getStatusLabel(analysis.status)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {analysis.model}
                      </Badge>
                      {analysis.task && (
                        <Badge variant="secondary" className="text-xs">
                          {analysis.task}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-square bg-clinical-surface rounded-lg flex items-center justify-center overflow-hidden">
                    {analysis.image_paths && analysis.image_paths.length > 0 || analysis.image_path ? (
                      <div className="w-full h-full relative">
                        {renderImageThumbnail(analysis)}
                        {(analysis.image_paths?.length > 1) && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            +{analysis.image_paths.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">No images</p>
                      </div>
                    )}
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

                  {/* Quick Actions */}
                  <div className="space-y-2 pt-2">
                    {/* Row 1: View and Delete */}
                    <div className="flex items-center space-x-2">
                      <Button 
                        onClick={() => navigate(`/analysis/${analysis.id}`)}
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                      >
                        <Eye className="mr-2 h-3 w-3" />
                        View
                      </Button>
                      
                      <Button 
                        onClick={() => handleDelete(analysis.id, analysis.image_paths || [], analysis.image_path || '')}
                        variant="outline" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Row 2: Generate Report and Generate Article */}
                    <div className="flex items-center space-x-2">
                      <Button 
                        onClick={() => handleGenerateReport(analysis.id)}
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        disabled={!!analysis.report_text}
                      >
                        <FileText className="mr-2 h-3 w-3" />
                        Report
                      </Button>
                      
                      <Button 
                        onClick={() => navigate(`/templates/${analysis.id}`)}
                        variant="outline" 
                        size="sm"
                        className="flex-1"
                        disabled={!analysis.analysis_result}
                      >
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Article
                      </Button>
                    </div>

                    {/* Row 3: Publish (if article exists) */}
                    {analysis.article_text && (
                      <Button 
                        onClick={() => handlePublish(analysis.id)}
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        disabled={analysis.status === 'published'}
                      >
                        <Globe className="mr-2 h-3 w-3" />
                        {analysis.status === 'published' ? 'Published' : 'Publish'}
                      </Button>
                    )}
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