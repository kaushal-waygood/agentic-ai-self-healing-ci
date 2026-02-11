'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat } from '@/hooks/useChat';
import { Paperclip, Send, Loader2, Download, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import apiInstance from '@/services/api';

interface ChatWindowProps {
  conversationId: string;
  userId: string;
  candidateName?: string;
}

const ChatWindow = ({
  conversationId,
  userId,
  candidateName,
}: ChatWindowProps) => {
  const { messages: liveMessages, sendMessage } = useChat(
    conversationId,
    userId,
  );
  const [historyMessages, setHistoryMessages] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const allMessages = useMemo(() => {
    const combined = [...historyMessages, ...liveMessages];
    const uniqueMap = new Map();
    combined.forEach((msg) => {
      const key = msg._id || msg.createdAt || Math.random();
      uniqueMap.set(key, msg);
    });
    return Array.from(uniqueMap.values()).sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [historyMessages, liveMessages]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!conversationId) return;
      setIsHistoryLoading(true);
      try {
        const response = await apiInstance.get(
          `/chats/history/${conversationId}`,
        );
        if (response.data?.messages) setHistoryMessages(response.data.messages);
      } catch (error) {
        toast.error('Could not load chat history');
      } finally {
        setIsHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        '[data-radix-scroll-area-viewport]',
      );
      if (viewport)
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [allMessages, isHistoryLoading]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    try {
      await sendMessage(inputValue);
      setInputValue('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('attachment', file);
      const response = await apiInstance.post(
        '/chats/upload-attachment',
        formData,
      );
      const { fileUrl, fileName, fileType } = response.data;

      // Passing the metadata object as the second argument to sendMessage
      sendMessage(`FILE_ATTACHMENT:${fileName}`, { fileUrl, fileType });
      toast.success('File shared');
    } catch (error) {
      toast.error('File upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5]/50">
      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
        {isHistoryLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {allMessages.map((msg: any, index: number) => {
              const isMe = msg.senderId === userId;
              const isFile =
                msg.fileUrl || msg.text?.startsWith('FILE_ATTACHMENT:');
              const fileName = msg.text?.startsWith('FILE_ATTACHMENT:')
                ? msg.text.replace('FILE_ATTACHMENT:', '')
                : 'Attachment';

              return (
                <div
                  key={msg._id || index}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-xl shadow-sm text-sm ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                    }`}
                  >
                    {isFile ? (
                      <div className="flex flex-col gap-2 min-w-[180px]">
                        <div className="flex items-center gap-3 p-2 bg-black/5 rounded-lg">
                          <FileIcon className="h-8 w-8 text-indigo-500" />
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-bold truncate text-xs">
                              {fileName}
                            </span>
                            <span className="text-[10px] opacity-70">
                              Cloudinary File
                            </span>
                          </div>
                        </div>
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 py-1.5 bg-indigo-500 text-white rounded-md text-xs font-bold hover:bg-indigo-400 transition-colors"
                        >
                          <Download className="h-3 w-3" /> Download
                        </a>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.text}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input Area: No longer fixed, stays at the bottom of the container */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-end gap-2 bg-slate-100 rounded-xl p-2 focus-within:ring-1 focus-within:ring-indigo-300">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="shrink-0 h-9 w-9"
          >
            {isUploading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </Button>
          <textarea
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-1 resize-none max-h-32 min-h-[40px] outline-none"
            placeholder="Type a message..."
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isUploading}
            className="bg-indigo-600 h-9 w-9 p-0 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
