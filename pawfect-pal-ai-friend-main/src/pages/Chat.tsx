
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PawPrint, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Hi there! I\'m your PetPal.co virtual vet assistant. How can I help you with your pet today? 🐾' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll to bottom whenever chat history changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '') return;
    
    const userMessage = message.trim();
    setMessage('');
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Call OpenAI API via backend proxy
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
              content: 'You are a helpful, research-oriented veterinary assistant for PetPal.co. Provide evidence-based advice about pet health, behavior, and care. Use emoji occasionally to be friendly. Always include references to scientific research or veterinary guidelines when possible. Clarify you are an AI and serious health concerns should be addressed by a real veterinarian.',
            },
            ...chatHistory,
            { role: 'user', content: userMessage }
          ],
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);

    } catch (error) {
      console.error('Error communicating with OpenAI:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again later.',
        variant: 'destructive',
      });
      
      // Add fallback response
      setChatHistory(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an issue. Please try again later. Remember for real emergencies, please contact a veterinarian. 🐾' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F2FCE2]">
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

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {chatHistory.map((chat, index) => (
            <div 
              key={index} 
              className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  chat.role === 'user' 
                    ? 'bg-[#33C3F0] text-white rounded-br-none' 
                    : 'bg-white text-green-700 rounded-bl-none border border-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap">{chat.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <Card className="m-4 border-none shadow-lg">
        <CardContent className="p-2">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your pet's health, behavior, or care..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || message.trim() === ''}
              className="bg-[#33C3F0] hover:bg-[#33C3F0]/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;
