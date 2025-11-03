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

interface EditableMaterialProps {
  content: string;
  setContent: (value: string) => void;
  title: string;
  isHtml?: boolean;
  className?: string;
  // handleSave?: (content: string) => Promise<void> | void;
}

const EditableMaterial: FC<EditableMaterialProps> = ({
  content,
  setContent,
  // handleSave,
  title,
  isHtml = false,
  className = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [originalContent, setOriginalContent] = useState<string>('');
  const [localContent, setLocalContent] = useState<string>(content);
  const [isInitialEditSetup, setIsInitialEditSetup] = useState(false);

  // Sync local content with prop content
  useEffect(() => {
    setLocalContent(content);
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

  // Handle initial setup when entering edit mode
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

  // Handle content changes without moving cursor
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

      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
    }
  };

  const handleEditToggle = async () => {
    console.log('handleEditToggle');

    if (isEditing) {
      // Save mode
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        console.log('newContent', newContent);

        if (newContent === originalContent) {
          console.log('No changes made');
          setIsEditing(false);
          return;
        }

        // Update both local and parent content
        setLocalContent(newContent);
        setContent(newContent);

        setLastSaved(new Date());
        setHasUnsavedChanges(false);
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

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col transition-all duration-300 ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'
      }`}
    >
      <header className="flex items-center justify-between p-4 border-b border-gray-200 flex-wrap gap-2">
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

      <main className="flex-grow p-6 overflow-y-auto">
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
              onClick={handleDownloadPdf}
              disabled={!isHtml || !localContent || isLoading}
              className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {!isLoading && <Download className="w-4 h-4 mr-2" />}
              PDF
            </button>
            <button
              onClick={handleDownloadDocx}
              disabled={!isHtml || !localContent || isLoading}
              className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {!isLoading && <FileText className="w-4 h-4 mr-2" />}
              DOCX
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EditableMaterial;
