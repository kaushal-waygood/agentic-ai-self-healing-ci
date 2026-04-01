'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  RefreshCcw,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { getSentRecruiterEmails } from '@/services/api/auth';
import { getScheduledEmails } from '@/services/api/job';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface SentEmailItem {
  _id: string;
  recruiterEmail: string;
  subject: string;
  sentCv: boolean;
  sentCoverLetter: boolean;
  sentEmailDraft: boolean;
  jobTitle?: string;
  companyName?: string;
  cvId?: string;
  clId?: string;
  applicationId?: string;
  createdAt: string;
}

interface ScheduledEmailItem {
  _id: string;
  to: string;
  subject: string;
  bodyHtml?: string;
  coverLetterHtml?: string | null;
  scheduledAt: string;
  timezone?: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface HistoryResponse<T> {
  items: T[];
  pagination: Pagination;
}

type EmailTab = 'sent' | 'scheduled';

const limit = 20;

const stripHtml = (value = '') =>
  value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const getDateTimeParts = (value: string, timeZone?: string) => {
  const date = new Date(value);
  const sharedOptions = timeZone ? { timeZone } : {};

  try {
    return {
      date: date.toLocaleDateString(undefined, {
        ...sharedOptions,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString(undefined, {
        ...sharedOptions,
        hour: 'numeric',
        minute: '2-digit',
      }),
    };
  } catch {
    return {
      date: date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }),
    };
  }
};

const STATUS_STYLES: Record<ScheduledEmailItem['status'], string> = {
  pending:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  sent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
};

const STATUS_LABELS: Record<ScheduledEmailItem['status'], string> = {
  pending: 'Pending',
  sent: 'Sent',
  failed: 'Failed',
};

function PaginationFooter({
  pagination,
  page,
  onPrevious,
  onNext,
}: {
  pagination: Pagination;
  page: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (pagination.pages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing {(page - 1) * pagination.limit + 1}-
        {Math.min(page * pagination.limit, pagination.total)} of{' '}
        {pagination.total}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onPrevious} disabled={page <= 1}>
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= pagination.pages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 p-12 md:p-16">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-20 blur-xl" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function SentEmailsClient() {
  const [activeTab, setActiveTab] = useState<EmailTab>('sent');
  const [sentData, setSentData] = useState<HistoryResponse<SentEmailItem> | null>(
    null,
  );
  const [scheduledData, setScheduledData] = useState<
    HistoryResponse<ScheduledEmailItem> | null
  >(null);
  const [loadingTab, setLoadingTab] = useState<EmailTab | null>('sent');
  const [refreshingTab, setRefreshingTab] = useState<EmailTab | null>(null);
  const [sentPage, setSentPage] = useState(1);
  const [scheduledPage, setScheduledPage] = useState(1);

  const fetchSentHistory = async (isRefresh = false) => {
    if (isRefresh) setRefreshingTab('sent');
    else setLoadingTab('sent');

    try {
      const result = await getSentRecruiterEmails({ page: sentPage, limit });
      setSentData(result);
    } catch {
      if (!isRefresh) setSentData(null);
    } finally {
      if (isRefresh) setRefreshingTab(null);
      else setLoadingTab((current) => (current === 'sent' ? null : current));
    }
  };

  const fetchScheduledHistory = async (isRefresh = false) => {
    if (isRefresh) setRefreshingTab('scheduled');
    else setLoadingTab('scheduled');

    try {
      const result = await getScheduledEmails({ page: scheduledPage, limit });
      setScheduledData(result);
    } catch {
      if (!isRefresh) setScheduledData(null);
    } finally {
      if (isRefresh) setRefreshingTab(null);
      else setLoadingTab((current) => (current === 'scheduled' ? null : current));
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      if (activeTab === 'sent') {
        setLoadingTab('sent');
        try {
          const result = await getSentRecruiterEmails({ page: sentPage, limit });
          setSentData(result);
        } catch {
          setSentData(null);
        } finally {
          setLoadingTab((current) => (current === 'sent' ? null : current));
        }
        return;
      }

      setLoadingTab('scheduled');
      try {
        const result = await getScheduledEmails({
          page: scheduledPage,
          limit,
        });
        setScheduledData(result);
      } catch {
        setScheduledData(null);
      } finally {
        setLoadingTab((current) => (current === 'scheduled' ? null : current));
      }
    };

    void loadHistory();
  }, [activeTab, sentPage, scheduledPage]);

  const handleRefresh = () => {
    if (activeTab === 'sent') {
      void fetchSentHistory(true);
      return;
    }

    void fetchScheduledHistory(true);
  };

  const currentData = activeTab === 'sent' ? sentData : scheduledData;
  const isLoading = loadingTab === activeTab;
  const isRefreshing = refreshingTab === activeTab;
  const totalCount = currentData?.pagination?.total ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Email History
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {activeTab === 'sent'
                      ? `${totalCount} emails sent from the platform`
                      : `${totalCount} scheduled emails queued from the platform`}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value === 'scheduled' ? 'scheduled' : 'sent')
              }
            >
              <TabsList className="h-auto rounded-xl border border-slate-200/70 bg-slate-100/80 p-1 dark:border-slate-700 dark:bg-slate-800/80">
                <TabsTrigger
                  value="sent"
                  className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white"
                >
                  Sent
                  {sentData ? ` (${sentData.pagination.total})` : ''}
                </TabsTrigger>
                <TabsTrigger
                  value="scheduled"
                  className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white"
                >
                  Scheduled
                  {scheduledData ? ` (${scheduledData.pagination.total})` : ''}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <Tabs value={activeTab}>
          <TabsContent value="sent" className="mt-0">
            {activeTab === 'sent' && isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              </div>
            ) : sentData?.items?.length ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/80">
                      <tr>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          Date
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          To
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          Subject / Job
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          Attachments
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          Documents
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {sentData.items.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-4 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleDateString()}
                            <span className="block text-xs text-slate-400">
                              {new Date(item.createdAt).toLocaleTimeString()}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100">
                            {item.recruiterEmail}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {item.jobTitle || item.subject}
                            </span>
                            {item.companyName && (
                              <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {item.companyName}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-2">
                              {item.sentCv && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-200">
                                  <FileText className="h-3.5 w-3.5" /> CV
                                </span>
                              )}
                              {item.sentCoverLetter && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/40 px-2.5 py-1 text-xs font-medium text-purple-700 dark:text-purple-200">
                                  CL
                                </span>
                              )}
                              {item.sentEmailDraft && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-200">
                                  <Mail className="h-3.5 w-3.5" /> Email
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-2">
                              {item.cvId && (
                                <Link
                                  href={`/dashboard/my-docs/cv/${item.cvId}`}
                                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                  CV <ExternalLink className="h-3 w-3" />
                                </Link>
                              )}
                              {item.clId && (
                                <Link
                                  href={`/dashboard/my-docs/cl/${item.clId}`}
                                  className="inline-flex items-center gap-1 rounded-lg bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                                >
                                  CL <ExternalLink className="h-3 w-3" />
                                </Link>
                              )}
                              {item.applicationId && (
                                <Link
                                  href={`/dashboard/my-docs/application/${item.applicationId}`}
                                  className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                                >
                                  Tailored <ExternalLink className="h-3 w-3" />
                                </Link>
                              )}
                              {!item.cvId &&
                                !item.clId &&
                                !item.applicationId && (
                                  <span className="text-xs text-slate-400 dark:text-slate-500">
                                    -
                                  </span>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <PaginationFooter
                  pagination={sentData.pagination}
                  page={sentPage}
                  onPrevious={() => setSentPage((page) => Math.max(1, page - 1))}
                  onNext={() =>
                    setSentPage((page) =>
                      Math.min(sentData.pagination.pages, page + 1),
                    )
                  }
                />
              </div>
            ) : (
              <div className="space-y-6">
                <EmptyState
                  icon={<Send className="w-10 h-10 text-slate-400 dark:text-slate-500" />}
                  title="No emails sent yet"
                  description="Send CV or cover letter to recruiters from your documents to see them here."
                />
                <div className="flex justify-center">
                  <Link href="/dashboard/my-docs">
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                      Go to My Docs
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="mt-0">
            {activeTab === 'scheduled' && isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              </div>
            ) : scheduledData?.items?.length ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/80">
                      <tr>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          Scheduled For
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          To
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          Email
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {scheduledData.items.map((item) => {
                        const scheduled = getDateTimeParts(
                          item.scheduledAt,
                          item.timezone,
                        );
                        const queued = getDateTimeParts(item.createdAt);
                        const preview = stripHtml(item.bodyHtml).slice(0, 120);

                        return (
                          <tr
                            key={item._id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors align-top"
                          >
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="font-medium text-slate-900 dark:text-slate-100">
                                {scheduled.date}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {scheduled.time}
                              </div>
                              <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                {item.timezone || 'UTC'}
                              </div>
                              <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                Queued {queued.date} {queued.time}
                              </div>
                            </td>
                            <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100">
                              {item.to}
                            </td>
                            <td className="py-4 px-4 min-w-[280px]">
                              <div className="font-medium text-slate-900 dark:text-slate-100">
                                {item.subject || 'Job Application'}
                              </div>
                              {preview && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                                  {preview}
                                </div>
                              )}
                              {item.coverLetterHtml && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/40 px-2.5 py-1 mt-2 text-xs font-medium text-purple-700 dark:text-purple-200">
                                  <FileText className="h-3.5 w-3.5" /> Cover letter attached
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[item.status]}`}
                              >
                                {item.status === 'pending' && (
                                  <Clock className="h-3.5 w-3.5" />
                                )}
                                {item.status === 'sent' && (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                {item.status === 'failed' && (
                                  <AlertCircle className="h-3.5 w-3.5" />
                                )}
                                {STATUS_LABELS[item.status]}
                              </span>
                              {item.error && (
                                <div className="text-xs text-rose-600 dark:text-rose-300 mt-2 max-w-xs">
                                  {item.error}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <PaginationFooter
                  pagination={scheduledData.pagination}
                  page={scheduledPage}
                  onPrevious={() =>
                    setScheduledPage((page) => Math.max(1, page - 1))
                  }
                  onNext={() =>
                    setScheduledPage((page) =>
                      Math.min(scheduledData.pagination.pages, page + 1),
                    )
                  }
                />
              </div>
            ) : (
              <EmptyState
                icon={<Clock className="w-10 h-10 text-slate-400 dark:text-slate-500" />}
                title="No scheduled emails yet"
                description="When you queue recruiter emails for later delivery, they will show here with their scheduled time and current status."
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
