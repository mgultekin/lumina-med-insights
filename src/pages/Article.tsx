import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Layout } from "@/components/layout/Layout";
import { ArrowLeft, Save, Globe, Download, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Analysis {
  id: string;
  user_id: string;
  article_text: string;
  published_url: string;
  status: string;
}

export const Article = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [articleContent, setArticleContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchAnalysis();
    }
  }, [id, user]);

  const fetchAnalysis = async () => {
    try {
      const { data, error } = await supabase
        .from('analyses')
        .select('id, user_id, article_text, published_url, status')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      setAnalysis(data);
      setArticleContent(data.article_text || "");
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load article",
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!analysis) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('analyses')
        .update({ 
          article_text: articleContent,
          status: 'article_draft'
        })
        .eq('id', analysis.id);

      if (error) throw error;

      setAnalysis({ ...analysis, article_text: articleContent, status: 'article_draft' });
      toast({
        title: "Draft Saved",
        description: "Your article draft has been saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!analysis) return;

    setIsPublishing(true);
    try {
      const { error } = await supabase.functions.invoke('publish-article', {
        body: {
          analysis_id: analysis.id,
          article_text: articleContent,
          title: extractTitle(articleContent)
        }
      });

      if (error) throw error;

      toast({
        title: "Publishing Started",
        description: "Your article is being published",
      });
      
      await fetchAnalysis();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to publish article",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const extractTitle = (content: string): string => {
    const lines = content.split('\n');
    const titleLine = lines.find(line => line.trim().startsWith('#'));
    return titleLine ? titleLine.replace(/^#+\s*/, '').trim() : 'Medical Analysis Article';
  };

  const exportToPDF = () => {
    // Simple client-side PDF export placeholder
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${extractTitle(articleContent)}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1, h2, h3 { color: #0D2233; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${articleContent}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
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
            <h2 className="text-2xl font-bold text-medical-primary mb-4">Article Not Found</h2>
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
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/analysis/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Analysis
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-medical-primary">Academic Article</h1>
              <p className="text-muted-foreground">
                Draft and publish your medical research article
              </p>
            </div>
            
            {analysis.published_url && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <p className="text-sm text-green-800 mb-2">Article Published!</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(analysis.published_url, '_blank')}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    View Published
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="clinical-shadow">
          <CardHeader>
            <CardTitle>Article Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={articleContent}
              onChange={(e) => setArticleContent(e.target.value)}
              placeholder="# Article Title

## Abstract
Provide a brief summary of your findings...

## Introduction
Background and context...

## Methods
Describe the methodology...

## Results
Present your findings...

## Discussion
Interpret the results...

## Conclusion
Summarize key findings..."
              className="min-h-[600px] font-mono text-sm"
            />
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-wrap gap-4">
          <Button
            onClick={handleSaveDraft}
            disabled={isSaving}
            variant="outline"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </>
            )}
          </Button>

          <Button
            onClick={handlePublish}
            disabled={isPublishing || !articleContent.trim()}
            variant="medical"
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Publish Article
              </>
            )}
          </Button>

          <Button
            onClick={exportToPDF}
            disabled={!articleContent.trim()}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
    </Layout>
  );
};