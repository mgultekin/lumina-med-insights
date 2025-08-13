import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/layout/Layout";
import { ArrowLeft, FileText, Loader2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const TEMPLATES = [
  {
    key: "case-report",
    title: "Case Report",
    description: "Individual patient case with clinical findings and outcomes"
  },
  {
    key: "retrospective",
    title: "Retrospective Study",
    description: "Analysis of historical patient data and outcomes"
  },
  {
    key: "prospective",
    title: "Prospective Study", 
    description: "Forward-looking study design with predefined endpoints"
  },
  {
    key: "systematic-review",
    title: "Systematic Review Skeleton",
    description: "Comprehensive review of existing literature on a topic"
  },
  {
    key: "technical-note",
    title: "Technical Note",
    description: "Brief report on technical methods or innovations"
  }
];

const TONES = ["Academic", "Neutral", "Clinical", "Educational"];

interface Analysis {
  id: string;
  user_id: string;
  analysis_result: string;
  report_text: string;
  template_key: string;
  article_title: string;
  tone: string;
  keywords: any;
  citations: any;
}

export const Templates = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [articleTitle, setArticleTitle] = useState<string>("");
  const [tone, setTone] = useState<string>("Academic");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [citations, setCitations] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [citationInput, setCitationInput] = useState<string>("");

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
      if (data.template_key) {
        setSelectedTemplate(data.template_key);
      }
      if (data.article_title) {
        setArticleTitle(data.article_title);
      }
      if (data.tone) {
        setTone(data.tone);
      }
      if (data.keywords && Array.isArray(data.keywords)) {
        setKeywords(data.keywords.filter((k: any) => typeof k === 'string'));
      }
      if (data.citations && Array.isArray(data.citations)) {
        setCitations(data.citations.filter((c: any) => typeof c === 'string'));
      }
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

  const handleSaveMetadata = async () => {
    if (!analysis) return;

    try {
      const { error } = await supabase
        .from('analyses')
        .update({
          template_key: selectedTemplate,
          article_title: articleTitle,
          tone,
          keywords,
          citations
        })
        .eq('id', analysis.id);

      if (error) throw error;

      toast({
        title: "Metadata Saved",
        description: "Your article metadata has been saved",
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to save metadata",
        variant: "destructive"
      });
    }
  };

  const handleGenerateArticle = async () => {
    if (!analysis || !selectedTemplate) return;

    setIsGenerating(true);
    try {
      // Save metadata first
      await handleSaveMetadata();

      // Call the webhook via edge function
      const { error } = await supabase.functions.invoke('generate-article', {
        body: {
          analysis_id: analysis.id,
          template_key: selectedTemplate,
          title: articleTitle || '',
          tone: tone || 'Academic',
          keywords,
          citations,
          use_report: true,
          use_analysis: true
        }
      });

      if (error) throw error;

      toast({
        title: "Article Generated",
        description: "Your academic article has been generated successfully",
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
      setIsGenerating(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const addCitation = () => {
    if (citationInput.trim() && !citations.includes(citationInput.trim())) {
      setCitations([...citations, citationInput.trim()]);
      setCitationInput("");
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
            onClick={() => navigate(`/analysis/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Analysis
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-medical-primary">Choose Article Template</h1>
            <p className="text-muted-foreground">
              Select a template and configure your academic article
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Selection */}
          <div className="lg:col-span-2">
            <Card className="clinical-shadow">
              <CardHeader>
                <CardTitle>Academic Templates</CardTitle>
                <CardDescription>
                  Choose the most appropriate template for your research article
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TEMPLATES.map((template) => (
                    <div
                      key={template.key}
                      onClick={() => setSelectedTemplate(template.key)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template.key
                          ? 'border-medical-primary bg-medical-primary/5'
                          : 'border-border hover:border-medical-primary/50'
                      }`}
                    >
                      <h3 className="font-semibold text-medical-primary mb-2">
                        {template.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div>
            <Card className="clinical-shadow">
              <CardHeader>
                <CardTitle>Article Configuration</CardTitle>
                <CardDescription>
                  Customize your article settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Article Title (Optional)</Label>
                  <Input
                    id="title"
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                    placeholder="Auto-generate if empty"
                  />
                </div>

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

                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="keywords"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Enter keyword and press Enter"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    />
                    <Button onClick={addKeyword} size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {keyword}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeKeyword(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="citations">Citations (Optional)</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="citations"
                      value={citationInput}
                      onChange={(e) => setCitationInput(e.target.value)}
                      placeholder="Enter URL and press Enter"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCitation())}
                    />
                    <Button onClick={addCitation} size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {citations.map((citation, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="text-sm truncate flex-1">{citation}</span>
                        <X 
                          className="h-4 w-4 cursor-pointer" 
                          onClick={() => removeCitation(index)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/analysis/${id}`)}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Analysis
                  </Button>
                  <Button
                    onClick={handleGenerateArticle}
                    disabled={!selectedTemplate || isGenerating}
                    variant="medical"
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Article Draft
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