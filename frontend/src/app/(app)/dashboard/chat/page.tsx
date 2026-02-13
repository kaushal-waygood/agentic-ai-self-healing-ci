'use client';

import React, { useEffect, useState } from 'react';
import apiInstance from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Building2, ChevronRight, Loader2 } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import ChatWindow from './ChatWindow'; // Using the ChatWindow we built earlier

const ChatListPage = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Your actual User/Student ID from Auth context
  const currentStudentId = '6967421a37b3993c0b1ffde5';

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await apiInstance.get('/jobs/get-jobs');
        // Based on your JSON structure: data.appliedJobs
        setAppliedJobs(response.data.appliedJobs || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleOpenChat = async (application: any) => {
    try {
      // Use the logic we created to initialize the conversation
      const response = await apiInstance.post('/chats/initialize', {
        jobId: application.job.slug, // The slug from your JSON
        applicationId: application._id,
        participantIds: [currentStudentId, application.job.organizationId],
      });

      setActiveChat({
        id: response.data._id,
        name: application.job.company,
      });
    } catch (error) {
      console.error('Could not start chat', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-500 text-sm">
            Chat with companies you've applied to
          </p>
        </div>
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-100"
        >
          {appliedJobs.length} Applications
        </Badge>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-sm">
            Loading your conversations...
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {appliedJobs.map((item: any) => (
            <div
              key={item._id}
              onClick={() => handleOpenChat(item)}
              className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {item.job.company}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-1">
                    {item.job.title}
                  </p>
                </div>
              </div>



              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end gap-1">
                  <Badge
                    variant={
                      item.status === 'REJECTED' ? 'destructive' : 'secondary'
                    }
                    className="text-[10px]"
                  >
                    {item.status}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    Applied{' '}
                    {new Date(item.applicationDate).toLocaleDateString()}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Sidebar Chat Integration --- */}
      <Sheet open={!!activeChat} onOpenChange={() => setActiveChat(null)}>
        <SheetContent className="p-0 sm:max-w-[450px] flex flex-col h-full">
          {activeChat && (
            <ChatWindow
              conversationId={activeChat.id}
              userId={currentStudentId}
              candidateName={activeChat.name}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ChatListPage;
