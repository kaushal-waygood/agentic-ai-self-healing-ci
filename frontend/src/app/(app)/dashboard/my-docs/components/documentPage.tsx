'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Bookmark,
  Send,
  Clock,
  Trash2,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';
import { toast, useToast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { DocumentCard } from './DocumentCard';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import {
  deleteSavedCoverLetterRequest,
  deleteSavedResumeRequest,
  renameSavedCoverLetterRequest,
  renameSavedResumeRequest,
  savedStudentCoverLetterRequest,
  savedStudentResumeRequest,
} from '@/redux/reducers/aiReducer';
import { useDispatch } from 'react-redux';

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

  // Initialize from query param
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

  // Rename functionality states
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<{
    id: string;
    type: 'cv' | 'coverLetter';
    currentTitle: string;
  } | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const dispatch = useDispatch();

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

  useEffect(() => {
    dispatch(savedStudentResumeRequest());
    dispatch(savedStudentCoverLetterRequest());
  }, [dispatch]);
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

  // Rename functionality
  const handleRename = (
    documentId: string,
    type: 'cv' | 'coverLetter',
    currentTitle: string,
  ) => {
    setCurrentDocument({ id: documentId, type, currentTitle });
    setNewTitle(currentTitle);
    setIsRenameDialogOpen(true);
  };

  const confirmRename = async () => {
    if (!currentDocument || !newTitle.trim()) return;

    setIsRenaming(true);
    try {
      const endpoint =
        currentDocument.type === 'cv'
          ? '/students/resume/title/rename'
          : '/students/cover-letter/title/rename';

      const payload =
        currentDocument.type === 'cv'
          ? { cvId: currentDocument.id, newTitle: newTitle.trim() }
          : { coverLetterId: currentDocument.id, newTitle: newTitle.trim() };

      const response = await apiInstance.patch(endpoint, payload);

      // Update local state based on document type
      if (currentDocument.type === 'cv') {
        setCvs((prev) =>
          prev.map((cv) =>
            cv._id === currentDocument.id
              ? { ...cv, jobContextString: newTitle.trim() }
              : cv,
          ),
        );
      } else {
        setCoverLetters((prev) =>
          prev.map((cl) =>
            cl._id === currentDocument.id
              ? { ...cl, jobContextString: newTitle.trim() }
              : cl,
          ),
        );
      }

      toast({
        title: 'Document Renamed!',
        description: `${
          currentDocument.type === 'cv' ? 'CV' : 'Cover letter'
        } has been renamed successfully.`,
      });

      setIsRenameDialogOpen(false);
      setCurrentDocument(null);
      setNewTitle('');
    } catch (error: any) {
      console.error('Error renaming document:', error);
      toast({
        variant: 'destructive',
        title: 'Rename Failed',
        description: error.response?.data?.error || 'Failed to rename document',
      });
    } finally {
      setIsRenaming(false);
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

  const deleteSavedCV = async (documentId: string) => {
    try {
      await dispatch(deleteSavedResumeRequest({ cvId: documentId }));
      toast({ title: 'Success', description: 'CV deleted successfully' });
      await dispatch(savedStudentResumeRequest());
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete CV',
      });
    }
  };

  const deleteSavedCoverLetter = async (documentId: string) => {
    try {
      await dispatch(deleteSavedCoverLetterRequest({ clId: documentId }));
      toast({ title: 'Success', description: 'Cover letter deleted' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete cover letter',
      });
    }
  };

  const renameSavedCoverLetter = async (
    documentId: string,
    newTitle: string,
  ) => {
    try {
      await dispatch(
        renameSavedCoverLetterRequest({ clId: documentId, newTitle }) as any,
      );
      toast({ title: 'Success', description: 'Cover letter renamed' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to rename cover letter',
      });
    }
  };

  const renameSavedCV = async (documentId: string, newTitle: string) => {
    try {
      await dispatch(
        renameSavedResumeRequest({
          cvId: documentId,
          newTitle,
        }) as any,
      );

      toast({
        title: 'Document Renamed',
        description: 'Updated name fetched successfully.',
      });
    } catch (error) {
      console.error('Rename failed:', error);
      toast({
        variant: 'destructive',
        title: 'Rename Failed',
        description: 'Could not update the document name.',
      });
      throw error;
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
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: 'Copied to Clipboard!',
        description: `Content has been copied as plain text.`,
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

  const refreshGeneratedDocs = (type: 'cv' | 'coverLetter' | 'application') => {
    if (type === 'cv') {
      fetchCVs();
    } else if (type === 'coverLetter') {
      fetchCoverLetters();
    } else if (type === 'application') {
      fetchApplications();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl uppercase font-semibold sm:text-3xl md:text-4xl bg-headingTextPrimary text-foreground bg-clip-text text-transparent relative z-10">
            My Documents
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your CVs, Cover Letters, and Applications
          </p>
        </div>

        {/* ✅ Stat Tabs (interactive with params) */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <StatCard
            label="Curiculums Vitae"
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
            label="Tailored Applications "
            value={stats.tailoredApplicationsCount}
            icon={Send}
            color="from-green-500 to-emerald-500"
            isActive={activeTab === 'applications'}
            onClick={() => setActiveTab('applications')}
          />
        </div>

        {/* ✅ Conditional Sections */}
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 backdrop-blur-sm">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20">
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
                  title="CVs"
                  items={cvs}
                  refreshGeneratedDocs={refreshGeneratedDocs}
                  onDelete={deleteCV}
                  onDeleteSaved={deleteSavedCV}
                  onCopy={copyToClipboard}
                  onDownload={downloadAsFile}
                  onRename={handleRename}
                  onRenameSaved={renameSavedCV}
                  copiedId={copiedId}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                  type="cv"
                />
              )}

              {activeTab === 'cover-letters' && (
                <DocumentSection
                  title="Cover Letters"
                  refreshGeneratedDocs={refreshGeneratedDocs}
                  items={coverLetters}
                  onDelete={deleteCoverLetter}
                  onDeleteSaved={deleteSavedCoverLetter}
                  onRename={handleRename}
                  onRenameSaved={renameSavedCoverLetter}
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

      {/* Rename Dialog */}
      {isRenameDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Rename {currentDocument?.type === 'cv' ? 'CV' : 'Cover Letter'}
              </h3>
              <button
                onClick={() => {
                  setIsRenameDialogOpen(false);
                  setCurrentDocument(null);
                  setNewTitle('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter a new name for your{' '}
              {currentDocument?.type === 'cv' ? 'CV' : 'cover letter'}.
            </p>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
              placeholder={`Enter ${
                currentDocument?.type === 'cv' ? 'CV' : 'cover letter'
              } name`}
              maxLength={100}
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsRenameDialogOpen(false);
                  setCurrentDocument(null);
                  setNewTitle('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                disabled={isRenaming}
              >
                Cancel
              </button>
              <button
                onClick={confirmRename}
                disabled={!newTitle.trim() || isRenaming}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
              >
                {isRenaming ? 'Renaming...' : 'Rename'}
              </button>
            </div>
          </div>
        </div>
      )}
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
    className={`p-4 md:p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
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
      <div
        className={`hidden md:block p-3 rounded-lg bg-gradient-to-r ${color}`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const DocumentSection = ({
  title,
  items,
  onDelete,
  onDeleteSaved,
  onRenameSaved,
  onCopy,
  onDownload,
  copiedId,
  getStatusIcon,
  refreshGeneratedDocs,
  getStatusColor,
  formatDate,
  type,
}: any) => {
  const [visibleCount, setVisibleCount] = useState(10);
  // const [docState, setDocState] = useState<'generated' | 'saved'>('generated');
  const dispatch = useDispatch();

  const searchParams = useSearchParams();

  const initialDocState =
    searchParams.get('q') === 'saved' ? 'saved' : 'generated';

  const [docState, setDocState] = useState<'generated' | 'saved'>(
    initialDocState,
  );

  // 1. Add state to store the search input
  const [searchTerm, setSearchTerm] = useState('');

  // actual search used for filtering
  const [finalSearchTerm, setFinalSearchTerm] = useState('');

  // Auto reset when input becomes empty
  useEffect(() => {
    if (searchTerm === '') {
      setFinalSearchTerm('');
    }
  }, [searchTerm]);

  useEffect(() => {
    if (type === 'application') {
      setDocState('generated');
    }
  }, [type]);

  const { resume, coverLetter } = useSelector((state: RootState) => state.ai);

  const listToRender = (() => {
    if (docState === 'saved') {
      if (type === 'cv') {
        return Array.isArray(resume?.html) ? resume.html : [];
      }

      if (type === 'coverLetter') {
        return Array.isArray(coverLetter?.html) ? coverLetter.html : [];
      }

      return [];
    }

    return Array.isArray(items) ? items : [];
  })();

  const filteredItems = listToRender.filter((item: any) => {
    if (!finalSearchTerm.trim()) return true;

    const searchLower = finalSearchTerm.toLowerCase();

    // Collect all searchable text safely
    const searchableText = [
      // item.title,
      // item.jobTitle,
      // item.companyName,
      // item.jobContextString,
      // item.name,
      // item.description,
      item.clTitle,
      item.coverLetterTitle,
      item.cvTitle,
      item.htmlCVTitle,
    ]
      .filter(Boolean) // remove undefined/null
      .join(' ')
      .toLowerCase();

    return searchableText.includes(searchLower);
  });

  const handleSearch = () => {
    setFinalSearchTerm(searchTerm); // 🔥 Search only when triggered
  };

  const handleRenameDocument = async (documentId: string, newTitle: string) => {
    try {
      const endpoint =
        docState === 'saved'
          ? type === 'cv'
            ? `/students/resume/${documentId}/rename`
            : `/students/cover-letter/${documentId}/rename`
          : type === 'cv'
            ? `/students/cv/${documentId}/rename`
            : `/students/cl/${documentId}/rename`;

      await apiInstance.patch(endpoint, { title: newTitle });

      // 🔥 refresh logic
      if (docState === 'saved') {
        type === 'cv'
          ? dispatch(savedStudentResumeRequest())
          : dispatch(savedStudentCoverLetterRequest());
      } else {
        refreshGeneratedDocs(type);
      }

      toast({
        title: 'Document Renamed',
        description: 'Updated name fetched successfully.',
      });
    } catch (error) {
      console.error('Rename failed:', error);
      toast({
        variant: 'destructive',
        title: 'Rename Failed',
        description: 'Could not update the document name.',
      });
      throw error;
    }
  };

  // ... existing hooks

  // 1. Calculate Generated Count
  const generatedCount = Array.isArray(items) ? items.length : 0;

  // 2. Calculate Saved Count based on type
  const savedCount =
    type === 'cv'
      ? Array.isArray(resume?.html)
        ? resume.html.length
        : 0
      : type === 'coverLetter'
        ? Array.isArray(coverLetter?.html)
          ? coverLetter.html.length
          : 0
        : 0;

  return (
    <div className="p-6">
      <div className="flex items-center flex-wrap justify-between mb-6">
        <h2 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-white ">
          {title}
        </h2>

        <div className="flex gap-2">
          {type !== 'application' ? (
            <div className="flex gap-2">
              {/* GENERATED BUTTON */}
              <button
                onClick={() => {
                  setDocState('generated');
                  const params = new URLSearchParams(window.location.search);
                  params.delete('q');
                  window.history.replaceState(
                    null,
                    '',
                    `?${params.toString()}`,
                  );
                }}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  docState === 'generated'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                Generated
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    docState === 'generated'
                      ? 'bg-white text-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  {generatedCount}
                </span>
              </button>

              {/* SAVED BUTTON */}
              <button
                onClick={() => {
                  setDocState('saved');
                  const params = new URLSearchParams(window.location.search);
                  params.set('q', 'saved');
                  window.history.replaceState(
                    null,
                    '',
                    `?${params.toString()}`,
                  );
                }}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  docState === 'saved'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                Saved
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    docState === 'saved'
                      ? 'bg-white text-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  {savedCount}
                </span>
              </button>
            </div>
          ) : (
            // APPLICATION BUTTON (Only Generated exists here)
            <button
              onClick={() => {
                setDocState('generated');
                const params = new URLSearchParams(window.location.search);
                params.delete('q');
                window.history.replaceState(null, '', `?${params.toString()}`);
              }}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                docState === 'generated'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Generated
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  docState === 'generated'
                    ? 'bg-white text-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                {generatedCount}
              </span>
            </button>
          )}
        </div>
        <div className="flex items-center">
          {/* Input + X inside */}
          <div className="relative">
            <input
              type="text"
              className="p-1 pr-8 border border-gray-300 dark:border-gray-600 rounded-md"
              placeholder="Search Doc"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
            />

            {/* X Button inside input */}
            {searchTerm && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setSearchTerm('');
                  setFinalSearchTerm('');
                }}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Button OUTSIDE */}
          <button
            className="ml-2 p-1 border border-gray-300 dark:border-gray-600 rounded-md"
            onClick={handleSearch}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Update conditional rendering logic */}
      {/* {items.length === 0 ? ( */}
      {listToRender?.length === 0 ? (
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
      ) : filteredItems?.length === 0 ? (
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
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
          {/* 5. Map over the filtered list */}
          {filteredItems
            .slice(0, visibleCount)
            .map((item: any, index: number) => (
              <DocumentCard
                key={item._id}
                index={index + 1}
                item={item}
                type={type}
                onDelete={onDelete}
                onDeleteSaved={onDeleteSaved}
                onRenameSaved={onRenameSaved}
                onRename={handleRenameDocument}
                onCopy={onCopy}
                onDownload={onDownload}
                copiedId={copiedId}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
                // onRenameSavedCv={handleRenameSavedCV}
                docState={docState}
              />
            ))}
        </div>
      )}

      {/* Show "See More" only if not all items are visible */}
      {visibleCount < filteredItems?.length && (
        <div className="text-center mt-4">
          <button
            onClick={() => setVisibleCount(visibleCount + 10)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            See More
          </button>
        </div>
      )}
    </div>
  );
};
