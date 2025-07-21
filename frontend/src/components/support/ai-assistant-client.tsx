'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  aiAssistant,
  AIAssistantInput,
  AIAssistantOutput,
} from '@/ai/flows/ai-assistant'; // Genkit flow
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function AiAssistantClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector(
        'div[style*="overflow: scroll"]',
      );
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiInput: AIAssistantInput = { query: userMessage.text };
      const aiResponse: AIAssistantOutput = await aiAssistant(aiInput);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.answer,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl flex flex-col h-[70vh]">
      <CardHeader className="border-b">
        <CardTitle className="font-headline flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex items-end gap-2',
                  msg.sender === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {msg.sender === 'ai' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="https://placehold.co/40x40.png?text=AI"
                      data-ai-hint="robot face"
                    />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[70%] rounded-lg px-4 py-2 text-sm shadow',
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted',
                  )}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src="https://placehold.co/40x40.png"
                      data-ai-hint="user avatar"
                    />
                    <AvatarFallback>
                      <User size={16} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="https://placehold.co/40x40.png?text=AI"
                    data-ai-hint="robot face"
                  />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] rounded-lg px-4 py-2 text-sm shadow bg-muted">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center space-x-2"
        >
          <Input
            type="text"
            placeholder="Ask a question about CareerPilot..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
