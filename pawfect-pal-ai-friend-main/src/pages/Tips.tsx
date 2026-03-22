
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { PawPrint, Sparkles, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const tipCategorySchema = z.object({
  dogBreed: z.string().min(2, { message: 'Please enter a dog breed' }),
  category: z.enum(['nutrition', 'health', 'exercise', 'general'])
});

const Tips: React.FC = () => {
  const [tip, setTip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof tipCategorySchema>>({
    resolver: zodResolver(tipCategorySchema),
    defaultValues: {
      dogBreed: '',
      category: 'general'
    }
  });

  const onSubmit = async (data: z.infer<typeof tipCategorySchema>) => {
    setIsLoading(true);
    setTip(null);
    
    try {
      // Call to OpenAI API for primary tip via backend proxy
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
              content: `You are a knowledgeable pet care assistant. Use reliable sources to provide accurate advice based on scientific research and veterinary medicine publications. Focus on the requested category. Use emoji occasionally to be friendly. Keep responses concise (100-150 words).`
            },
            {
              role: 'user',
              content: `Please give me a well-researched, factual tip about ${data.category} for my ${data.dogBreed}. Base this on reputable veterinary sources and scientific studies when possible.`
            }
          ],
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get tip');
      }

      const responseData = await response.json();
      setTip(responseData.choices[0].message.content);

    } catch (error) {
      console.error('Error getting tip:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a tip. Please try again later.',
        variant: 'destructive',
      });
      setTip('Sorry, I encountered an issue generating a tip. Please try again later.');
    } finally {
      setIsLoading(false);
    }
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
            <CardTitle className="text-green-600 flex items-center">
              <Sparkles className="mr-2 text-[#F2FCE2]" />
              Daily Pet Tips
            </CardTitle>
            <CardDescription className="text-green-700">
              Get research-based advice for your furry friend
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="dogBreed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What breed is your dog?</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Golden Retriever, Labrador, etc." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>What type of tip would you like?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="nutrition" />
                            </FormControl>
                            <FormLabel className="font-normal">Nutrition</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="health" />
                            </FormControl>
                            <FormLabel className="font-normal">Health</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="exercise" />
                            </FormControl>
                            <FormLabel className="font-normal">Exercise</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="general" />
                            </FormControl>
                            <FormLabel className="font-normal">General</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full border-[#33C3F0] bg-[#33C3F0] hover:bg-[#33C3F0]/90 text-white"
                >
                  Get Tip {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  {isLoading && "Loading..."}
                </Button>
              </form>
            </Form>
            
            {tip && (
              <Card className="mt-6 bg-white border border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <div className="bg-[#FEF7CD] rounded-full p-2 mr-3">
                      <Sparkles className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="whitespace-pre-wrap text-green-700">{tip}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tips;
