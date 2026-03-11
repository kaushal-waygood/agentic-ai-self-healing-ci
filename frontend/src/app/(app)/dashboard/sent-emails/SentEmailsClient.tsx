'use client';

import React, { useEffect, useState } from 'react';
import {
  Send,
  Loader2,
  Mail,
  FileText,
  RefreshCcw,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { getSentRecruiterEmails } from '@/services/api/auth';
import { Button } from '@/components/ui/button';

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

export default function SentEmailsClient() {
  const [data, setData] = useState<{
    items: SentEmailItem[];
    pagination: { page: number; limit: number; total: number; pages: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await getSentRecruiterEmails({ page, limit });
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleRefresh = () => fetchData(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Sent Emails to Recruiters
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {data?.pagination?.total ?? 0} emails sent from the platform
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCcw
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        ) : data?.items?.length ? (
          <div className="space-y-4">
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
                    {data.items.map((item) => (
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
                            {!item.cvId && !item.clId && !item.applicationId && (
                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                —
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.pagination.pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Showing {(page - 1) * limit + 1}–
                    {Math.min(page * limit, data.pagination.total)} of{' '}
                    {data.pagination.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) =>
                          Math.min(data.pagination.pages, p + 1)
                        )
                      }
                      disabled={page >= data.pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 p-12 md:p-16">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-20 blur-xl" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center">
                  <Send className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                No emails sent yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto mb-6">
                Send CV or cover letter to recruiters from your documents to see
                them here.
              </p>
              <Link href="/dashboard/my-docs">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  Go to My Docs
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
