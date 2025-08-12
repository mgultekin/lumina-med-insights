import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Brain, FileText, BookOpen, Shield, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 text-center space-y-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-medical-primary mb-6 leading-tight">
            AI-Powered Medical
            <span className="block text-medical-accent">Image Analysis</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform medical imaging workflows with advanced AI analysis, automated report generation, 
            and academic article creation. From diagnosis to publication in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="medical" size="lg" className="flex items-center space-x-2" asChild>
              <Link to="/auth/signup">
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="clinical" size="lg" asChild>
              <Link to="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-medical-primary mb-4">
            Complete Medical AI Workflow
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From image upload to published research, streamline your entire medical analysis process
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="clinical-shadow border-0 hover:scale-105 transition-transform duration-200">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-medical-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-medical-primary" />
              </div>
              <CardTitle className="text-xl text-medical-primary">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base leading-relaxed">
                Advanced computer vision models analyze medical images across multiple modalities: 
                MRI, CT, X-ray, and ultrasound with clinical-grade accuracy.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="clinical-shadow border-0 hover:scale-105 transition-transform duration-200">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-medical-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-medical-accent" />
              </div>
              <CardTitle className="text-xl text-medical-primary">Clinical Reports</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base leading-relaxed">
                Generate comprehensive, structured clinical reports that follow medical standards 
                and integrate seamlessly with existing healthcare workflows.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="clinical-shadow border-0 hover:scale-105 transition-transform duration-200">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-medical-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-medical-success" />
              </div>
              <CardTitle className="text-xl text-medical-primary">Academic Publishing</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base leading-relaxed">
                Transform analysis results into publication-ready academic articles with proper 
                formatting, citations, and methodology sections.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-16 bg-muted/30 rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-medical-primary mb-4">
            Built for Healthcare
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-medical-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-medical-primary-foreground" />
            </div>
            <h3 className="font-semibold text-medical-primary mb-2">HIPAA Compliant</h3>
            <p className="text-muted-foreground">End-to-end encryption and secure data handling</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-medical-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-medical-accent-foreground" />
            </div>
            <h3 className="font-semibold text-medical-primary mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">AI analysis results in under 2 minutes</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-medical-success rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-medical-primary mb-2">Multi-Tenant</h3>
            <p className="text-muted-foreground">Secure isolation for healthcare organizations</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-medical-primary mb-6">
            Ready to Transform Your Medical Imaging Workflow?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join leading healthcare institutions already using Lumina for AI-powered medical analysis
          </p>
          <Button variant="medical" size="lg" className="flex items-center space-x-2" asChild>
            <Link to="/auth/signup">
              <span>Get Started Today</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
