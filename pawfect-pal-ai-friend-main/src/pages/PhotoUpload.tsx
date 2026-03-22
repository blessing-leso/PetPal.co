
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PawPrint, Upload, Camera, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const PhotoUpload: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setAnalysis(null); // Clear previous analysis
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    
    try {
      // Call to OpenAI Vision API via backend proxy
      const response = await fetch('http://localhost:5001/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a veterinary assistant that analyzes pet images. Look for signs of health issues, skin problems, or concerning symptoms. Be informative but remind users that this is not a substitute for professional veterinary care. Use emoji occasionally to be friendly.',
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Please analyze this pet image and tell me if you notice any potential health concerns or issues',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: image,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      setAnalysis(data.choices[0].message.content);
      
      toast({
        title: 'Analysis complete',
        description: 'Review the details below',
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: 'Analysis failed',
        description: 'Unable to analyze the image. Please try again.',
        variant: 'destructive',
      });
      setAnalysis('Sorry, I encountered an issue analyzing this image. Please try again later. Remember to consult a veterinarian for any health concerns.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#F2FCE2] flex flex-col">
      {/* Header */}
      <header className="bg-[#33C3F0] text-white py-4 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center">
          <PawPrint className="mr-2" />
          <h1 className="text-xl font-bold">PetPal.co</h1>
        </div>
        <Button variant="ghost" onClick={() => navigate('/')} className="text-white hover:bg-[#33C3F0]/80">
          Home
        </Button>
      </header>

      <div className="container mx-auto p-4 flex-1">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#5D4037] flex items-center">
              <Camera className="mr-2 text-[#33C3F0]" />
              Pet Photo Analysis
            </CardTitle>
            <CardDescription>
              Upload a photo of your pet for an AI-powered health check
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!image ? (
              <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-4">
                  Upload a clear photo of your pet
                </p>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#FEF7CD] text-[#5D4037] hover:bg-[#FEF7CD]/90"
                >
                  Select Photo
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={image} 
                    alt="Uploaded pet" 
                    className="w-full h-56 object-contain bg-gray-100" 
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="absolute top-2 right-2 bg-white hover:bg-white/90"
                    onClick={handleReset}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                
                {!analysis && (
                  <Button 
                    onClick={analyzeImage} 
                    className="w-full bg-[#33C3F0] hover:bg-[#33C3F0]/90"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Photo'}
                  </Button>
                )}
                
                {analysis && (
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h3 className="font-medium mb-2 text-[#5D4037]">Analysis Results:</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{analysis}</p>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Remember: This is an AI analysis and not a substitute for veterinary care.
                      </p>
                    </div>
                    
                    <Button 
                      onClick={handleReset} 
                      className="mt-4 w-full border-[#33C3F0] text-[#33C3F0] hover:bg-[#33C3F0]/10"
                      variant="outline"
                    >
                      Analyze Another Photo
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhotoUpload;
