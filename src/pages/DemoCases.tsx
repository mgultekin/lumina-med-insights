import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { Loader2, ImageIcon, PlayCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DemoCase {
  id: string;
  title: string;
  description: string;
  modality: string;
  body_region: string;
  image_paths: string[];
  analysis_result: string;
  report_text: string;
  article_sections: any;
  created_at: string;
}

export const DemoCases = () => {
  const [demoCases, setDemoCases] = useState<DemoCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState<{[key: string]: string}>({});
  const [copying, setCopying] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDemoCases();
  }, []);

  const fetchDemoCases = async () => {
    try {
      const { data, error } = await supabase
        .from('demo_cases' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const demoCasesData = (data || []) as unknown as DemoCase[];
      setDemoCases(demoCasesData);
      
      // Load thumbnails for each case
      if (demoCasesData) {
        for (const demoCase of demoCasesData) {
          if (demoCase.image_paths && Array.isArray(demoCase.image_paths) && demoCase.image_paths.length > 0) {
            const thumbnail = await getImageThumbnail(demoCase.image_paths[0]);
            if (thumbnail) {
              setThumbnails(prev => ({
                ...prev,
                [demoCase.id]: thumbnail
              }));
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching demo cases:', error);
      toast({
        title: "Error",
        description: "Failed to load demo cases. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getImageThumbnail = async (imagePath: string): Promise<string | null> => {
    try {
      const { data } = await supabase.rpc('sign_image', {
        p_path: imagePath,
        expires: 3600
      });
      return data;
    } catch (error) {
      console.error('Error getting image thumbnail:', error);
      return null;
    }
  };

  const handleStartWithCase = async (demoCase: DemoCase) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start with this case.",
        variant: "destructive",
      });
      return;
    }

    setCopying(demoCase.id);
    
    try {
      // Copy the demo case to user's analyses
      const { data, error } = await supabase
        .from('analyses')
        .insert({
          user_id: user.id,
          status: 'completed',
          modality: demoCase.modality,
          body_region: demoCase.body_region,
          image_paths: demoCase.image_paths,
          analysis_result: demoCase.analysis_result,
          report_text: demoCase.report_text,
          article_sections: demoCase.article_sections,
          template_key: 'case-report',
          article_title: demoCase.title,
          tone: 'Academic'
        })
        .select('id')
        .single();

      if (error) throw error;

      toast({
        title: "Case Started",
        description: "Demo case has been copied to your analyses.",
      });

      // Navigate to the new analysis
      navigate(`/analysis/${data.id}`);
    } catch (error: any) {
      console.error('Error copying demo case:', error);
      toast({
        title: "Error",
        description: "Failed to start with this case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCopying(null);
    }
  };

  const renderImageThumbnail = (demoCase: DemoCase) => {
    const thumbnail = thumbnails[demoCase.id];
    
    if (thumbnail) {
      return (
        <img 
          src={thumbnail} 
          alt="Medical scan" 
          className="w-full h-32 object-cover rounded-md"
        />
      );
    }
    
    return (
      <div className="w-full h-32 bg-muted flex items-center justify-center rounded-md">
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  };

  if (loading) {
    return (
      <Layout isAuthenticated={!!user} onSignOut={signOut}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={!!user} onSignOut={signOut}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-medical-primary">Demo Cases</h1>
            <p className="text-muted-foreground mt-2">
              Explore pre-analyzed medical cases to get started quickly
            </p>
          </div>
        </div>

        {/* Demo Cases Grid */}
        {demoCases.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No demo cases available</h3>
            <p className="text-sm text-muted-foreground">
              Demo cases will appear here when available.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoCases.map((demoCase) => (
              <Card key={demoCase.id} className="clinical-card hover:clinical-card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-medical-primary line-clamp-2">
                        {demoCase.title}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-3">
                        {demoCase.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {demoCase.modality && (
                      <Badge variant="secondary" className="text-xs">
                        {demoCase.modality}
                      </Badge>
                    )}
                    {demoCase.body_region && (
                      <Badge variant="outline" className="text-xs">
                        {demoCase.body_region}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Thumbnail */}
                  {renderImageThumbnail(demoCase)}

                  {/* Action Button */}
                  <Button
                    onClick={() => handleStartWithCase(demoCase)}
                    disabled={copying === demoCase.id}
                    className="w-full"
                    variant="medical"
                  >
                    {copying === demoCase.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start with this case
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};