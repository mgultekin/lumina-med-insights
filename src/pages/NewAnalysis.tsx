import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const NewAnalysis = () => {
  const [file, setFile] = useState<File | null>(null);
  const [modality, setModality] = useState("");
  const [bodyRegion, setBodyRegion] = useState("");
  const [notes, setNotes] = useState("");
  const [template, setTemplate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setIsLoading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medical-images')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Create analysis record
      const { data: analysisData, error: analysisError } = await supabase
        .from('analyses')
        .insert([
          {
            user_id: user.id,
            modality,
            body_region: bodyRegion,
            notes,
            image_path: uploadData.path,
            status: 'uploaded'
          }
        ])
        .select()
        .single();

      if (analysisError) {
        throw analysisError;
      }

      // Call analyze webhook
      try {
        const { data, error } = await supabase.functions.invoke('analyze-medical-image', {
          body: {
            analysis_id: analysisData.id,
            user_id: user.id,
            image_path: uploadData.path,
            modality,
            body_region: bodyRegion,
            notes,
            template
          }
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Analysis started successfully. You'll be redirected to view the results.",
        });

        navigate(`/analysis/${analysisData.id}`);
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        toast({
          title: "Analysis Queued",
          description: "Your image has been uploaded and queued for analysis.",
        });
        navigate(`/analysis/${analysisData.id}`);
      }

    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process your request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const acceptedFileTypes = ".dcm,.dicom,.jpg,.jpeg,.png,.tiff,.tif";

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="clinical-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-medical-primary" />
                <span>New Medical Image Analysis</span>
              </CardTitle>
              <CardDescription>
                Upload a medical image for AI-powered analysis and insights
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="file">Medical Image</Label>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-muted rounded-lg cursor-pointer bg-clinical-surface hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          DICOM, JPEG, PNG, TIFF files supported
                        </p>
                        {file && (
                          <p className="mt-2 text-sm text-medical-primary font-medium">
                            Selected: {file.name}
                          </p>
                        )}
                      </div>
                      <Input
                        id="file"
                        type="file"
                        className="hidden"
                        accept={acceptedFileTypes}
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                  </div>
                </div>

                {/* Modality */}
                <div className="space-y-2">
                  <Label htmlFor="modality">Imaging Modality</Label>
                  <Select value={modality} onValueChange={setModality} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select imaging modality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MRI">MRI</SelectItem>
                      <SelectItem value="CT">CT Scan</SelectItem>
                      <SelectItem value="X-ray">X-ray</SelectItem>
                      <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Body Region */}
                <div className="space-y-2">
                  <Label htmlFor="bodyRegion">Body Region</Label>
                  <Input
                    id="bodyRegion"
                    type="text"
                    placeholder="e.g., Head, Chest, Abdomen, Extremities"
                    value={bodyRegion}
                    onChange={(e) => setBodyRegion(e.target.value)}
                    required
                  />
                </div>

                {/* Analysis Template */}
                <div className="space-y-2">
                  <Label htmlFor="template">Analysis Template</Label>
                  <Select value={template} onValueChange={setTemplate} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select analysis template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Diagnostic</SelectItem>
                      <SelectItem value="disease-specific">Disease-Specific</SelectItem>
                      <SelectItem value="research">Research/Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Clinical Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional clinical context, patient history, or specific areas of concern..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="medical" 
                  className="w-full"
                  disabled={!file || !modality || !bodyRegion || !template || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Start Analysis"
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};