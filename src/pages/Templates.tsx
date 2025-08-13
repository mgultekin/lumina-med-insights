import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/layout/Layout";
import { ArrowLeft, FileText, Loader2, X, Wand2, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

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
    title: "Systematic Review",
    description: "Comprehensive review of existing literature on a topic"
  },
  {
    key: "technical-note",
    title: "Technical Note",
    description: "Brief report on technical methods or innovations"
  }
];

interface ArticleSections {
  title: string;
  abstract: string;
  introduction: string;
  methods: string;
  results: string;
  discussion: string;
  conclusion: string;
  references: string[];
}

interface AIAssistanceToggles {
  introduction: boolean;
  discussion: boolean;
  abstract: boolean;
  conclusion: boolean;
}

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
  modality: string;
  body_region: string;
}

export const Templates = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandingSection, setExpandingSection] = useState<string | null>(null);
  
  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState<string>("case-report");
  const [articleSections, setArticleSections] = useState<ArticleSections>({
    title: "",
    abstract: "",
    introduction: "",
    methods: "",
    results: "",
    discussion: "",
    conclusion: "",
    references: []
  });
  const [keywords, setKeywords] = useState<string[]>([]);
  const [citations, setCitations] = useState<string[]>([]);
  
  // AI Assistance toggles
  const [aiToggles, setAiToggles] = useState<AIAssistanceToggles>({
    introduction: false,
    discussion: false,
    abstract: false,
    conclusion: false
  });

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
      
      // Initialize article sections with existing data or autofilled content
      const generatedTitle = data.article_title || generateTitle(data);
      const methodsContent = data.report_text || data.analysis_result || "";
      const resultsContent = data.report_text || data.analysis_result || "";
      
      setArticleSections({
        title: generatedTitle,
        abstract: "",
        introduction: "",
        methods: methodsContent,
        results: resultsContent,
        discussion: "",
        conclusion: "",
        references: (Array.isArray(data.citations) ? data.citations.filter((c: any) => typeof c === 'string') : [])
      });
      
      if (data.template_key) {
        setSelectedTemplate(data.template_key);
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

  const generateTitle = (data: Analysis) => {
    if (data.article_title) return data.article_title;
    
    const modality = data.modality || "Medical";
    const bodyRegion = data.body_region || "Imaging";
    return `${modality} ${bodyRegion} Analysis: Clinical Findings and Assessment`;
  };

  const handleSaveDraft = async () => {
    if (!analysis) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('analyses')
        .update({
          template_key: selectedTemplate,
          article_title: articleSections.title,
          keywords,
          citations
        })
        .eq('id', analysis.id);

      if (error) throw error;

      toast({
        title: "Draft Saved",
        description: "Your article draft has been saved",
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

  const handleInsertAnalysis = async () => {
    if (!analysis || !selectedTemplate) return;

    setIsGenerating(true);
    try {
      // Compose HTML from template and current sections
      const htmlContent = composeHtmlFromSections();
      
      const { error } = await supabase
        .from('analyses')
        .update({
          template_key: selectedTemplate,
          article_title: articleSections.title,
          article_text: htmlContent,
          status: 'article_draft',
          keywords,
          citations
        })
        .eq('id', analysis.id);

      if (error) throw error;

      toast({
        title: "Analysis Inserted",
        description: "Analysis data has been inserted into the template",
      });
      
      navigate(`/article/${analysis.id}`);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to insert analysis into template",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAllSections = async () => {
    if (!analysis || !selectedTemplate) return;

    // Check which sections are enabled for AI
    const enabledSections = Object.entries(aiToggles)
      .filter(([_, enabled]) => enabled)
      .map(([section, _]) => section);

    if (enabledSections.length === 0) {
      toast({
        title: "No Sections Selected",
        description: "Please enable AI assistance for at least one section",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-article', {
        body: {
          analysis_id: analysis.id,
          template_key: selectedTemplate,
          title: articleSections.title,
          tone: "Academic",
          keywords,
          citations,
          use_report: true,
          use_analysis: true,
          sections: articleSections,
          enabled_sections: enabledSections
        }
      });

      if (error) throw error;

      toast({
        title: "Selected Sections Generated",
        description: `Generated AI content for ${enabledSections.length} section(s)`,
      });
      
      // Refresh to see generated content
      await fetchAnalysis();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate sections",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExpandSection = async (sectionKey: string) => {
    if (!analysis) return;

    setExpandingSection(sectionKey);
    try {
      // Call AI to expand just this section
      const { data, error } = await supabase.functions.invoke('generate-article', {
        body: {
          analysis_id: analysis.id,
          template_key: selectedTemplate,
          title: articleSections.title,
          tone: "Academic",
          keywords,
          citations,
          expand_section: sectionKey,
          current_sections: articleSections
        }
      });

      if (error) throw error;

      // Update the specific section with generated content
      if (data?.expanded_content) {
        setArticleSections(prev => ({
          ...prev,
          [sectionKey]: data.expanded_content
        }));
        
        toast({
          title: "Section Expanded",
          description: `${sectionKey} section has been generated`,
        });
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: `Failed to expand ${sectionKey} section`,
        variant: "destructive"
      });
    } finally {
      setExpandingSection(null);
    }
  };

  const composeHtmlFromSections = () => {
    let html = `<article class="academic-article">`;
    
    if (articleSections.title) {
      html += `<h1>${articleSections.title}</h1>`;
    }
    
    if (articleSections.abstract) {
      html += `<section class="abstract"><h2>Abstract</h2><p>${articleSections.abstract}</p></section>`;
    }
    
    if (articleSections.introduction) {
      html += `<section class="introduction"><h2>Introduction</h2><p>${articleSections.introduction}</p></section>`;
    }
    
    if (articleSections.methods) {
      html += `<section class="methods"><h2>Methods/Case Description</h2><p>${articleSections.methods}</p></section>`;
    }
    
    if (articleSections.results) {
      html += `<section class="results"><h2>Results/Findings</h2><p>${articleSections.results}</p></section>`;
    }
    
    if (articleSections.discussion) {
      html += `<section class="discussion"><h2>Discussion</h2><p>${articleSections.discussion}</p></section>`;
    }
    
    if (articleSections.conclusion) {
      html += `<section class="conclusion"><h2>Conclusion</h2><p>${articleSections.conclusion}</p></section>`;
    }
    
    if (articleSections.references.length > 0) {
      html += `<section class="references"><h2>References</h2><ol>`;
      articleSections.references.forEach(ref => {
        html += `<li>${ref}</li>`;
      });
      html += `</ol></section>`;
    }
    
    html += `</article>`;
    return html;
  };

  const updateSection = (sectionKey: keyof ArticleSections, value: string | string[]) => {
    setArticleSections(prev => ({
      ...prev,
      [sectionKey]: value
    }));
  };

  const addReference = (ref: string) => {
    if (ref.trim() && !articleSections.references.includes(ref.trim())) {
      setArticleSections(prev => ({
        ...prev,
        references: [...prev.references, ref.trim()]
      }));
    }
  };

  const updateAiToggle = (section: keyof AIAssistanceToggles, enabled: boolean) => {
    setAiToggles(prev => ({
      ...prev,
      [section]: enabled
    }));
  };

  const removeReference = (index: number) => {
    setArticleSections(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

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
            <h1 className="text-3xl font-bold text-medical-primary">Compose Article</h1>
            <p className="text-muted-foreground">
              Template-first approach: select a layout and customize each section
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template Selection */}
          <div>
            <Card className="clinical-shadow">
              <CardHeader>
                <CardTitle>Choose Template Layout</CardTitle>
                <CardDescription>
                  Select the academic template structure for your article
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {TEMPLATES.map((template) => (
                    <div
                      key={template.key}
                      onClick={() => setSelectedTemplate(template.key)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template.key
                          ? 'border-medical-primary bg-medical-primary/5 shadow-md'
                          : 'border-border hover:border-medical-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-medical-primary">
                          {template.title}
                        </h3>
                        {selectedTemplate === template.key && (
                          <Badge variant="default" className="bg-medical-primary">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sections Panel */}
          <div>
            <Card className="clinical-shadow">
              <CardHeader>
                <CardTitle>Article Sections</CardTitle>
                <CardDescription>
                  Configure each section of your article
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* AI Assistance Toggle Row */}
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-medical-primary mb-3">AI Assistance (optional)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ai-introduction"
                        checked={aiToggles.introduction}
                        onCheckedChange={(checked) => updateAiToggle('introduction', !!checked)}
                      />
                      <Label htmlFor="ai-introduction" className="text-sm">Enable AI for Introduction</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ai-discussion"
                        checked={aiToggles.discussion}
                        onCheckedChange={(checked) => updateAiToggle('discussion', !!checked)}
                      />
                      <Label htmlFor="ai-discussion" className="text-sm">Enable AI for Discussion</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ai-abstract"
                        checked={aiToggles.abstract}
                        onCheckedChange={(checked) => updateAiToggle('abstract', !!checked)}
                      />
                      <Label htmlFor="ai-abstract" className="text-sm">Enable AI for Abstract</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ai-conclusion"
                        checked={aiToggles.conclusion}
                        onCheckedChange={(checked) => updateAiToggle('conclusion', !!checked)}
                      />
                      <Label htmlFor="ai-conclusion" className="text-sm">Enable AI for Conclusion</Label>
                    </div>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="title">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <span>1. Title</span>
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Input
                          value={articleSections.title}
                          onChange={(e) => updateSection('title', e.target.value)}
                          placeholder="Article title"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="abstract">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <span>2. Abstract</span>
                        <Badge variant="secondary" className="text-xs">Optional</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Textarea
                          value={articleSections.abstract}
                          onChange={(e) => updateSection('abstract', e.target.value)}
                          placeholder="Abstract content"
                          rows={3}
                        />
                        <Button
                          onClick={() => handleExpandSection('abstract')}
                          disabled={expandingSection === 'abstract' || !aiToggles.abstract}
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          {expandingSection === 'abstract' ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <Wand2 className="mr-2 h-3 w-3" />
                          )}
                          AI: Expand {!aiToggles.abstract && "(Enable AI first)"}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="introduction">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <span>3. Introduction</span>
                        <Badge variant="secondary" className="text-xs">Optional</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Textarea
                          value={articleSections.introduction}
                          onChange={(e) => updateSection('introduction', e.target.value)}
                          placeholder="Introduction content"
                          rows={4}
                        />
                        <Button
                          onClick={() => handleExpandSection('introduction')}
                          disabled={expandingSection === 'introduction' || !aiToggles.introduction}
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          {expandingSection === 'introduction' ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <Wand2 className="mr-2 h-3 w-3" />
                          )}
                          AI: Expand {!aiToggles.introduction && "(Enable AI first)"}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="methods">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <span>4. Methods/Case Description</span>
                        <Badge variant="default" className="text-xs bg-green-600">Source-filled</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Textarea
                          value={articleSections.methods}
                          onChange={(e) => updateSection('methods', e.target.value)}
                          placeholder="Methods or case description"
                          rows={4}
                        />
                        <Button
                          onClick={() => handleExpandSection('methods')}
                          disabled={expandingSection === 'methods'}
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          {expandingSection === 'methods' ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-3 w-3" />
                          )}
                          AI: Rewrite
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="results">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <span>5. Results/Findings</span>
                        <Badge variant="default" className="text-xs bg-green-600">Source-filled</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Textarea
                          value={articleSections.results}
                          onChange={(e) => updateSection('results', e.target.value)}
                          placeholder="Results or findings"
                          rows={4}
                        />
                        <Button
                          onClick={() => handleExpandSection('results')}
                          disabled={expandingSection === 'results'}
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          {expandingSection === 'results' ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-3 w-3" />
                          )}
                          AI: Rewrite
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="discussion">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <span>6. Discussion</span>
                        <Badge variant="secondary" className="text-xs">Optional</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Textarea
                          value={articleSections.discussion}
                          onChange={(e) => updateSection('discussion', e.target.value)}
                          placeholder="Discussion content"
                          rows={4}
                        />
                        <Button
                          onClick={() => handleExpandSection('discussion')}
                          disabled={expandingSection === 'discussion' || !aiToggles.discussion}
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          {expandingSection === 'discussion' ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <Wand2 className="mr-2 h-3 w-3" />
                          )}
                          AI: Expand {!aiToggles.discussion && "(Enable AI first)"}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="conclusion">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <span>7. Conclusion</span>
                        <Badge variant="secondary" className="text-xs">Optional</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Textarea
                          value={articleSections.conclusion}
                          onChange={(e) => updateSection('conclusion', e.target.value)}
                          placeholder="Conclusion content"
                          rows={3}
                        />
                        <Button
                          onClick={() => handleExpandSection('conclusion')}
                          disabled={expandingSection === 'conclusion' || !aiToggles.conclusion}
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          {expandingSection === 'conclusion' ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : (
                            <Wand2 className="mr-2 h-3 w-3" />
                          )}
                          AI: Expand {!aiToggles.conclusion && "(Enable AI first)"}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="references">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <span>8. References</span>
                        <Badge variant="outline" className="text-xs">From Analysis</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {articleSections.references.map((ref, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <span className="text-sm flex-1">{ref}</span>
                            <Button
                              onClick={() => removeReference(index)}
                              size="sm"
                              variant="ghost"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Input
                          placeholder="Add reference URL"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addReference(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Bottom Actions */}
                <div className="pt-6 space-y-3">
                  <Button
                    onClick={handleInsertAnalysis}
                    disabled={isGenerating}
                    variant="medical"
                    className="w-full"
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    Insert Analysis into Template
                  </Button>
                  
                  <Button
                    onClick={handleGenerateAllSections}
                    disabled={isGenerating || Object.values(aiToggles).every(v => !v)}
                    variant="outline"
                    className="w-full"
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Generate Selected Sections with AI
                  </Button>
                  
                  <Button
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    variant="secondary"
                    className="w-full"
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Save Draft'
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