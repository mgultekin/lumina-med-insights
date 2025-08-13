import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/layout/Layout";
import { FileText, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const TEMPLATES = [
  {
    key: "case-report",
    title: "Case Report",
    description: "Individual patient case with clinical findings and outcomes",
    example: "Detailed case presentation including patient history, clinical findings, diagnosis, treatment, and follow-up outcomes."
  },
  {
    key: "retrospective",
    title: "Retrospective Study",
    description: "Analysis of historical patient data and outcomes",
    example: "Systematic review of past medical records to identify patterns, outcomes, and correlations in patient care."
  },
  {
    key: "prospective",
    title: "Prospective Study", 
    description: "Forward-looking study design with predefined endpoints",
    example: "Research design that follows patients forward in time to observe outcomes and test hypotheses."
  },
  {
    key: "systematic-review",
    title: "Systematic Review Skeleton",
    description: "Comprehensive review of existing literature on a topic",
    example: "Evidence-based analysis synthesizing findings from multiple studies using standardized methodology."
  },
  {
    key: "technical-note",
    title: "Technical Note",
    description: "Brief report on technical methods or innovations",
    example: "Concise documentation of new techniques, procedures, or technological advances in medical practice."
  }
];

const EXAMPLE_METADATA = {
  title: "AI-Assisted Diagnosis in Radiology: A Case Study",
  tone: "Academic",
  keywords: ["artificial intelligence", "radiology", "diagnostic imaging", "machine learning", "clinical decision support"],
  citations: [
    "https://pubmed.ncbi.nlm.nih.gov/example1",
    "https://doi.org/10.1000/example2",
    "https://journals.example.com/article3"
  ]
};

export const AcademicTemplates = () => {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("case-report");

  const selectedTemplateData = TEMPLATES.find(t => t.key === selectedTemplate);

  return (
    <Layout isAuthenticated={!!user}>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-medical-primary mb-2">Academic Writing Templates</h1>
          <p className="text-xl text-muted-foreground">
            Explore our professional templates for medical research publications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template Selection */}
          <div className="lg:col-span-2">
            <Card className="clinical-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-medical-primary" />
                  Available Templates
                </CardTitle>
                <CardDescription>
                  Choose from our professionally designed academic writing templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {TEMPLATES.map((template) => (
                    <div
                      key={template.key}
                      onClick={() => setSelectedTemplate(template.key)}
                      className={`p-6 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate === template.key
                          ? 'border-medical-primary bg-medical-primary/5 shadow-md'
                          : 'border-border hover:border-medical-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-medical-primary">
                          {template.title}
                        </h3>
                        {selectedTemplate === template.key && (
                          <Badge variant="default" className="bg-medical-primary">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {template.description}
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        Example: {template.example}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div>
            <Card className="clinical-shadow">
              <CardHeader>
                <CardTitle>Template Preview</CardTitle>
                <CardDescription>
                  {selectedTemplateData?.title} configuration example
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-medical-primary">Article Title</Label>
                  <Input
                    value={EXAMPLE_METADATA.title}
                    readOnly
                    className="mt-1 bg-muted"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-medical-primary">Tone</Label>
                  <Select value={EXAMPLE_METADATA.tone} disabled>
                    <SelectTrigger className="mt-1 bg-muted">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Academic">Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-medical-primary">Keywords</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {EXAMPLE_METADATA.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-medical-primary">Sample Citations</Label>
                  <div className="space-y-2 mt-1">
                    {EXAMPLE_METADATA.citations.map((citation, index) => (
                      <div key={index} className="p-2 bg-muted rounded text-xs font-mono">
                        {citation}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="clinical-shadow mt-6">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="p-4 bg-medical-primary/5 rounded-lg border border-medical-primary/20">
                    <p className="text-sm text-muted-foreground">
                      To use these templates with your own analysis results, please start a new analysis from the dashboard.
                    </p>
                  </div>
                  <Link to="/new-analysis">
                    <Button variant="medical" className="w-full">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Start New Analysis
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};