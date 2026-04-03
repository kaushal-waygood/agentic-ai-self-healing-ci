'use client';

import {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Bot,
  FileText,
  FileUp,
  Loader2,
  MessageSquareText,
  Paperclip,
  Send,
  Sparkles,
  User,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import apiInstance from '@/services/api';

/** ─── TYPES ─── **/
type AssistantMode =
  | 'general'
  | 'update_profile'
  | 'find_jobs'
  | 'review_cv'
  | 'generate_cv'
  | 'generate_cl'
  | 'write_mail';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  responseType?: string;
  metadata?: Record<string, any>;
}

interface ProgressChunk {
  label: string;
  detail: string;
}

interface LoadingProgress {
  title: string;
  subtitle: string;
  chunks: ProgressChunk[];
  currentStep: number;
}

interface QuickPrompt {
  label: string;
  prompt: string;
  helper: string;
  mode: AssistantMode;
}

interface PendingProfileUpdate {
  query: string;
  jobDescription: string;
  message: string;
  summary: string[];
  operationCount: number;
}

const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.txt';

interface AssistantModeConfig {
  id: AssistantMode;
  label: string;
  helper: string;
  placeholder: string;
  starterPrompt: string;
}

const ASSISTANT_MODES: AssistantModeConfig[] = [
  {
    id: 'general',
    label: 'General',
    helper: 'Ask anything',
    placeholder: 'Ask ZobsAI anything about your career...',
    starterPrompt: '',
  },
  {
    id: 'update_profile',
    label: 'Update Profile',
    helper: 'Refresh your profile',
    placeholder: 'Update my profile using your best judgment.',
    starterPrompt: 'Update my profile using your best judgment.',
  },
  {
    id: 'find_jobs',
    label: 'Find Jobs',
    helper: 'Matched to your profile',
    placeholder: 'Find the best jobs for my current profile.',
    starterPrompt: 'Find jobs that best match my current profile.',
  },
  {
    id: 'review_cv',
    label: 'Review CV',
    helper: 'Improvement ideas',
    placeholder: 'Review my CV and tell me what to improve.',
    starterPrompt: 'Review my CV and suggest the highest-impact improvements.',
  },
  {
    id: 'generate_cv',
    label: 'Generate CV',
    helper: 'Create a new CV draft',
    placeholder: 'Generate a tailored CV from my profile.',
    starterPrompt: 'Generate a tailored CV from my profile.',
  },
  {
    id: 'generate_cl',
    label: 'Generate CL',
    helper: 'Create a cover letter',
    placeholder: 'Generate a tailored cover letter from my profile.',
    starterPrompt: 'Generate a tailored cover letter from my profile.',
  },
  {
    id: 'write_mail',
    label: 'Write Mail',
    helper: 'Draft application email',
    placeholder: 'Write a professional application email for this role.',
    starterPrompt: 'Write a professional application email for this role.',
  },
];

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: 'Update profile',
    mode: 'update_profile',
    prompt: 'Update my profile using your best judgment.',
    helper: 'Refresh profile fields, skills, and preferences.',
  },
  {
    label: 'Find jobs',
    mode: 'find_jobs',
    prompt: 'Find jobs that best match my current profile.',
    helper: 'Use my profile to recommend roles.',
  },
  {
    label: 'Review CV',
    mode: 'review_cv',
    prompt: 'Review my CV and give me the 5 highest-impact improvements.',
    helper: 'Best when you upload a resume.',
  },
  {
    label: 'Generate CV',
    mode: 'generate_cv',
    prompt: 'Generate a tailored CV from my profile.',
    helper: 'Starts a new CV draft.',
  },
  {
    label: 'Generate CL',
    mode: 'generate_cl',
    prompt: 'Generate a tailored cover letter from my profile.',
    helper: 'Builds a cover letter draft.',
  },
  {
    label: 'Write mail',
    mode: 'write_mail',
    prompt: 'Write a professional application email for this role.',
    helper: 'Draft recruiter outreach or application email.',
  },
];

