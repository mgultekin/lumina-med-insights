import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const NewAnalysis = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [modality, setModality] = useState("");
  const [bodyRegion, setBodyRegion] = useState("");
  const [notes, setNotes] = useState("");
  const [template, setTemplate] = useState("");
  const [model, setModel] = useState("gpt-4o-mini-vision");
  const [task, setTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length || !user) return;

    setIsLoading(true);

    try {
      // Create analysis record first
      const { data: analysisData, error: analysisError } = await supabase
        .from('analyses')
        .insert([
          {
            user_id: user.id,
            modality,
            body_region: bodyRegion,
            notes,
            status: 'uploaded',
            image_paths: [],
            model,
            task
          }
        ])
        .select()
        .single();

      if (analysisError) {
        throw analysisError;
      }

      // Upload files to storage
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${analysisData.id}/${index}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('medical-images')
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        return uploadData.path;
      });

      const imagePaths = await Promise.all(uploadPromises);

      // Update analysis with image paths
      const { error: updateError } = await supabase
        .from('analyses')
        .update({ image_paths: imagePaths })
        .eq('id', analysisData.id);

      if (updateError) {
        throw updateError;
      }

      // Call analyze webhook
      try {
        const { data, error } = await supabase.functions.invoke('analyze-medical-image', {
          body: {
            analysis_id: analysisData.id,
            user_id: user.id,
            image_paths: imagePaths,
            modality,
            body_region: bodyRegion,
            notes,
            template: template || 'General Diagnostic',
            model,
            task
          }
        });

        if (error) throw error;

        // Update analysis with status and result
        if (data?.analysisResult) {
          await supabase
            .from('analyses')
            .update({ 
              status: 'analyzed', 
              analysis_result: data.analysisResult 
            })
            .eq('id', analysisData.id);
        }

        toast({
          title: "Success",
          description: "Analysis completed successfully. You'll be redirected to view the results.",
        });

        navigate(`/analysis/${analysisData.id}`);
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        toast({
          title: "Analysis Queued",
          description: "Your images have been uploaded and queued for analysis.",
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
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-medical-primary mb-2">Medical Image Analysis</h1>
            <p className="text-muted-foreground">Analyze medical images using advanced AI models</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Upload Card */}
            <div className="lg:col-span-2">
              <Card className="clinical-shadow">
                <form onSubmit={handleSubmit}>
                  <CardContent className="p-8">
                    {/* File Upload Section */}
                    <div className="mb-8">
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="file" className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-muted-foreground/20 rounded-xl cursor-pointer bg-muted/5 hover:bg-muted/10 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                              <Upload className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="mb-2 text-lg font-medium text-foreground">
                              Upload an image
                            </p>
                            <p className="text-sm text-muted-foreground mb-1">
                              or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              DICOM, JPEG, PNG, TIFF files supported
                            </p>
                            {files.length > 0 && (
                              <div className="mt-4 space-y-2">
                                {files.map((file, index) => (
                                  <div key={index} className="px-4 py-2 bg-secondary/10 rounded-lg">
                                    <p className="text-sm text-secondary font-medium">
                                      {file.name}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <Input
                            id="file"
                            type="file"
                            className="hidden"
                            accept={acceptedFileTypes}
                            onChange={handleFileChange}
                            multiple
                          />
                        </label>
                      </div>
                    </div>

                    {/* Model Selection */}
                    <div className="mb-8">
                      <Label className="text-sm font-medium mb-4 block">AI Model</Label>
                      <RadioGroup value={model} onValueChange={setModel}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="cursor-pointer transition-colors hover:bg-accent/50 border-2" data-state={model === "gpt-4o-vision" ? "checked" : "unchecked"}>
                            <div className="flex items-center space-x-3 p-4">
                              <RadioGroupItem value="gpt-4o-vision" />
                              <div>
                                <p className="font-medium">GPT‑4o vision</p>
                                <p className="text-sm text-muted-foreground">Most capable model</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="cursor-pointer transition-colors hover:bg-accent/50 border-2" data-state={model === "gpt-4o-mini-vision" ? "checked" : "unchecked"}>
                            <div className="flex items-center space-x-3 p-4">
                              <RadioGroupItem value="gpt-4o-mini-vision" />
                              <div>
                                <p className="font-medium">GPT‑4o mini vision</p>
                                <p className="text-sm text-muted-foreground">Fast and efficient</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="cursor-pointer transition-colors hover:bg-accent/50 border-2" data-state={model === "gemini-2.0-flash" ? "checked" : "unchecked"}>
                            <div className="flex items-center space-x-3 p-4">
                              <RadioGroupItem value="gemini-2.0-flash" />
                              <div>
                                <p className="font-medium">Gemini 2.0 Flash</p>
                                <p className="text-sm text-muted-foreground">Lightning fast analysis</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="cursor-pointer transition-colors hover:bg-accent/50 border-2" data-state={model === "gemini-2.5-pro" ? "checked" : "unchecked"}>
                            <div className="flex items-center space-x-3 p-4">
                              <RadioGroupItem value="gemini-2.5-pro" />
                              <div>
                                <p className="font-medium">Gemini 2.5 Pro</p>
                                <p className="text-sm text-muted-foreground">Premium model</p>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Task Selection */}
                    <div className="mb-8">
                      <Label className="text-sm font-medium mb-4 block">Analysis Task</Label>
                      <RadioGroup value={task} onValueChange={setTask} required>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="cursor-pointer transition-colors hover:bg-accent/50 border-2" data-state={task === "diagnosis" ? "checked" : "unchecked"}>
                            <div className="flex items-center space-x-3 p-4">
                              <RadioGroupItem value="diagnosis" />
                              <div>
                                <p className="font-medium">Diagnosis</p>
                                <p className="text-sm text-muted-foreground">General diagnostic analysis</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="cursor-pointer transition-colors hover:bg-accent/50 border-2" data-state={task === "disease-specific" ? "checked" : "unchecked"}>
                            <div className="flex items-center space-x-3 p-4">
                              <RadioGroupItem value="disease-specific" />
                              <div>
                                <p className="font-medium">Specific Disease</p>
                                <p className="text-sm text-muted-foreground">Targeted disease analysis</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="cursor-pointer transition-colors hover:bg-accent/50 border-2" data-state={task === "segmentation" ? "checked" : "unchecked"}>
                            <div className="flex items-center space-x-3 p-4">
                              <RadioGroupItem value="segmentation" />
                              <div>
                                <p className="font-medium">Measurement/Segmentation</p>
                                <p className="text-sm text-muted-foreground">Quantitative analysis</p>
                              </div>
                            </div>
                          </Card>
                          <Card className="cursor-pointer transition-colors hover:bg-accent/50 border-2" data-state={task === "academic" ? "checked" : "unchecked"}>
                            <div className="flex items-center space-x-3 p-4">
                              <RadioGroupItem value="academic" />
                              <div>
                                <p className="font-medium">Research/Academic</p>
                                <p className="text-sm text-muted-foreground">Scientific analysis</p>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Form Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Modality */}
                      <div className="space-y-2">
                        <Label htmlFor="modality" className="text-sm font-medium">Imaging Modality</Label>
                        <Select value={modality} onValueChange={setModality} required>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select modality" />
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
                        <Label htmlFor="bodyRegion" className="text-sm font-medium">Body Region</Label>
                        <Input
                          id="bodyRegion"
                          type="text"
                          placeholder="e.g., Head, Chest, Abdomen"
                          value={bodyRegion}
                          onChange={(e) => setBodyRegion(e.target.value)}
                          className="h-11"
                          required
                        />
                      </div>
                    </div>

                    {/* Analysis Template */}
                    <div className="mt-6 space-y-2">
                      <Label htmlFor="template" className="text-sm font-medium">Analysis Template</Label>
                      <Select value={template} onValueChange={setTemplate} required>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select analysis type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Diagnostic</SelectItem>
                          <SelectItem value="disease-specific">Disease-Specific</SelectItem>
                          <SelectItem value="research">Research/Academic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Notes */}
                    <div className="mt-6 space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium">Clinical Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional clinical context, patient history, or specific areas of concern..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[120px] resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full mt-8 h-12 text-base font-medium bg-medical-primary hover:bg-medical-primary/90"
                      disabled={!files.length || !modality || !bodyRegion || !template || !task || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Running analysis...
                        </>
                      ) : (
                        "Run analysis"
                      )}
                    </Button>
                  </CardContent>
                </form>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Model Card */}
              <Card className="clinical-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">AI model</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg bg-secondary/5 border-secondary/20">
                      <p className="font-medium text-secondary">GPT-4</p>
                      <p className="text-sm text-muted-foreground">Advanced medical image analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Task Card */}
              <Card className="clinical-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Task</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg bg-primary/5 border-primary/20">
                      <p className="font-medium text-primary">Diagnosis</p>
                      <p className="text-sm text-muted-foreground">Comprehensive medical analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="clinical-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Leading AI models</p>
                        <p className="text-xs text-muted-foreground">Advanced image analysis capabilities</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-secondary"></div>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Academic articles</p>
                        <p className="text-xs text-muted-foreground">Generate research-ready content</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};