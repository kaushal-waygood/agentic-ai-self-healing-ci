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
    <div className="w-full max-w-6xl mx-auto h-[85vh] flex flex-col bg-white dark:bg-[#0b0f1a] rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800/60 overflow-hidden transition-all duration-500">
      {/* Header: Enhanced Glassmorphism */}
      <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/50 bg-white/70 dark:bg-[#0b0f1a]/70 backdrop-blur-2xl flex items-center justify-between z-10">
        <div className="flex items-center gap-5">
          <div className="relative group">
            {/* Pulsing Aura */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>

            <div className="relative w-14 h-14 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
              <Bot className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white dark:border-[#0b0f1a] rounded-full"></span>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              ZobsAI{' '}
              <span className="text-blue-600 dark:text-blue-400">Genius</span>
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-1 h-1 bg-green-500 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.15em]">
                Neural Link Established
              </p>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />
          <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:text-blue-600 transition-all">
            <Sparkles className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat Area */}
        <div
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide dark:bg-[#0b0f1a] relative"
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in duration-700">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center">
                <Bot className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                How can I accelerate your career?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                {[
                  'Optimize my Resume',
                  'Mock Interview',
                  'Find Remote Jobs',
                  'Salary Negotiation',
                ].map((text) => (
                  <button
                    key={text}
                    className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-900 text-sm text-slate-600 dark:text-slate-400 transition-all hover:shadow-lg"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-5 duration-500`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mb-1 ${
                  msg.sender === 'user'
                    ? 'bg-slate-200 dark:bg-slate-800'
                    : 'bg-blue-600 shadow-lg shadow-blue-500/20'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              <div
                className={`flex flex-col gap-1.5 max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`relative px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-2">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3 animate-in fade-in duration-300">
              <div className="bg-slate-100 dark:bg-slate-900 px-5 py-3 rounded-2xl rounded-bl-none flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area: Sleek Command Center */}
      <div className="p-8 bg-white dark:bg-[#0b0f1a] border-t border-slate-100 dark:border-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="relative flex items-center group"
          >
            <div className="absolute left-5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Bot className="w-5 h-5" />
            </div>

            <input
              type="text"
              placeholder="Ask ZobsAI anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full pl-14 pr-32 py-5 bg-slate-50 dark:bg-slate-900/80 border-none rounded-[2rem] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-inner"
            />

            <div className="absolute right-3 flex items-center gap-2">
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-full transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="text-sm font-bold">Send</span>
              </button>
            </div>
          </form>

          <div className="flex justify-center items-center gap-8 mt-6">
            {['Context Aware', 'Privacy Shield', 'Fast Response'].map(
              (label) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {label}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
