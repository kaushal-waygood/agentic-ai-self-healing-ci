'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCandidateStore } from '@/store/candidates.store';
import { useOrganisationStore } from '@/store/organisation.store';

import {
  Search,
  User,
  Filter,
  ArrowLeft,
  MessageSquare,
  MoreVertical,
  CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

import ChatWindow from '../chat/ChatWindow';
import apiInstance from '@/services/api';

const STATUS_CONFIG: Record<string, { label: string; variant: any }> = {
  APPLIED: { label: 'Applied', variant: 'secondary' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'default' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },
  INTERVIEW: { label: 'Interview', variant: 'warning' },
  HIRED: { label: 'Hired', variant: 'outline' },
  SELECTED: { label: 'Success', variant: 'success' },
};

const GetCandidates = () => {
  const { id: jobId } = useParams();
  const router = useRouter();

  const { candidates, getCandidates } = useCandidateStore();
  const { organisation, getOrganisationProfile } = useOrganisationStore();

  const [activeChat, setActiveChat] = useState<{
    id: string;
    candidateId: string;
    name: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (jobId) {
      getCandidates(jobId as string);
      getOrganisationProfile();
    }
  }, [jobId, getCandidates, getOrganisationProfile]);

  const handleSelectCandidate = useCallback(
    async (candidate: any) => {
      const recruiterId = organisation?._id;
      if (!recruiterId) return toast.error('Session expired');

      try {
        const response = await apiInstance.post('/chats/initialize', {
          jobId,
          applicationId: candidate._id,
          participantIds: [recruiterId, candidate.student?._id],
        });

        setActiveChat({
          id: response.data._id,
          candidateId: candidate._id,
          name: candidate.student?.fullName || 'Candidate',
        });
      } catch (error) {
        toast.error('Could not open chat');
      }
    },
    [jobId, organisation],
  );

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white border-t border-slate-200">
      {/* Sidebar: Candidate List */}
      <div className="w-full md:w-[350px] lg:w-[400px] flex flex-col border-r border-slate-200 shrink-0">
        <div className="p-4 bg-slate-50/50 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Applicants
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 bg-white border-slate-200 rounded-lg h-10 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {candidates
              .filter((c) =>
                c.student?.fullName
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()),
              )
              .map((candidate) => (
                <button
                  key={candidate._id}
                  onClick={() => handleSelectCandidate(candidate)}
                  className={`flex items-center gap-3 p-4 text-left border-b border-slate-50 transition-all
                    ${activeChat?.candidateId === candidate._id ? 'bg-indigo-50/70 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'}
                  `}
                >
                  <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                    {candidate.student?.fullName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-slate-900 truncate">
                        {candidate.student?.fullName}
                      </p>
                      <span className="text-[10px] text-slate-400">Recent</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-500 truncate">
                        {candidate.applicationMethod}
                      </p>
                      <Badge
                        variant={
                          STATUS_CONFIG[candidate.status]?.variant || 'outline'
                        }
                        className="text-[9px] px-1.5 py-0 uppercase"
                      >
                        {candidate.status}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content: Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50 relative">
        {activeChat ? (
          <div className="flex flex-col h-full">
            <div className="h-16 border-b bg-white px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  {activeChat.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">
                    {activeChat.name}
                  </h2>
                  <p className="text-[11px] text-emerald-600 font-medium">
                    In Conversation
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-slate-400">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-hidden">
              <ChatWindow
                conversationId={activeChat.id}
                userId={organisation?._id}
                candidateName={activeChat.name}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="h-10 w-10 text-indigo-300" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800">
              Select a Candidate
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              Pick a profile from the left to start reviewing and chatting.
            </p>
            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="text-[10px] text-slate-300 uppercase tracking-[2px] flex items-center gap-2">
                <CheckCheck className="h-3 w-3" /> Secure Recruitment Portal
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetCandidates;
