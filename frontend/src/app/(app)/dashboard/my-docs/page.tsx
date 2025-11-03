'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Bookmark,
  Send,
  Clock,
  Trash2,
  Download,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { DocumentCard } from './components/DocumentCard';

interface CV {
  _id: string;
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  jobContextString: string;
  finalTouch?: string;
  cvData: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

interface CoverLetter {
  _id: string;
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  jobContextString: string;
  finalTouch?: string;
  clData: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

interface TailoredApplication {
  _id: string;
  jobId?: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  status: 'pending' | 'completed' | 'failed';
  tailoredCV?: any;
  tailoredCoverLetter?: any;
  applicationEmail?: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

interface DocumentStats {
  cvsCount: number;
  coverLettersCount: number;
  tailoredApplicationsCount: number;
}

export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Initialize from query param (?tab=cvs / ?tab=cover-letters / ?tab=applications)
  const initialTab =
    (searchParams.get('tab') as 'cvs' | 'cover-letters' | 'applications') ||
    'cvs';
  const [activeTab, setActiveTab] = useState<
    'cvs' | 'cover-letters' | 'applications'
  >(initialTab);

  const [cvs, setCvs] = useState<CV[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [applications, setApplications] = useState<TailoredApplication[]>([]);
  const [stats, setStats] = useState<DocumentStats>({
    cvsCount: 0,
    coverLettersCount: 0,
    tailoredApplicationsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Update the URL whenever tab changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', activeTab);
    router.replace(`${window.location.pathname}?${params.toString()}`);
  }, [activeTab, router]);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchCVs(), fetchCoverLetters(), fetchApplications()]);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load your documents',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCVs = async () => {
    try {
      const response = await apiInstance.get('/students/cvs');
      setCvs(response.data.cvs || []);
      setStats((prev) => ({
        ...prev,
        cvsCount: response.data.cvs?.length || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch CVs:', error);
      throw error;
    }
  };

  const fetchCoverLetters = async () => {
    try {
      const response = await apiInstance.get('/students/cls');
      setCoverLetters(response.data.cls || []);
      setStats((prev) => ({
        ...prev,
        coverLettersCount: response.data.cls?.length || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch cover letters:', error);
      throw error;
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await apiInstance.get('/students/tailored-applications');
      setApplications(response.data.tailoredApplications || []);
      setStats((prev) => ({
        ...prev,
        tailoredApplicationsCount:
          response.data.tailoredApplications?.length || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      throw error;
    }
  };

  const deleteCV = async (cvId: string) => {
    try {
      await apiInstance.delete(`/students/cv/${cvId}`);
      toast({ title: 'Success', description: 'CV deleted successfully' });
      fetchCVs();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete CV',
      });
    }
  };

  const deleteCoverLetter = async (clId: string) => {
    try {
      await apiInstance.delete(`/students/cl/${clId}`);
      toast({ title: 'Success', description: 'Cover letter deleted' });
      fetchCoverLetters();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete cover letter',
      });
    }
  };

  const deleteApplication = async (appId: string) => {
    try {
      await apiInstance.delete(`/students/tailored-applications/${appId}`);
      toast({ title: 'Success', description: 'Application deleted' });
      fetchApplications();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete application',
      });
    }
  };

  const copyToClipboard = async (content: any, id: string) => {
    if (!content) return;
    const textToCopy = content.cv || content.html;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: 'Copied to Clipboard!',
        description: `content has been copied as plain text.`,
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({ variant: 'destructive', title: 'Copy Failed' });
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadAsFile = async (content: any, title: string) => {
    if (!content) return;
    setIsLoading(true);
    toast({ title: 'Generating PDF...' });

    const htmlContent = content.cv || content.html;
    console.log('htmlContent', htmlContent);
    try {
      const response = await apiInstance.post(
        '/students/pdf/generate-pdf',
        { html: htmlContent, title },
        { responseType: 'blob' },
      );
      if (response.status !== 200)
        throw new Error('PDF generation failed on the server.');

      const blob = new Blob([response.data], { type: 'application/pdf' });
      downloadFile(blob, `zobsai_${title.replace(/ /g, '_')}.pdf`);
      toast({ title: 'PDF downloaded successfully!' });
    } catch (error) {
      console.error('PDF Download Error:', error);
      toast({
        variant: 'destructive',
        title: 'PDF Download Failed',
        description: 'An error occurred while generating the PDF.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    console.log('status', status);
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
            My Documents
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your CVs, Cover Letters, and Applications
          </p>
        </div>

        {/* ✅ Stat Tabs (interactive with params) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="CVs"
            value={stats.cvsCount}
            icon={FileText}
            color="from-blue-500 to-blue-600"
            isActive={activeTab === 'cvs'}
            onClick={() => setActiveTab('cvs')}
          />
          <StatCard
            label="Cover Letters"
            value={stats.coverLettersCount}
            icon={Bookmark}
            color="from-purple-500 to-pink-500"
            isActive={activeTab === 'cover-letters'}
            onClick={() => setActiveTab('cover-letters')}
          />
          <StatCard
            label="Applications"
            value={stats.tailoredApplicationsCount}
            icon={Send}
            color="from-green-500 to-emerald-500"
            isActive={activeTab === 'applications'}
            onClick={() => setActiveTab('applications')}
          />
        </div>

        {/* ✅ Conditional Sections */}
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20">
              {/* <Loader2 className="h-12 w-12 animate-spin text-blue-500" /> */}
              <div>
                <img
                  src="/logo.png"
                  alt=""
                  className="w-10 h-10 animate-bounce"
                />
              </div>

              <div className="text-lg">LOADING...</div>
            </div>
          ) : (
            <>
              {activeTab === 'cvs' && (
                <DocumentSection
                  title="Generated CVs"
                  items={cvs}
                  onDelete={deleteCV}
                  onCopy={copyToClipboard}
                  onDownload={downloadAsFile}
                  copiedId={copiedId}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                  type="cv"
                />
              )}

              {activeTab === 'cover-letters' && (
                <DocumentSection
                  title="Generated Cover Letters"
                  items={coverLetters}
                  onDelete={deleteCoverLetter}
                  onCopy={copyToClipboard}
                  onDownload={downloadAsFile}
                  copiedId={copiedId}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                  type="coverLetter"
                />
              )}

              {activeTab === 'applications' && (
                <DocumentSection
                  title="Tailored Applications"
                  items={applications}
                  onDelete={deleteApplication}
                  onCopy={copyToClipboard}
                  onDownload={downloadAsFile}
                  copiedId={copiedId}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                  type="application"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  isActive,
  onClick,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <div
    className={`p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
      isActive
        ? 'border-blue-500 bg-white dark:bg-gray-800 shadow-lg scale-105'
        : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:scale-102'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {value}
        </p>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-r ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const DocumentSection = ({
  title,
  items,
  onDelete,
  onCopy,
  onDownload,
  copiedId,
  getStatusIcon,
  getStatusColor,
  formatDate,
  type,
}: any) => {
  // 1. Add state to store the search input
  const [searchTerm, setSearchTerm] = useState('');

  // 2. Create the filtering logic
  const filteredItems = items.filter((item: any) => {
    if (!searchTerm) return true; // If search is empty, show all items

    const searchLower = searchTerm.toLowerCase();

    // Search against the fields used in DocumentCard's getTitle()
    const title = (item.jobTitle || '').toLowerCase();
    const company = (item.companyName || '').toLowerCase();
    const context = (item.jobContextString || '').toLowerCase();

    return (
      title.includes(searchLower) ||
      company.includes(searchLower) ||
      context.includes(searchLower)
    );
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h2>
        <div>
          {/* 3. Wire up the input to the state */}
          <input
            type="text"
            className="p-1 border border-gray-300 dark:border-gray-600 rounded-md"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Update conditional rendering logic */}
      {items.length === 0 ? (
        // This shows if there are NO items at all
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No{' '}
            {type === 'cv'
              ? 'CVs'
              : type === 'coverLetter'
              ? 'Cover Letters'
              : 'Applications'}{' '}
            Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {type === 'cv'
              ? 'Generate your first CV to get started'
              : type === 'coverLetter'
              ? 'Create your first cover letter to see it here'
              : 'Create your first tailored application to see it here'}
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        // This shows if there are items, but none match the search
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Results Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your search for "{searchTerm}" did not match any documents.
          </p>
        </div>
      ) : (
        // This shows the filtered results
        <div className="space-y-4">
          {/* 5. Map over the filtered list */}
          {filteredItems.map((item: any) => (
            <DocumentCard
              key={item._id}
              item={item}
              type={type}
              onDelete={onDelete}
              onCopy={onCopy}
              onDownload={onDownload}
              copiedId={copiedId}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
