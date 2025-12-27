import React, { useEffect, useRef, useState, FC } from 'react';
import {
  Copy,
  Edit3,
  Download,
  Loader2,
  Save,
  Eye,
  Maximize2,
  Minimize2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiInstance from '@/services/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Input } from '../ui/input';

interface EditableMaterialProps {
  content: string;
  setContent: (value: string) => void;
  title: string;
  isHtml?: boolean;
  className?: string;
  type?: 'resume' | 'coverletter'; // Add type prop to distinguish between resume and cover letter
  // handleSave?: (content: string) => Promise<void> | void;
}

const EditableMaterial: FC<EditableMaterialProps> = ({
  content,
  setContent,
  // handleSave,
  title,
  isHtml = false,
  className = '',
  type = 'resume', // Default to resume
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [loadingType, setLoadingType] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [originalContent, setOriginalContent] = useState<string>('');
  const [localContent, setLocalContent] = useState<string>(content);
  const [isInitialEditSetup, setIsInitialEditSetup] = useState(false);

  // Missing state variables
  const [isNamingDialogDisplayed, setIsNamingDialogDisplayed] = useState(false);
  const [cvNameForSavingInput, setCvNameForSavingInput] = useState('');
  const [hasChangesForFinalSave, setHasChangesForFinalSave] = useState(false);

  useEffect(() => {
    setLocalContent(content);
    // Reset final save changes flag when content prop changes from parent
    setHasChangesForFinalSave(false);
  }, [content]);

  const placeCaretAtEnd = (el: HTMLElement) => {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  useEffect(() => {
    if (!editorRef.current) return;

    if (isEditing && !isInitialEditSetup) {
      // Initial setup when entering edit mode
      if (editorRef.current.innerHTML !== localContent) {
        editorRef.current.innerHTML = localContent;
      }
      placeCaretAtEnd(editorRef.current);
      setIsInitialEditSetup(true);
    } else if (!isEditing) {
      // When not editing, always sync with current content
      editorRef.current.innerHTML = localContent;
      setIsInitialEditSetup(false);
    }
  }, [isEditing, localContent, isInitialEditSetup]);

  useEffect(() => {
    if (!editorRef.current || !isEditing || isInitialEditSetup) return;

    // Only update if content is different and we're not in initial setup
    if (editorRef.current.innerHTML !== localContent) {
      // Save current cursor position
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;

      // Update content
      editorRef.current.innerHTML = localContent;

      // Restore cursor position if it exists
      if (range && selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [localContent, isEditing, isInitialEditSetup]);

  useEffect(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
    }
  }, [localContent]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`,
        );
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleInput = () => {
    if (editorRef.current && isEditing) {
      const newValue = editorRef.current.innerHTML;
      setLocalContent(newValue);
      setHasUnsavedChanges(newValue !== originalContent);
      setHasChangesForFinalSave(newValue !== content); // Check against original prop content

      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      // Save mode
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;

        if (newContent === originalContent) {
          setIsEditing(false);
          return;
        }

        // Update both local and parent content
        setLocalContent(newContent);
        setContent(newContent);

        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        setHasChangesForFinalSave(newContent !== content); // Update final save flag

        toast({
          title: `${title} updated successfully!`,
          description: 'Your changes have been saved.',
        });

        // Exit edit mode after successful save
        setIsEditing(false);
      }
    } else {
      // Enter edit mode
      setOriginalContent(localContent);
      setIsEditing(true);
    }
  };

  const handleCopy = async () => {
    if (!editorRef.current) return;
    const textToCopy = editorRef.current.innerText;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: 'Copied to Clipboard!',
        description: `${title} content has been copied as plain text.`,
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

  const handleDownloadPdf = async () => {
    if (!editorRef.current) return;
    setIsLoading(true);
    toast({ title: 'Generating PDF...' });
    try {
      const response = await apiInstance.post(
        '/students/pdf/generate-pdf',
        {
          html: editorRef.current.innerHTML,
          title: title || 'document',
        },
        { responseType: 'blob' },
      );
      if (response.status !== 200)
        throw new Error('PDF generation failed on the server.');

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const safeTitle = (title || 'document').replace(/ /g, '_');
      downloadFile(blob, `zobsai_${safeTitle}.pdf`);
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

  const handleDownloadDocx = async () => {
    if (!editorRef.current) return;
    setIsLoading(true);
    toast({ title: 'Generating DOCX...' });
    try {
      const response = await apiInstance.post(
        '/students/docx/generate-docx',
        {
          html: editorRef.current.innerHTML,
          title: title || 'document',
        },
        { responseType: 'blob' },
      );
      if (response.status !== 200)
        throw new Error('DOCX generation failed on the server.');

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const safeTitle = (title || 'document').replace(/ /g, '_');
      downloadFile(blob, `zobsai_${safeTitle}.docx`);
      toast({ title: 'DOCX downloaded successfully!' });
    } catch (error) {
      console.error('DOCX Download Error:', error);
      toast({
        variant: 'destructive',
        title: 'DOCX Download Failed',
        description: 'An error occurred while generating the document.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatText = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    handleInput();
  };

  const insertTemplate = () => {
    const template = `
      <h2 style="color: #3b82f6; margin-bottom: 12px;">Key Achievements:</h2>
      <ul style="margin-bottom: 16px; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Achievement 1</li>
        <li style="margin-bottom: 8px;">Achievement 2</li>
      </ul>`;
    document.execCommand('insertHTML', false, template);
    editorRef.current?.focus();
    handleInput();
  };

  const getStatusIndicator = () => {
    if (hasUnsavedChanges) {
      return (
        <>
          <AlertCircle className="w-4 h-4 mr-1.5 text-yellow-500" /> Unsaved
          Changes
        </>
      );
    }
    if (lastSaved) {
      return (
        <>
          <CheckCircle className="w-4 h-4 mr-1.5 text-green-500" /> Saved at{' '}
          {lastSaved.toLocaleTimeString()}
        </>
      );
    }
    return (
      <>
        <CheckCircle className="w-4 h-4 mr-1.5 text-gray-400" /> Up to date
      </>
    );
  };

  // Helper function to get the appropriate API endpoint based on type
  const getSaveEndpoint = () => {
    return type === 'coverletter'
      ? '/students/letter/save/html'
      : '/students/resume/save/html';
  };

  // Helper function to get the appropriate success message based on type
  const getSaveSuccessMessage = (name: string) => {
    const documentType = type === 'coverletter' ? 'Cover Letter' : 'CV';
    return {
      title: `${documentType} Saved Successfully!`,
      description: `Your ${documentType.toLowerCase()} "${name}" has been saved.`,
    };
  };

  // Helper function to get dialog title based on type
  const getDialogTitle = () => {
    return type === 'coverletter' ? 'Name Your Cover Letter' : 'Name Your CV';
  };

  // Helper function to get dialog description based on type
  const getDialogDescription = () => {
    return type === 'coverletter'
      ? 'Give this version a unique name. E.g., "Cover Letter for Google PM Role".'
      : 'Give this version a unique name. E.g., "CV for Google PM Role".';
  };

  // Helper function to get button text based on type
  const getSaveButtonText = () => {
    return type === 'coverletter' ? 'Save Cover Letter' : 'Save CV';
  };

  const handleSaveDocument = async () => {
    if (!editorRef.current) return;

    // Show naming dialog instead of directly saving
    setIsNamingDialogDisplayed(true);
  };

  const confirmSaveNamedDocument = async () => {
    if (!editorRef.current) return;

    const html = editorRef.current.innerHTML;
    const documentName =
      cvNameForSavingInput.trim() ||
      `${title} - ${new Date().toLocaleDateString()}`;

    try {
      setIsLoading(true);
      const endpoint = getSaveEndpoint();
      const response = await apiInstance.post(endpoint, {
        html,
        title: documentName,
      });

      const { title: successTitle, description: successDescription } =
        getSaveSuccessMessage(documentName);
      toast({
        title: successTitle,
        description: successDescription,
      });

      // Reset dialog state and final save flag
      setIsNamingDialogDisplayed(false);
      setCvNameForSavingInput('');
      setHasChangesForFinalSave(false);
    } catch (error) {
      console.error('Error saving document:', error);
      const documentType = type === 'coverletter' ? 'cover letter' : 'CV';
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: `An error occurred while saving your ${documentType}.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col transition-all duration-300 ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'
      }`}
    >
      <header className="flex items-center justify-between border-b p p-2 border-gray-200 flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          {isEditing ? (
            <Edit3 className="w-5 h-5 mr-2 text-indigo-500" />
          ) : (
            <Eye className="w-5 h-5 mr-2 text-purple-500" />
          )}
          {title}
        </h3>
        {isEditing && (
          <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1 bg-gray-50 flex-wrap">
            <button
              onClick={() => formatText('bold')}
              className="p-2 font-bold hover:bg-gray-200 rounded"
              title="Bold"
            >
              B
            </button>
            <button
              onClick={() => formatText('italic')}
              className="p-2 italic hover:bg-gray-200 rounded"
              title="Italic"
            >
              I
            </button>
            <button
              onClick={() => formatText('underline')}
              className="p-2 underline hover:bg-gray-200 rounded"
              title="Underline"
            >
              U
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <button
              onClick={insertTemplate}
              className="flex items-center p-2 text-purple-700 rounded hover:bg-purple-100"
              title="Insert Template"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <button
            className={`p-2 rounded-lg border border-gray-200 flex items-center space-x-2 transition-all ${
              hasChangesForFinalSave
                ? 'text-gray-100 hover:bg-blue-700 bg-buttonPrimary'
                : 'text-gray-500 bg-gray-100 cursor-not-allowed'
            }`}
            onClick={handleSaveDocument}
            disabled={!hasChangesForFinalSave || isLoading}
            title={
              hasChangesForFinalSave
                ? `Save Final ${
                    type === 'coverletter' ? 'Cover Letter' : 'CV'
                  } Version`
                : 'No changes to save'
            }
          >
            <Save className="h-4 w-4" />
            <span>Save </span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-grow p-2 overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable={isEditing}
          onInput={handleInput}
          suppressContentEditableWarning={true}
          className={`prose max-w-none focus:outline-none transition-all ${
            isEditing
              ? 'bg-gray-50/50 p-4 rounded-md ring-2 ring-indigo-300'
              : ''
          }`}
          dangerouslySetInnerHTML={
            !isEditing ? { __html: localContent } : undefined
          }
        />
      </main>

      <footer className="p-4 border-t border-gray-200 bg-gray-50/80 rounded-b-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center">{getStatusIndicator()}</span>
            <span className="text-gray-400">|</span>
            <span>{wordCount} words</span>
            {hasChangesForFinalSave && (
              <>
                <span className="text-gray-400">|</span>
                <span className="text-yellow-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Ready for final save
                </span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2 flex-wrap justify-center gap-y-2">
            <button
              onClick={handleEditToggle}
              disabled={isLoading}
              className={`flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-transform hover:scale-105 ${
                isEditing
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              } disabled:opacity-50`}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </>
              )}
            </button>
            {isEditing && (
              <button
                onClick={() => {
                  setLocalContent(originalContent);
                  setContent(originalContent);
                  setIsEditing(false);
                  setHasUnsavedChanges(false);
                  setHasChangesForFinalSave(false);
                  toast({
                    title: 'Changes Reverted',
                    description: 'Your unsaved changes have been discarded.',
                  });
                }}
                className="flex items-center px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium text-sm transition"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Cancel
              </button>
            )}

            <button
              onClick={handleCopy}
              disabled={!localContent || isLoading}
              className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium text-sm transition disabled:opacity-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Text
            </button>

            <button
              onClick={async () => {
                setLoadingType('pdf');
                await handleDownloadPdf();
                setLoadingType(null);
              }}
              disabled={!isHtml || !localContent || loadingType === 'pdf'}
              className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50"
            >
              {loadingType === 'pdf' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              PDF
            </button>

            <button
              onClick={async () => {
                setLoadingType('docx');
                await handleDownloadDocx();
                setLoadingType(null);
              }}
              disabled={!isHtml || !localContent || loadingType === 'docx'}
              className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50"
            >
              {loadingType === 'docx' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              DOCX
            </button>
          </div>
        </div>
      </footer>

      {isNamingDialogDisplayed && (
        <AlertDialog
          open={isNamingDialogDisplayed}
          onOpenChange={setIsNamingDialogDisplayed}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{getDialogTitle()}</AlertDialogTitle>
              <AlertDialogDescription>
                {getDialogDescription()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              placeholder={`Enter ${
                type === 'coverletter' ? 'Cover Letter' : 'CV'
              } Name`}
              value={cvNameForSavingInput}
              onChange={(e) => setCvNameForSavingInput(e.target.value)}
              className="my-4"
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSaveNamedDocument}>
                {getSaveButtonText()}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default EditableMaterial;
