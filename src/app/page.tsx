
"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { generatePoemFromImage } from '@/ai/flows/generate-poem-from-image';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Copy, Save } from 'lucide-react';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });

  const generatePoem = async () => {
    if (!image) {
      toast({
        title: "Please upload an image first.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generatePoemFromImage({ photoUrl: image });
      setPoem(result.poem);
    } catch (error: any) {
      toast({
        title: "Error generating poem.",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPoem = () => {
    if (poem) {
      navigator.clipboard.writeText(poem);
      toast({
        title: "Poem copied to clipboard!",
      });
    }
  };

  const handleSavePoem = () => {
    if (poem) {
      const blob = new Blob([poem], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'poem.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Poem saved!",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Toaster />
      <h1 className="text-4xl font-bold mb-4">Picture Poet</h1>

      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-lg font-semibold">Upload Image</h2>
        </CardHeader>
        <CardContent>
          <div {...getRootProps()} className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer bg-secondary">
            <Input {...getInputProps()} id="image-upload" className="hidden" />
            {image ? (
              <img src={image} alt="Uploaded" className="max-h-48 object-contain rounded-md" />
            ) : (
              <p className="text-muted-foreground">
                {isDragActive ? "Drop it here..." : "Drag 'n' drop an image here, or click to select files"}
              </p>
            )}
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={generatePoem} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Poem"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {poem && (
        <Card className="w-full max-w-md mt-8">
          <CardHeader>
            <h2 className="text-lg font-semibold">Generated Poem</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Textarea readOnly value={poem} className="resize-none" />
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={handleCopyPoem}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="secondary" onClick={handleSavePoem}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
