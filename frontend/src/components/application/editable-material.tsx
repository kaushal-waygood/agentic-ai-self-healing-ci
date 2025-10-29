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
  FileText, // More appropriate for DOCX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Assuming a custom toast hook
import apiInstance from '@/services/api'; // Assuming a pre-configured axios instance

// Define the props interface correctly
interface EditableMaterialProps {
  content: string;
  setContent: (value: string) => void;
  title: string;
  isHtml?: boolean;
  className?: string;
}

const EditableMaterial: FC<EditableMaterialProps> = ({
  content,
  setContent,
  title,
  isHtml = false,
  className = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the main container for fullscreen
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For downloads
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Effect to sync the editor's content when the `content` prop changes from the parent,
  // but ONLY when not in editing mode to prevent overwriting the user's input.
  // useEffect(() => {
  //   if (
  //     editorRef.current &&
  //     !isEditing &&
  //     editorRef.current.innerHTML !== content
  //   ) {
  //     editorRef.current.innerHTML = content;
  //   }
  // }, [content, isEditing]);

  // --- add this helper somewhere near your other functions ---
  const placeCaretAtEnd = (el: HTMLElement) => {
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false); // move caret to end
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  useEffect(() => {
    if (!editorRef.current) return;

    // When entering edit mode, ensure the editor DOM has the latest content
    if (isEditing) {
      // If editor is empty or different, populate it from prop
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
      // place caret at end so user can start typing immediately
      placeCaretAtEnd(editorRef.current);
      return;
    }

    // When NOT editing: keep DOM in sync with `content` prop (but don't overwrite while editing)
    if (!isEditing && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [isEditing, content]);

  // Effect to calculate word count when content changes
  useEffect(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
    }
  }, [content]);

  // Handle native browser fullscreen changes (e.g., pressing ESC)
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
      // We don't need to call setContent on every input, which can be slow.
      // We'll read from the ref when saving, which improves performance.
      if (!hasUnsavedChanges) {
        setHasUnsavedChanges(true);
      }
      // Update word count live
      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
    }
  };

  // const handleEditToggle = () => {
  //   if (isEditing) {
  //     // --- Save Logic ---
  //     if (editorRef.current) {
  //       const newContent = editorRef.current.innerHTML;
  //       setContent(newContent); // Update parent state
  //       setLastSaved(new Date());
  //       setHasUnsavedChanges(false);
  //       toast({
  //         title: `${title} updated successfully!`,
  //         description: 'Your changes have been saved.',
  //       });
  //     }
  //   }
  //   // Toggle editing state
  //   setIsEditing(!isEditing);
  // };

  const handleEditToggle = () => {
    if (isEditing) {
      // --- Save Logic ---
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;

        // Immediately update parent & local states before exiting edit mode
        setContent(newContent);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);

        toast({
          title: `${title} updated successfully!`,
          description: 'Your changes have been saved.',
        });
      }

      // Delay exiting edit mode slightly to ensure parent state updates first
      setTimeout(() => setIsEditing(false), 0);
    } else {
      // Enter edit mode
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

  // Helper for triggering file downloads
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

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    toast({
      title: 'Regenerating content...',
      description: 'Please wait a moment.',
    });
    try {
      // NOTE: Adjust the payload to match your actual API specification.
      const response = await apiInstance.post(
        '/students/coverletter/regenerate',
        {
          currentContent: content,
        },
      );

      if (response.data && response.data.newContent) {
        setContent(response.data.newContent);
        // Directly update the editor to show the new content immediately
        if (editorRef.current) {
          editorRef.current.innerHTML = response.data.newContent;
        }
        toast({
          title: 'Content Regenerated!',
          description: 'The material has been updated.',
        });
      } else {
        throw new Error('Invalid response from server.');
      }
    } catch (error) {
      console.error('Regeneration failed:', error);
      toast({ variant: 'destructive', title: 'Regeneration Failed' });
    } finally {
      setIsRegenerating(false);
    }
  };

  // WARNING: `document.execCommand` is deprecated. For production, use a modern
  // rich-text editor library like TipTap, Slate.js, or React-Quill.
  const formatText = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    handleInput(); // Reflect changes immediately
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

  // Dynamic status indicator for the footer
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
      {/* --- Header and Toolbar --- */}
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
            onClick={handleRegenerate}
            disabled={isRegenerating || isLoading}
            className="flex items-center px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50"
          >
            {isRegenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Regenerate
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

      {/* --- Editor Content Area --- */}
      <main className="flex-grow p-6 overflow-y-auto">
        {/* <div
          ref={editorRef}
          contentEditable={isEditing}
          onInput={handleInput}
          suppressContentEditableWarning={true}
          className={`prose max-w-none focus:outline-none transition-all ${
            isEditing
              ? 'bg-gray-50/50 p-4 rounded-md ring-2 ring-indigo-300'
              : ''
          }`}
          dangerouslySetInnerHTML={{ __html: content }}
        /> */}

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
          // Only set innerHTML when not editing to prevent resets
          dangerouslySetInnerHTML={!isEditing ? { __html: content } : undefined}
        />
      </main>

      {/* --- Action Bar & Status Footer --- */}
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
              disabled={isLoading || isRegenerating}
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
            <button
              onClick={handleCopy}
              disabled={!content || isLoading || isRegenerating}
              className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium text-sm transition disabled:opacity-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Text
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={!isHtml || !content || isLoading || isRegenerating}
              className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {!isLoading && <Download className="w-4 h-4 mr-2" />}
              PDF
            </button>
            <button
              onClick={handleDownloadDocx}
              disabled={!isHtml || !content || isLoading || isRegenerating}
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
