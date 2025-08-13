import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { ArrowLeft, FileText, Users, Search, Stethoscope, Wrench } from "lucide-react";

const TEMPLATES = [
  {
    key: "case-report",
    title: "Case Report",
    description: "Individual patient case with clinical findings and outcomes",
    icon: Stethoscope,
    preview: `# Case Report: [Patient Condition]

## Abstract
Brief summary of the case, presenting complaint, and key findings.

## Introduction
Background on the condition and relevance of the case.

## Case Presentation
- **Patient Demographics**: Age, gender, relevant history
- **Presenting Symptoms**: Chief complaint and symptom timeline
- **Clinical Examination**: Physical findings and vital signs
- **Diagnostic Imaging**: AI analysis results and interpretation

## Differential Diagnosis
Possible conditions considered based on clinical presentation.

## Treatment and Management
Therapeutic interventions and patient response.

## Outcome and Follow-up
Patient progress and long-term outcomes.

## Discussion
Clinical significance and lessons learned.

## Conclusion
Key takeaways and clinical implications.`
  },
  {
    key: "retrospective",
    title: "Retrospective Study",
    description: "Analysis of historical patient data and outcomes",
    icon: Search,
    preview: `# Retrospective Analysis: [Study Title]

## Abstract
Study objectives, methods, key findings, and clinical implications.

## Introduction
Background literature and study rationale.

## Methods
### Study Design
Retrospective cohort analysis of [timeframe] data.

### Participants
- **Inclusion Criteria**: Patient selection parameters
- **Exclusion Criteria**: Cases excluded from analysis
- **Sample Size**: Total number of cases analyzed

### Data Collection
- **Imaging Analysis**: AI-powered analysis methodology
- **Clinical Variables**: Demographics, symptoms, outcomes
- **Statistical Methods**: Analysis techniques employed

## Results
### Demographics
Patient population characteristics and baseline data.

### AI Analysis Findings
Key patterns identified through automated image analysis.

### Clinical Outcomes
Treatment responses and follow-up results.

## Discussion
Interpretation of findings and clinical significance.

## Limitations
Study constraints and potential biases.

## Conclusion
Clinical implications and future research directions.`
  },
  {
    key: "prospective",
    title: "Prospective Study",
    description: "Forward-looking study design with predefined endpoints",
    icon: Users,
    preview: `# Prospective Study Protocol: [Research Title]

## Abstract
Study aims, methodology, expected outcomes, and timeline.

## Background and Rationale
Current knowledge gaps and study justification.

## Objectives
### Primary Endpoint
Main research question and measurable outcome.

### Secondary Endpoints
Additional research questions and exploratory analyses.

## Methods
### Study Design
Prospective observational/interventional study design.

### Participant Recruitment
- **Target Population**: Specific patient demographics
- **Enrollment Criteria**: Inclusion and exclusion parameters
- **Sample Size Calculation**: Statistical power analysis

### Imaging Protocol
- **AI Analysis Pipeline**: Automated assessment methodology
- **Quality Control**: Image standardization procedures
- **Data Management**: Collection and storage protocols

### Statistical Analysis Plan
Primary and secondary analysis methodologies.

## Expected Outcomes
Anticipated findings and clinical impact.

## Timeline and Milestones
Study phases and completion targets.

## Ethical Considerations
IRB approval and patient consent procedures.

## Conclusion
Study significance and potential clinical applications.`
  },
  {
    key: "systematic-review",
    title: "Systematic Review",
    description: "Comprehensive review of existing literature on a topic",
    icon: FileText,
    preview: `# Systematic Review: [Topic Area]

## Abstract
Review objectives, search strategy, key findings, and conclusions.

## Introduction
Background context and review rationale.

## Methods
### Search Strategy
- **Databases**: PubMed, Embase, Cochrane Library
- **Search Terms**: Medical subject headings and keywords
- **Inclusion Criteria**: Study types and quality parameters
- **Exclusion Criteria**: Studies excluded from analysis

### Study Selection
Independent reviewer screening process.

### Data Extraction
Standardized data collection methodology.

### Quality Assessment
Risk of bias evaluation tools.

## Results
### Study Characteristics
Overview of included studies and populations.

### AI Analysis Applications
Current state of automated medical image analysis.

### Clinical Outcomes
Summary of treatment effectiveness and safety.

### Risk of Bias Assessment
Study quality evaluation results.

## Discussion
### Summary of Evidence
Key findings and clinical implications.

### Limitations
Review constraints and potential biases.

### Clinical Implications
Practice recommendations based on evidence.

## Conclusion
Summary of findings and research recommendations.

## References
Comprehensive bibliography of reviewed literature.`
  },
  {
    key: "technical-note",
    title: "Technical Note",
    description: "Brief report on technical methods or innovations",
    icon: Wrench,
    preview: `# Technical Note: [Innovation Title]

## Abstract
Brief description of the technical innovation and its applications.

## Introduction
Background and motivation for the technical development.

## Technical Description
### Method Overview
Core technical approach and implementation.

### AI Integration
- **Algorithm Details**: Machine learning methodology
- **Training Data**: Dataset characteristics and validation
- **Performance Metrics**: Accuracy, sensitivity, specificity
- **Implementation**: Software and hardware requirements

### Validation Process
Technical validation and quality assurance procedures.

## Clinical Application
### Use Cases
Specific medical scenarios where the technique applies.

### Workflow Integration
How the method fits into clinical practice.

### Advantages
Benefits compared to existing approaches.

## Results
Performance evaluation and validation outcomes.

## Discussion
### Technical Considerations
Implementation challenges and solutions.

### Future Developments
Potential improvements and extensions.

## Conclusion
Summary of technical contribution and clinical value.

## References
Relevant technical and clinical literature.`
  }
];

export const TemplatesPreview = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);

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
          
          <div>
            <h1 className="text-3xl font-bold text-medical-primary">Academic Writing Templates</h1>
            <p className="text-muted-foreground">
              Preview how your analysis results will be structured in different academic formats
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Template Selection */}
          <div className="lg:col-span-1">
            <Card className="clinical-shadow sticky top-6">
              <CardHeader>
                <CardTitle>Templates</CardTitle>
                <CardDescription>
                  Choose a template to preview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  return (
                    <div
                      key={template.key}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate.key === template.key
                          ? 'border-medical-primary bg-medical-primary/5'
                          : 'border-border hover:border-medical-primary/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-medical-primary" />
                        <div>
                          <h3 className="font-medium text-sm">
                            {template.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Template Preview */}
          <div className="lg:col-span-3">
            <Card className="clinical-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <selectedTemplate.icon className="h-6 w-6 text-medical-primary" />
                    <div>
                      <CardTitle>{selectedTemplate.title}</CardTitle>
                      <CardDescription>
                        {selectedTemplate.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline">Preview</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/20 rounded-lg p-6">
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {selectedTemplate.preview}
                    </pre>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                  <p className="text-sm text-blue-800">
                    When you complete an analysis, your AI findings will be automatically structured using this template. 
                    The placeholders shown above will be filled with your specific case data, imaging results, and clinical context.
                  </p>
                </div>

                <div className="mt-4 flex justify-center">
                  <Button 
                    onClick={() => navigate('/new-analysis')}
                    variant="medical"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Start New Analysis
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