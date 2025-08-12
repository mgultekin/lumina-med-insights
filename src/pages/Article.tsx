import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/layout/Layout";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ArrowLeft, Save, RefreshCw, FileDown, Globe, Loader2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TONES = ["Academic", "Neutral", "Clinical", "Educational"];

interface Analysis {
  id: string;
  user_id: string;
  article_text: string;
  article_title: string;
  tone: string;
  keywords: string[];
  citations: string[];
  published_url: string;
  status: string;
  template_key: string;
  analysis_result: string;
  report_text: string;
}

export const Article = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Editor and metadata state
  const [articleContent, setArticleContent] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [tone, setTone] = useState("Academic");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [citations, setCitations] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newCitation, setNewCitation] = useState("");

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
      
      // Create a properly typed analysis object
      const typedAnalysis: Analysis = {
        id: data.id,
        user_id: data.user_id,
        article_text: data.article_text || "",
        article_title: data.article_title || "",
        tone: data.tone || "Academic",
        keywords: Array.isArray(data.keywords) ? data.keywords.filter((k): k is string => typeof k === 'string') : [],
        citations: Array.isArray(data.citations) ? data.citations.filter((c): c is string => typeof c === 'string') : [],
        published_url: data.published_url || "",
        status: data.status || "",
        template_key: data.template_key || "",
        analysis_result: data.analysis_result || "",
        report_text: data.report_text || ""
      };
      
      setAnalysis(typedAnalysis);
      setArticleContent(typedAnalysis.article_text);
      setArticleTitle(typedAnalysis.article_title);
      setTone(typedAnalysis.tone);
      setKeywords(typedAnalysis.keywords);
      setCitations(typedAnalysis.citations);
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
          article_title: articleTitle,
          tone,
          keywords,
          citations
        })
        .eq('id', analysis.id);

      if (error) throw error;

      setAnalysis({
        ...analysis,
        article_text: articleContent,
        article_title: articleTitle,
        tone,
        keywords,
        citations
      });

      toast({
        title: "Draft Saved",
        description: "Your article draft has been saved successfully",
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!analysis) return;

    setIsRegenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-article', {
        body: {
          analysis_id: analysis.id,
          template_key: analysis.template_key,
          title: articleTitle,
          tone,
          keywords,
          citations,
          use_report: !!analysis.report_text,
          use_analysis: !!analysis.analysis_result
        }
      });

      if (error) throw error;

      toast({
        title: "Article Regeneration Started",
        description: "Your article is being regenerated with current settings",
      });
      
      // Refresh to get the new content
      setTimeout(() => {
        fetchAnalysis();
      }, 2000);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate article",
        variant: "destructive"
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!analysis) return;

    setIsPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('publish-article', {
        body: {
          analysis_id: analysis.id,
          article_text: articleContent,
          article_title: articleTitle,
          tone,
          keywords,
          citations
        }
      });

      if (error) throw error;

      toast({
        title: "Article Published!",
        description: "Your article has been published successfully",
      });
      
      // Refresh to get the published URL
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

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${articleTitle || 'Medical Article'}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
              h1 { color: #2c5aa0; }
              h2 { color: #34495e; margin-top: 30px; }
              h3 { color: #7f8c8d; }
              @media print { body { margin: 20px; } }
            </style>
          </head>
          <body>
            <h1>${articleTitle || 'Medical Article'}</h1>
            ${articleContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const addCitation = () => {
    if (newCitation.trim() && !citations.includes(newCitation.trim())) {
      setCitations([...citations, newCitation.trim()]);
      setNewCitation("");
    }
  };

  const removeCitation = (index: number) => {
    setCitations(citations.filter((_, i) => i !== index));
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
      <div className="container mx-auto px-6 py-8">
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
              <h1 className="text-3xl font-bold text-medical-primary">Article Editor</h1>
              <p className="text-muted-foreground">
                Edit and publish your academic article
              </p>
            </div>
            {analysis.status === 'published' && analysis.published_url && (
              <div className="text-center">
                <Badge variant="default" className="mb-2">Published</Badge>
                <br />
                <a 
                  href={analysis.published_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-medical-primary hover:underline text-sm"
                >
                  View Published Article
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Article Editor - Left Panel */}
          <div className="lg:col-span-3">
            <Card className="clinical-shadow h-full">
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
                <CardDescription>
                  Edit your article using the rich text editor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={articleContent}
                  onChange={setArticleContent}
                  placeholder="Start writing your academic article..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Metadata Panel - Right Panel */}
          <div>
            <Card className="clinical-shadow">
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
                <CardDescription>
                  Article settings and information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    placeholder="Article title..."
                  />
                </div>

                {/* Tone */}
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((toneOption) => (
                        <SelectItem key={toneOption} value={toneOption}>
                          {toneOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Keywords */}
                <div>
                  <Label>Keywords</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Add keyword..."
                      onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                    />
                    <Button onClick={addKeyword} size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {keyword}
                        <button
                          onClick={() => removeKeyword(index)}
                          className="ml-1 text-xs hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Citations */}
                <div>
                  <Label>Citations</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newCitation}
                      onChange={(e) => setNewCitation(e.target.value)}
                      placeholder="Add URL..."
                      onKeyPress={(e) => e.key === 'Enter' && addCitation()}
                    />
                    <Button onClick={addCitation} size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {citations.map((citation, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="text-xs flex-1 truncate">{citation}</span>
                        <button
                          onClick={() => removeCitation(index)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    variant="medical"
                    className="w-full"
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
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    variant="outline"
                    className="w-full"
                  >
                    {isRegenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Re-generate
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleExportPDF}
                    variant="outline"
                    className="w-full"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>

                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing || !articleContent}
                    variant="clinical"
                    className="w-full"
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};