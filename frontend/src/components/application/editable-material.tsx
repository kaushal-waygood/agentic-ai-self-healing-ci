'use client';

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
  setContent: (value: string) => void; // Make sure this prop is defined
  title: string;
  isHtml?: boolean;
  className?: string;
  handleSave?: (content: string) => Promise<void> | void;
}

const EditableMaterial: FC<EditableMaterialProps> = ({
  content,
  setContent, // Make sure this is destructured from props
  handleSave,
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

    if (isEditing) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
      placeCaretAtEnd(editorRef.current);
      return;
    }

    if (!isEditing && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [isEditing, content]);

  useEffect(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
    }
  }, [content]);

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
    if (editorRef.current) {
      if (!hasUnsavedChanges) {
        setHasUnsavedChanges(true);
      }
      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
      const newValue = editorRef.current.innerHTML;
      setContent(newValue); // This should work now
    }
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;

        if (newContent === originalContent) {
          setIsEditing(false);
          return;
        }

        // Update content in parent component
        setContent(newContent); // This should work now

        // Trigger parent save if available
        if (typeof handleSave === 'function') {
          await handleSave(newContent);
        }

        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        toast({
          title: `${title} updated successfully!`,
          description: 'Your changes have been saved.',
        });
      }

      setTimeout(() => setIsEditing(false), 0);
    } else {
      // Entering edit mode - save original content
      if (editorRef.current) {
        setOriginalContent(editorRef.current.innerHTML);
      } else {
        setOriginalContent(content);
      }
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
        { html: editorRef.current.innerHTML, title },
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

  const handleDownloadDocx = async () => {
    if (!editorRef.current) return;
    setIsLoading(true);
    toast({ title: 'Generating DOCX...' });
    try {
      const response = await apiInstance.post(
        '/students/docx/generate-docx',
        { html: editorRef.current.innerHTML, title },
        { responseType: 'blob' },
      );
      if (response.status !== 200)
        throw new Error('DOCX generation failed on the server.');

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      downloadFile(blob, `zobsai_${title.replace(/ /g, '_')}.docx`);
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
          dangerouslySetInnerHTML={!isEditing ? { __html: content } : undefined}
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
                  if (editorRef.current) {
                    editorRef.current.innerHTML = originalContent;
                  }
                  setContent(originalContent); // This should work now
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
              disabled={!content || isLoading}
              className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium text-sm transition disabled:opacity-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Text
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={!isHtml || !content || isLoading}
              className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {!isLoading && <Download className="w-4 h-4 mr-2" />}
              PDF
            </button>
            <button
              onClick={handleDownloadDocx}
              disabled={!isHtml || !content || isLoading}
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