const UPLOAD_ACTIONS = [
  {
    key: 'cv',
    label: 'Upload CV',
    helper: 'PDF / DOCX / image',
    icon: FileText,
    tone: 'blue',
  },
  {
    key: 'coverLetter',
    label: 'Upload Cover Letter',
    helper: 'PDF / DOCX / image',
    icon: FileUp,
    tone: 'violet',
  },
  {
    key: 'jobDescriptionFile',
    label: 'Upload Job Description',
    helper: 'PDF / DOCX / image',
    icon: MessageSquareText,
    tone: 'amber',
  },
  {
    key: 'attachments',
    label: 'Add Files',
    helper: 'Multiple files',
    icon: Paperclip,
    tone: 'slate',
  },
] as const;

type UploadActionKey = (typeof UPLOAD_ACTIONS)[number]['key'];

/** ─── HELPERS ─── **/
function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatFileSize(bytes: number) {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  return kb < 1024
    ? `${Math.max(1, Math.round(kb))} KB`
    : `${(kb / 1024).toFixed(1)} MB`;
}

async function decodeBinaryResponse(data: unknown) {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (data instanceof Blob) return data.text();
  if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    return new TextDecoder().decode(
      data instanceof ArrayBuffer ? new Uint8Array(data) : data,
    );
  }
  return '';
}

function getToneClasses(tone: (typeof UPLOAD_ACTIONS)[number]['tone']) {
  const mapping = {
    blue: {
      icon: 'text-blue-500',
      border: 'border-blue-100 hover:border-blue-200',
      badge: 'bg-blue-50 text-blue-600',
      dot: 'bg-blue-500',
    },
    violet: {
      icon: 'text-violet-500',
      border: 'border-violet-100 hover:border-violet-200',
      badge: 'bg-violet-50 text-violet-600',
      dot: 'bg-violet-500',
    },
    amber: {
      icon: 'text-amber-500',
      border: 'border-amber-100 hover:border-amber-200',
      badge: 'bg-amber-50 text-amber-600',
      dot: 'bg-amber-500',
    },
    slate: {
      icon: 'text-slate-400',
      border: 'border-slate-200 hover:border-slate-300',
      badge: 'bg-slate-100 text-slate-600',
      dot: 'bg-slate-400',
    },
  };
  return mapping[tone] || mapping.slate;
}

function getAssistantModeConfig(mode: AssistantMode) {
  return (
    ASSISTANT_MODES.find((item) => item.id === mode) || ASSISTANT_MODES[0]
  );
}

function formatMatchPercent(score: unknown) {
  if (typeof score !== 'number' || Number.isNaN(score)) return null;
  const value = score <= 1 ? score * 100 : score;
  return `${Math.round(value * 10) / 10}%`;
}

