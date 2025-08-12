import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileImage, Calendar, Eye, Trash2, FileText, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data - will be replaced with Supabase queries
const mockAnalyses = [
  {
    id: "1",
    modality: "MRI",
    bodyRegion: "Brain",
    status: "analyzed",
    createdAt: "2024-01-15T10:30:00Z",
    notes: "Patient presenting with headaches and visual disturbances",
  },
  {
    id: "2", 
    modality: "CT",
    bodyRegion: "Chest",
    status: "analyzing",
    createdAt: "2024-01-15T09:15:00Z",
    notes: "Follow-up scan for pneumonia treatment",
  },
  {
    id: "3",
    modality: "X-ray",
    bodyRegion: "Hand",
    status: "report_draft",
    createdAt: "2024-01-14T14:45:00Z",
    notes: "Post-surgical evaluation of fracture healing",
  }
];

const getStatusBadge = (status: string) => {
  const statusConfig = {
    uploaded: { label: "Uploaded", className: "status-uploaded" },
    analyzing: { label: "Analyzing", className: "status-analyzing" },
    analyzed: { label: "Analyzed", className: "status-analyzed" },
    report_draft: { label: "Report Draft", className: "status-report-draft" },
    article_draft: { label: "Article Draft", className: "status-report-draft" },
    published: { label: "Published", className: "status-published" },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.uploaded;
  return <span className={config.className}>{config.label}</span>;
};

export const Dashboard = () => {
  return (
    <Layout isAuthenticated onSignOut={() => console.log("Sign out")}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-medical-primary">Medical Analysis Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your AI-powered medical image analyses and reports
            </p>
          </div>
          
          <Button variant="medical" size="lg" className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>New Analysis</span>
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="clinical-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-medical-accent/10 rounded-lg flex items-center justify-center">
                  <FileImage className="h-5 w-5 text-medical-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-medical-primary">23</p>
                  <p className="text-sm text-muted-foreground">Total Analyses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="clinical-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-medical-success/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-medical-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-medical-primary">8</p>
                  <p className="text-sm text-muted-foreground">Reports Generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="clinical-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-medical-warning/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-medical-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-medical-primary">3</p>
                  <p className="text-sm text-muted-foreground">Articles Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="clinical-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-medical-info/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-medical-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-medical-primary">5</p>
                  <p className="text-sm text-muted-foreground">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Analyses */}
        <Card className="clinical-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileImage className="h-5 w-5" />
              <span>Recent Analyses</span>
            </CardTitle>
            <CardDescription>
              Your latest medical image analyses and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mockAnalyses.length === 0 ? (
              <div className="text-center py-12">
                <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-medical-primary mb-2">No analyses yet</h3>
                <p className="text-muted-foreground mb-6">Upload your first medical case to get started</p>
                <Button variant="medical">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload First Case
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {mockAnalyses.map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-medical-primary/10 rounded-lg flex items-center justify-center">
                        <FileImage className="h-6 w-6 text-medical-primary" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-medical-primary">
                            {analysis.modality} - {analysis.bodyRegion}
                          </h4>
                          {getStatusBadge(analysis.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{analysis.notes}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(analysis.createdAt).toLocaleDateString()} at{" "}
                          {new Date(analysis.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {analysis.status === "analyzed" && (
                        <Button variant="clinical" size="sm">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Generate Article
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};