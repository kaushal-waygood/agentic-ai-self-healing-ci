'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, User, Loader2, Sparkles, Bot, Zap } from 'lucide-react';
import apiInstance from '@/services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function AiAssistantClient() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const savedMessages = localStorage.getItem('aiAssistantChatHistory');
      if (savedMessages) {
        const parsedMessages: Message[] = JSON.parse(savedMessages);
        return parsedMessages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
      return [
        {
          id: 'init-message',
          text: "Hello! I'm your AI assistant. How can I help you with zobsai today?",
          sender: 'ai',
          timestamp: new Date(),
        },
      ];
    }
    return [
      {
        id: 'init-message',
        text: "Hello! I'm your AI assistant. How can I help you with zobsai today?",
        sender: 'ai',
        timestamp: new Date(),
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // For the "AI is thinking..." UI
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // console.log('Saving messages to localStorage:', messages);
      localStorage.setItem('aiAssistantChatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // A slight delay ensures the new message is rendered before scrolling
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  const handleSubmit = async () => {
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
    setIsTyping(true);

    try {
      const { data } = await apiInstance.post('/students/assistant/chat', {
        query: userMessage.text,
      });

      setIsTyping(false);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('AI Assistant error:', error);
      setIsTyping(false);
      const msg =
        error?.response?.data?.message ||
        'Sorry, I encountered an error. Please try again.';
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: msg,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[80vh] relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-3xl"></div>

      {/* Main container */}
      <div className="relative h-full bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-indigo-600"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  AI Assistant
                </h1>
                <p className="text-white/80 text-sm">Powered by zobsai</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <div
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-4 animate-in slide-in-from-bottom-4 duration-500 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/50 flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              <div className={`group relative max-w-[75%]`}>
                <div
                  className={`relative px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-md'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="absolute -left-2 top-4 w-4 h-4 bg-white border-l border-b border-gray-200 rotate-45 transform"></div>
                  )}
                  {msg.sender === 'user' && (
                    <div className="absolute -right-2 top-4 w-4 h-4 bg-gradient-to-br from-indigo-600 to-purple-600 rotate-45 transform"></div>
                  )}

                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                </div>

                <div
                  className={`mt-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/50 flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-end gap-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/50">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="relative bg-white border border-gray-200 px-6 py-4 rounded-2xl rounded-bl-md shadow-lg">
                <div className="absolute -left-2 top-4 w-4 h-4 bg-white border-l border-b border-gray-200 rotate-45 transform"></div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-center gap-4"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Ask me anything about zobsai..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none transition-all duration-300 text-gray-800 placeholder-gray-500 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              />
              {!isLoading && input.trim() && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Zap className="w-4 h-4 text-indigo-500 animate-pulse" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`relative px-6 py-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                isLoading || !input.trim()
                  ? 'bg-gray-300 text-gray-500'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="font-semibold hidden sm:inline">Send</span>
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
