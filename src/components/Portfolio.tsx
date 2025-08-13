import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Github, 
  ExternalLink, 
  Code, 
  Database, 
  Shield, 
  Zap, 
  Brain,
  FileText,
  BookOpen,
  Users,
  Award,
  TrendingUp
} from "lucide-react";

/**
 * Portfolio showcase component highlighting the Lumina Medical AI Platform
 * Demonstrates technical expertise in healthcare technology and full-stack development
 */
const Portfolio = () => {
  const technologies = [
    { name: "React 18.3", icon: Code, category: "Frontend" },
    { name: "TypeScript", icon: Code, category: "Frontend" },
    { name: "Tailwind CSS", icon: Code, category: "Frontend" },
    { name: "Supabase", icon: Database, category: "Backend" },
    { name: "PostgreSQL", icon: Database, category: "Backend" },
    { name: "Edge Functions", icon: Zap, category: "Backend" },
    { name: "Computer Vision AI", icon: Brain, category: "AI/ML" },
    { name: "NLP", icon: Brain, category: "AI/ML" },
  ];

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Multi-modal medical image analysis with computer vision models for MRI, CT, X-ray, and ultrasound imaging."
    },
    {
      icon: FileText,
      title: "Clinical Reports",
      description: "Automated generation of standardized clinical reports following medical guidelines and best practices."
    },
    {
      icon: BookOpen,
      title: "Academic Publishing",
      description: "Template-based article generation supporting case reports, studies, and systematic reviews."
    },
    {
      icon: Shield,
      title: "HIPAA Compliance",
      description: "Healthcare-grade security with end-to-end encryption, RLS policies, and audit logging."
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Sub-2-minute AI analysis with live progress tracking and real-time updates."
    },
    {
      icon: Users,
      title: "Multi-tenant Architecture",
      description: "Secure organizational data isolation with scalable infrastructure design."
    }
  ];

  const achievements = [
    {
      icon: TrendingUp,
      title: "Performance",
      value: "< 2 min",
      description: "AI analysis processing time"
    },
    {
      icon: Shield,
      title: "Security",
      value: "HIPAA",
      description: "Compliant healthcare platform"
    },
    {
      icon: Code,
      title: "Code Quality",
      value: "100%",
      description: "TypeScript coverage"
    },
    {
      icon: Users,
      title: "Scalability",
      value: "Multi-tenant",
      description: "Enterprise-ready architecture"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-medical-primary">
          Lumina Medical AI Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A comprehensive healthcare technology platform demonstrating expertise in 
          full-stack development, AI integration, and medical software engineering.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="medical" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Live Demo
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Github className="h-4 w-4" />
            View Code
          </Button>
        </div>
      </div>

      {/* Project Overview */}
      <Card className="clinical-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-medical-primary">
            <Award className="h-5 w-5" />
            Project Highlights
          </CardTitle>
          <CardDescription>
            Key technical achievements and innovations in healthcare technology
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="w-12 h-12 bg-medical-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <achievement.icon className="h-6 w-6 text-medical-primary" />
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-medical-primary">
                    {achievement.value}
                  </div>
                  <div className="text-sm font-medium">{achievement.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {achievement.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card className="clinical-shadow">
        <CardHeader>
          <CardTitle className="text-medical-primary">Technology Stack</CardTitle>
          <CardDescription>
            Modern technologies and frameworks used in the development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {["Frontend", "Backend", "AI/ML"].map(category => (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-medical-primary border-b pb-2">
                  {category}
                </h3>
                <div className="space-y-2">
                  {technologies
                    .filter(tech => tech.category === category)
                    .map((tech, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <tech.icon className="h-4 w-4 text-medical-accent" />
                        <span className="text-sm">{tech.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card className="clinical-shadow">
        <CardHeader>
          <CardTitle className="text-medical-primary">Core Features</CardTitle>
          <CardDescription>
            Comprehensive medical workflow from analysis to publication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="space-y-3">
                <div className="w-10 h-10 bg-medical-accent/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-medical-accent" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-medical-primary">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Architecture */}
      <Card className="clinical-shadow">
        <CardHeader>
          <CardTitle className="text-medical-primary">System Architecture</CardTitle>
          <CardDescription>
            Scalable, secure, and maintainable system design
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-medical-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Code className="h-8 w-8 text-medical-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-medical-primary">Frontend</h3>
                  <p className="text-sm text-muted-foreground">
                    React SPA with TypeScript, responsive design, and real-time updates
                  </p>
                </div>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-medical-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Database className="h-8 w-8 text-medical-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-medical-primary">Backend</h3>
                  <p className="text-sm text-muted-foreground">
                    Supabase with PostgreSQL, RLS, and serverless edge functions
                  </p>
                </div>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-medical-success/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Brain className="h-8 w-8 text-medical-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-medical-primary">AI Services</h3>
                  <p className="text-sm text-muted-foreground">
                    Computer vision and NLP models via webhook integration
                  </p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="font-semibold text-medical-primary">Key Technical Decisions</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="text-medical-primary border-medical-primary">
                    Security First
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    HIPAA compliance with end-to-end encryption, RLS policies, and audit logging
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-medical-accent border-medical-accent">
                    Scalable Architecture
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Multi-tenant design supporting thousands of users with data isolation
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-medical-success border-medical-success">
                    Real-time UX
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Live progress tracking and instant updates for optimal user experience
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-purple-600 border-purple-600">
                    AI Integration
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Seamless AI workflow integration with webhook architecture
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Info */}
      <Card className="clinical-shadow border-medical-primary/20">
        <CardHeader>
          <CardTitle className="text-medical-primary">About the Developer</CardTitle>
          <CardDescription>
            Full-Stack Developer & Healthcare Technology Specialist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              This project demonstrates expertise in modern web development, healthcare technology, 
              and AI integration. Built with a focus on security, scalability, and user experience 
              in the medical domain.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge>React/TypeScript</Badge>
              <Badge>Healthcare Software</Badge>
              <Badge>AI Integration</Badge>
              <Badge>Full-Stack Development</Badge>
              <Badge>HIPAA Compliance</Badge>
              <Badge>UI/UX Design</Badge>
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="medical" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Portfolio Website
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Portfolio;