function buildProgressPlan(
  mode: AssistantMode,
  hasContext: boolean,
): Omit<LoadingProgress, 'currentStep'> {
  switch (mode) {
    case 'update_profile':
      return {
        title: 'Updating your profile',
        subtitle: hasContext
          ? 'Reading your current profile and uploaded context.'
          : 'Planning safe edits from your profile snapshot.',
        chunks: [
          { label: 'Read profile', detail: 'Gathering your current profile snapshot.' },
          { label: 'Plan edits', detail: 'Selecting safe updates and improvements.' },
          { label: 'Apply changes', detail: 'Writing changes into your profile.' },
          { label: 'Generate PDF', detail: 'Packaging the update into a downloadable PDF.' },
        ],
      };
    case 'find_jobs':
      return {
        title: 'Finding matching jobs',
        subtitle: 'Filtering fresh roles that fit your profile.',
        chunks: [
          { label: 'Read profile', detail: 'Using your skills, roles, and preferences.' },
          { label: 'Filter duplicates', detail: 'Skipping saved, applied, and previously seen jobs.' },
          { label: 'Rank matches', detail: 'Ordering the strongest matches first.' },
          { label: 'Save results', detail: 'Storing unique jobs for later.' },
        ],
      };
    case 'review_cv':
      return {
        title: 'Reviewing your CV',
        subtitle: 'Checking ATS fit and improvement opportunities.',
        chunks: [
          { label: 'Read CV', detail: 'Extracting the content from your uploaded file.' },
          { label: 'Check fit', detail: 'Comparing your CV with the role and profile.' },
          { label: 'Write feedback', detail: 'Creating the highest-impact improvements.' },
          { label: 'Prepare summary', detail: 'Packaging the review for chat.' },
        ],
      };
    case 'generate_cv':
      return {
        title: 'Generating your CV',
        subtitle: 'Building a tailored draft from your profile.',
        chunks: [
          { label: 'Read profile', detail: 'Collecting your skills and experience.' },
          { label: 'Draft sections', detail: 'Writing headline, summary, and experience.' },
          { label: 'Format CV', detail: 'Organising the document for readability.' },
          { label: 'Prepare output', detail: 'Getting the final CV ready.' },
        ],
      };
    case 'generate_cl':
      return {
        title: 'Generating your cover letter',
        subtitle: 'Writing a tailored application letter.',
        chunks: [
          { label: 'Read context', detail: 'Using your profile and job description.' },
          { label: 'Draft letter', detail: 'Writing a persuasive first pass.' },
          { label: 'Tune tone', detail: 'Making it professional and role-specific.' },
          { label: 'Prepare output', detail: 'Packaging the final cover letter.' },
        ],
      };
    case 'write_mail':
      return {
        title: 'Writing your email',
        subtitle: 'Drafting a concise application message.',
        chunks: [
          { label: 'Read context', detail: 'Using your profile and role details.' },
          { label: 'Draft email', detail: 'Writing the body and subject line.' },
          { label: 'Polish tone', detail: 'Making it clear and professional.' },
          { label: 'Prepare output', detail: 'Getting the final email ready.' },
        ],
      };
    default:
      return {
        title: 'Thinking',
        subtitle: 'Reading your request and preparing a helpful reply.',
        chunks: [
          { label: 'Read request', detail: 'Understanding your message and context.' },
          { label: 'Reason', detail: 'Selecting the best answer path.' },
          { label: 'Write reply', detail: 'Preparing the final response.' },
        ],
      };
  }
}

/** ─── COMPONENT ─── **/
export function AiAssistantClient() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState<AssistantMode>('general');
  const [jobDescription, setJobDescription] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(
    null,
  );
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingProfileUpdate, setPendingProfileUpdate] =
    useState<PendingProfileUpdate | null>(null);
  const [lastJobsCursor, setLastJobsCursor] = useState<{
    pageOffset: number;
    nextPageOffset: number;
  } | null>(null);
  const [lastJobsQuery, setLastJobsQuery] = useState('');
  const loadingMessageIdRef = useRef<string | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);
  const jobDescriptionInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const hasInteractedRef = useRef(false);

  // 1. Fix Hydration: Only initialize and fetch on mount
  useEffect(() => {
    setMounted(true);

    const initializeChat = async () => {
      try {
        const response = await apiInstance.get('/students/assistant/history');
        const history = Array.isArray(response.data?.messages)
          ? response.data.messages
          : [];

        if (history.length > 0) {
          setMessages(
            history.map((m: any, i: number) => ({
              id: `${m.createdAt || Date.now()}-${i}`,
              text: String(m.text || ''),
              sender: m.sender === 'assistant' ? 'ai' : 'user',
              timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
              responseType: m.responseType || 'text',
              metadata: m.metadata || {},
            })),
          );
        } else {
          setMessages([
            {
              id: 'welcome',
              text: "Hello, I'm ZobsAI Assistant. Pick an agent above to update your profile, find jobs, review your CV, generate a CV or cover letter, or write mail.",
              sender: 'ai',
              timestamp: new Date(),
            },
          ]);
        }
      } catch (err) {
        setMessages([
          {
            id: 'welcome',
            text: "Hello! I'm ZobsAI Assistant. Choose an agent above and I’ll help from there.",
            sender: 'ai',
            timestamp: new Date(),
          },
        ]);
      }
    };

    initializeChat();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, []);

  if (!mounted) return <div className="h-screen w-full bg-white" />;

  const activeModeConfig = getAssistantModeConfig(activeMode);
  const hasContext =
    !!jobDescription.trim() ||
    !!cvFile ||
    !!coverLetterFile ||
    !!jobDescriptionFile ||
    attachments.length > 0;
  const canSend = !isLoading && (Boolean(input.trim()) || hasContext || activeMode !== 'general');

  const clearLoadingProgress = () => {
    if (loadingTimerRef.current) {
      clearInterval(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    loadingMessageIdRef.current = null;
  };

  const startLoadingProgress = (mode: AssistantMode) => {
    const plan = buildProgressPlan(mode, hasContext);
    const messageId = `progress-${Date.now()}`;
    loadingMessageIdRef.current = messageId;

    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        text: plan.title,
        sender: 'ai',
        timestamp: new Date(),
        responseType: 'loading',
        metadata: {
          assistantMode: mode,
          progress: {
            ...plan,
            currentStep: 0,
          },
        },
      },
    ]);

    let currentStep = 0;
    loadingTimerRef.current = setInterval(() => {
      currentStep = Math.min(currentStep + 1, plan.chunks.length - 1);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId
            ? {
                ...message,
                metadata: {
                  ...(message.metadata || {}),
                  progress: {
                    ...plan,
                    currentStep,
                  },
                },
              }
            : message,
        ),
      );
      if (currentStep >= plan.chunks.length - 1 && loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    }, 900);

    return { messageId, plan };
  };

  const replaceLoadingMessage = (nextMessage: Message) => {
    const loadingMessageId = loadingMessageIdRef.current;
    clearLoadingProgress();

    if (!loadingMessageId) {
      setMessages((prev) => [...prev, nextMessage]);
      return;
    }

    setMessages((prev) =>
      prev.map((message) =>
        message.id === loadingMessageId
          ? {
              ...nextMessage,
              id: loadingMessageId,
            }
          : message,
      ),
    );
  };

  /** ─── ACTIONS ─── **/
  const submitAssistantRequest = async (
    overrideQuery?: string,
    options: any = {},
  ) => {
    const selectedMode: AssistantMode =
      options.assistantMode || activeMode || 'general';
    const modeConfig = getAssistantModeConfig(selectedMode);
    const rawQuery = typeof overrideQuery === 'string' ? overrideQuery : input;
    const query = rawQuery.trim() || (selectedMode !== 'general' ? modeConfig.starterPrompt : '');
    const explicitJobPageOffset =
      typeof options.jobPageOffset === 'number' ? options.jobPageOffset : null;
    const shouldAutoAdvanceJobs =
      selectedMode === 'find_jobs' &&
      explicitJobPageOffset === null &&
      lastJobsCursor &&
      (query === modeConfig.starterPrompt ||
        query === lastJobsQuery ||
        query.length === 0);
    const jobPageOffset =
      explicitJobPageOffset ??
      (shouldAutoAdvanceJobs ? lastJobsCursor.nextPageOffset : 0);

    if ((!query.trim() && !hasContext && selectedMode === 'general') || isLoading) return;

    hasInteractedRef.current = true;
    if (!options.suppressUserMessage) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          text: query || modeConfig.starterPrompt || 'Context shared.',
          sender: 'user',
          timestamp: new Date(),
          responseType: 'text',
          metadata: { assistantMode: selectedMode },
        },
      ]);
    }

    setInput('');
    setIsLoading(true);
    startLoadingProgress(selectedMode);

    try {
      const formData = new FormData();
      if (query) formData.append('query', query);
      if (cvFile) formData.append('cv', cvFile);
      if (coverLetterFile) formData.append('coverLetter', coverLetterFile);
      if (jobDescriptionFile)
        formData.append('jobDescriptionFile', jobDescriptionFile);
      attachments.forEach((f) => formData.append('attachments', f));
      formData.append('assistantMode', selectedMode);
      if (options.confirmUpdate) formData.append('confirmUpdate', 'true');
      if (selectedMode === 'find_jobs') {
        formData.append('jobPageOffset', String(jobPageOffset));
      }

      const response = await apiInstance.post(
        '/students/assistant/chat',
        formData,
        { responseType: 'arraybuffer' },
      );
      const contentType = String(
        response.headers?.['content-type'],
      ).toLowerCase();

      if (contentType.includes('application/pdf')) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'zobsai_update.pdf';
        a.click();
        replaceLoadingMessage({
          id: `${Date.now()}`,
          text: 'Profile update generated and downloaded.',
          sender: 'ai',
          timestamp: new Date(),
          responseType: 'pdf',
          metadata: { assistantMode: selectedMode, contentType: 'pdf' },
        });
        setPendingProfileUpdate(null);
      } else {
        const text = await decodeBinaryResponse(response.data);
        let data = {
          answer: text,
          needsConfirmation: false,
          preview: { summary: [], operationCount: 0 },
          message: '',
          responseType: 'text',
          jobs: [],
          emailDraft: null,
        };
        try {
          data = JSON.parse(text);
        } catch {}

        if (data.needsConfirmation) {
          setPendingProfileUpdate({
            query,
            jobDescription,
            message: data.message || 'Confirm profile updates:',
            summary: data.preview?.summary || [],
            operationCount: data.preview?.operationCount || 0,
          });
        } else {
          setPendingProfileUpdate(null);
        }

        if (Array.isArray(data.jobs) && data.jobs.length > 0) {
          const nextCursor =
            data.hasMoreJobs && data.jobsCursor && typeof data.jobsCursor === 'object'
              ? {
                  pageOffset:
                    Number(data.jobsCursor.pageOffset) || jobPageOffset || 0,
                  nextPageOffset:
                    Number(data.jobsCursor.nextPageOffset) ||
                    jobPageOffset + 5,
                }
              : null;
          setLastJobsCursor(nextCursor);
          setLastJobsQuery(query || modeConfig.starterPrompt || '');
        } else if (selectedMode === 'find_jobs') {
          setLastJobsCursor(null);
        }

        const responseType =
          data.responseType ||
          (Array.isArray(data.jobs) && data.jobs.length > 0
            ? 'jobs'
            : data.emailDraft
              ? 'email'
              : data.preview
                ? 'preview'
                : 'text');

        replaceLoadingMessage({
          id: `${Date.now()}`,
          text: data.answer || data.message || text,
          sender: 'ai',
          timestamp: new Date(),
          responseType,
          metadata: {
            assistantMode: data.mode || selectedMode,
            preview: data.preview || null,
            jobs: data.jobs || [],
            hasMoreJobs: Boolean(data.hasMoreJobs),
            jobsCursor: data.jobsCursor || null,
            emailDraft: data.emailDraft || null,
          },
        });
      }
    } catch (err: any) {
      replaceLoadingMessage({
        id: `${Date.now()}`,
        text: 'Error connecting to assistant.',
        sender: 'ai',
        timestamp: new Date(),
        responseType: 'error',
        metadata: { assistantMode: activeMode },
      });
    } finally {
      setIsLoading(false);
      clearLoadingProgress();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-white font-jakarta text-slate-900 antialiased">
      {/* ── SIDEBAR ── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-100 bg-[#f9f9f9] lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <span className="text-[15px] font-bold tracking-tight">ZobsAI</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-0.5">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setActiveMode(p.mode);
                  submitAssistantRequest(p.prompt, { assistantMode: p.mode });
                }}
                className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-600 hover:bg-white"
              >
                <Sparkles className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500" />
                <span className="truncate">{p.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* ── MAIN CHAT ── */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-semibold text-slate-700">
              ZobsAI Assistant
            </span>
            <div className="hidden rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 sm:inline-flex">
              {activeModeConfig.label}
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{' '}
            Session-private
          </div>
        </header>

        <div className="border-b border-slate-100 bg-white/70 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-3xl flex-wrap gap-2">
            {ASSISTANT_MODES.map((mode) => {
              const active = mode.id === activeMode;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setActiveMode(mode.id)}
                  className={`rounded-full border px-3 py-2 text-left transition ${
                    active
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-[12px] font-semibold">{mode.label}</div>
                  <div className="text-[10px] opacity-70">{mode.helper}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="custom-scrollbar flex-1 overflow-y-auto"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            setAttachments((prev) => [
              ...prev,
              ...Array.from(e.dataTransfer.files),
            ]);
          }}
        >
          <div className="mx-auto max-w-3xl px-4 pb-56 pt-8 sm:px-6">
            <div className="space-y-6">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${m.sender === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white'}`}
                  >
                    {m.sender === 'user' ? (
                      <User size={14} />
                    ) : (
                      <Bot size={14} />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] ${m.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none'}`}
                  >
                    {m.responseType === 'loading' &&
                    m.metadata?.progress?.chunks ? (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                              {m.metadata.progress.title || 'Working'}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {m.metadata.progress.subtitle ||
                                'Preparing your response in small steps.'}
                            </p>
                          </div>
                          <div className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                            {Math.min(
                              m.metadata.progress.currentStep + 1,
                              m.metadata.progress.chunks.length,
                            )}
                            /{m.metadata.progress.chunks.length}
                          </div>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                            style={{
                              width: `${Math.max(
                                8,
                                ((Math.min(
                                  m.metadata.progress.currentStep + 1,
                                  m.metadata.progress.chunks.length,
                                ) /
                                  m.metadata.progress.chunks.length) *
                                  100),
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          {m.metadata.progress.chunks.map(
                            (chunk: ProgressChunk, index: number) => {
                              const state =
                                index < m.metadata.progress.currentStep
                                  ? 'done'
                                  : index === m.metadata.progress.currentStep
                                    ? 'active'
                                    : 'pending';
                              return (
                                <div
                                  key={`${chunk.label}-${index}`}
                                  className={`flex items-start gap-3 rounded-xl border px-3 py-2 transition ${
                                    state === 'active'
                                      ? 'border-blue-200 bg-blue-50'
                                      : state === 'done'
                                        ? 'border-emerald-100 bg-emerald-50/60'
                                        : 'border-slate-100 bg-white'
                                  }`}
                                >
                                  <div
                                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                      state === 'active'
                                        ? 'bg-blue-600 text-white'
                                        : state === 'done'
                                          ? 'bg-emerald-500 text-white'
                                          : 'bg-slate-200 text-slate-500'
                                    }`}
                                  >
                                    {state === 'done' ? '✓' : index + 1}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                      {chunk.label}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {chunk.detail}
                                    </p>
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                      </div>
                    )}
                    {m.responseType === 'jobs' &&
                      Array.isArray(m.metadata?.jobs) &&
                      m.metadata.jobs.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {m.metadata.jobs.slice(0, 5).map((job: any) => (
                            <div
                              key={job.id || job._id || `${job.title}-${job.company}`}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {job.title || 'Untitled role'}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {job.company || 'Unknown company'}
                                    {job.location ? ` · ${job.location}` : ''}
                                  </p>
                                </div>
                                {formatMatchPercent(
                                  job.matchPercent ?? job.rankScore,
                                ) && (
                                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                                    {formatMatchPercent(
                                      job.matchPercent ?? job.rankScore,
                                    )}{' '}
                                    match
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                                {job.remote && (
                                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                                    Remote
                                  </span>
                                )}
                                {Array.isArray(job.jobTypes) &&
                                  job.jobTypes.slice(0, 3).map((type: string) => (
                                    <span
                                      key={`${job.id || job.title}-${type}`}
                                      className="rounded-full bg-slate-100 px-2 py-1"
                                    >
                                      {type}
                                    </span>
                                  ))}
                              </div>
                              {job.jobUrl && (
                                <div className="mt-3">
                                  <a
                                    href={job.jobUrl}
                                    target={job.isExternalUrl ? '_blank' : undefined}
                                    rel={job.isExternalUrl ? 'noreferrer' : undefined}
                                    className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                                  >
                                    {job.isExternalUrl ? 'Apply now' : 'View job'}
                                  </a>
                                </div>
                              )}
                            </div>
                          ))}
                          {m.metadata?.hasMoreJobs && (
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() =>
                                  submitAssistantRequest(
                                    'Find me more unique jobs that match my current profile.',
                                    {
                                      assistantMode: 'find_jobs',
                                      suppressUserMessage: true,
                                      jobPageOffset:
                                        Number(
                                          m.metadata?.jobsCursor?.nextPageOffset,
                                        ) || 0,
                                    },
                                  )
                                }
                                disabled={isLoading}
                                className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 disabled:opacity-60"
                              >
                                Load more jobs
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    {m.responseType === 'email' && m.metadata?.emailDraft && (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Email draft
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {m.metadata.emailDraft.subject || 'Job Application'}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          {String(m.metadata.emailDraft.body || '')
                            .slice(0, 180)
                            .trim()}
                          {String(m.metadata.emailDraft.body || '').length > 180
                            ? '…'
                            : ''}
                        </p>
                      </div>
                    )}
                    {m.responseType === 'preview' &&
                      Array.isArray(m.metadata?.preview?.summary) &&
                      m.metadata.preview.summary.length > 0 && (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                            Pending confirmation
                          </p>
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-amber-900">
                            {m.metadata.preview.summary.slice(0, 5).map((item: string) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    <p
                      className={`mt-1 text-[10px] opacity-50 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}
                    >
                      {formatTime(m.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && !loadingMessageIdRef.current && (
                <div className="flex gap-2 p-4">
                  <Loader2 className="animate-spin text-blue-500" size={20} />
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        </div>

        {/* ── INPUT AREA ── */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-white via-white to-transparent p-4">
          <div className="mx-auto max-w-3xl">
            {pendingProfileUpdate && (
              <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                <p className="text-sm font-bold text-amber-800">
                  {pendingProfileUpdate.operationCount} changes ready
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() =>
                      submitAssistantRequest(pendingProfileUpdate.query, {
                        assistantMode: 'update_profile',
                        confirmUpdate: true,
                        suppressUserMessage: true,
                      })
                    }
                    className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white"
                  >
                    Confirm & Download PDF
                  </button>
                  <button
                    onClick={() => setPendingProfileUpdate(null)}
                    className="rounded-lg border bg-white px-4 py-2 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-300 bg-white p-2 shadow-sm focus-within:border-blue-500">
              <div className="flex items-center justify-between px-3 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                <span>{activeModeConfig.label} Agent</span>
                <span>{activeModeConfig.helper}</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  (e.metaKey || e.ctrlKey) &&
                  submitAssistantRequest()
                }
                placeholder={activeModeConfig.placeholder}
                className="w-full resize-none border-none p-3 text-sm focus:ring-0"
                rows={2}
              />
              <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex gap-1">
                  <button
                    onClick={() => cvInputRef.current?.click()}
                    className="rounded-lg bg-blue-50 p-2 text-blue-600"
                  >
                    <FileText size={16} />
                  </button>
                  <button
                    onClick={() => coverLetterInputRef.current?.click()}
                    className="rounded-lg bg-violet-50 p-2 text-violet-600"
                  >
                    <FileUp size={16} />
                  </button>
                  <button
                    onClick={() => jobDescriptionInputRef.current?.click()}
                    className="rounded-lg bg-amber-50 p-2 text-amber-600"
                  >
                    <MessageSquareText size={16} />
                  </button>
                  <button
                    onClick={() => attachmentInputRef.current?.click()}
                    className="rounded-lg bg-slate-50 p-2 text-slate-600"
                  >
                    <Paperclip size={16} />
                  </button>
                </div>
                <button
                  disabled={!canSend}
                  onClick={() => submitAssistantRequest()}
                  className="rounded-xl bg-blue-600 p-2.5 text-white disabled:bg-slate-200"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Inputs */}
      <input
        ref={cvInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        className="hidden"
        onChange={(e) => setCvFile(e.target.files?.[0] || null)}
      />
      <input
        ref={coverLetterInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        className="hidden"
        onChange={(e) => setCoverLetterFile(e.target.files?.[0] || null)}
      />
      <input
        ref={jobDescriptionInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        className="hidden"
        onChange={(e) => setJobDescriptionFile(e.target.files?.[0] || null)}
      />
      <input
        ref={attachmentInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) =>
          setAttachments((prev) => [
            ...prev,
            ...Array.from(e.target.files || []),
          ])
        }
      />
    </div>
  );
}
