'use client';

import React, { useEffect, useRef, useState, FC } from 'react';

import {
  Copy,
  Edit3,
  Download,
  Loader2,
  ShieldCheck,
  Save,
  FileText,
  Eye,
  Maximize2,
  Minimize2,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Assuming you have a toast hook
import apiInstance from '@/services/api';

interface EditableMaterialProps {
  content: string;
  setContent: (value: string) => void;
  title: string;
  editorId: string;
  isHtml?: boolean;
  className?: string;
  handleRegenerate: string;
}

const EditableMaterial: FC<EditableMaterialProps> = ({
  content,
  setContent,
  title,
  editorId,
  isHtml = false,
}: any) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canUsePremiumFeatures] = useState(true); // Mocked state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
    }
  }, [content]);

  useEffect(() => {
    if (
      isHtml &&
      editorRef.current &&
      editorRef.current.innerHTML !== content
    ) {
      editorRef.current.innerHTML = content;
    }
  }, [content, isHtml, isEditing]);

  const handleInput = () => {
    if (isHtml && editorRef.current) {
      setContent(editorRef.current.innerHTML);
      if (!hasUnsavedChanges) {
        setHasUnsavedChanges(true);
      }
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        toast({
          title: `${title} updated successfully!`,
          description: 'Your changes have been saved.',
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleCopy = async () => {
    if (!content) return;
    const textToCopy = editorRef.current?.innerText || content;
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: 'Copied!',
        description: `${title} content (as text) copied to clipboard.`,
      });
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({ variant: 'destructive', title: 'Failed to copy content' });
    }
  };

  // Download content as a PDF using an external API
  const handleDownloadPdf = async () => {
    const contentToPrint = editorRef.current;
    if (!contentToPrint) return;

    setIsLoading(true);
    toast({ title: 'Generating PDF...' });

    try {
      const response = await apiInstance.post(
        'students/pdf/generate-pdf',
        {
          html: contentToPrint.innerHTML,
          title: title,
        },
        {
          responseType: 'blob', // This tells axios to handle the response as a blob
        },
      );

      if (response.status !== 200) {
        throw new Error(`PDF generation failed: ${response.statusText}`);
      }

      // Create blob from response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `CareerPilot_${title.replace(/ /g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      toast({
        title: 'PDF downloaded successfully!',
        description: 'Your document is ready.',
      });
    } catch (error) {
      console.error('PDF Download Error:', error);
      toast({
        variant: 'destructive',
        title: 'PDF Download Failed',
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Download content as a DOCX file
  const handleDownloadDocx = () => {
    const htmlDocx = (window as any).htmlDocx;
    if (!htmlDocx) {
      toast({
        variant: 'destructive',
        title: 'DOCX Export Error',
        description: 'The html-docx-js library is not available.',
      });
      console.error(
        'html-docx-js is not loaded. Please add the script tag to your HTML file.',
      );
      return;
    }

    const contentToExport = editorRef.current;
    if (!contentToExport) return;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${contentToExport.innerHTML}</body></html>`;
    const docxBlob = htmlDocx.asBlob(html);

    const url = window.URL.createObjectURL(docxBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CareerPilot_${title.replace(/ /g, '_')}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    toast({ title: 'DOCX download started!' });
  };

  const formatText = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertTemplate = () => {
    const template = `
      <h2 style="color: #3b82f6; margin-bottom: 12px;">Key Achievements:</h2>
      <ul style="margin-bottom: 16px; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Achievement 1</li>
        <li style="margin-bottom: 8px;">Achievement 2</li>
      </ul>
    `;
    if (editorRef.current) {
      editorRef.current.innerHTML += template;
      handleInput();
    }
  };

  const handleRegenerate = async () => {
    const response = await apiInstance.post('/students/resume/regenerate', {
      jobContextString: JSON.stringify(content),
      previousCVJson: JSON.stringify(content),
    });
  };

  // --- RENDER ---
  return (
    <div
      className={`bg-gradient-to-br from-indigo-50 via-white to-purple-50 ${
        isFullscreen ? 'fixed inset-0 z-50 p-4 sm:p-6' : 'relative'
      }`}
    >
      <div
        className={`flex flex-col transition-all duration-300 ${
          isFullscreen ? 'h-full' : 'max-w-6xl mx-auto'
        }`}
      >
        {/* Header & Toolbar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-t-2xl border border-b-0 border-gray-200/80 shadow-lg z-10">
          {isEditing && (
            <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-8 py-2">
              <div className="flex items-center space-x-2 flex-wrap">
                <button
                  onClick={() => formatText('bold')}
                  className="p-2 text-sm font-bold hover:bg-gray-200 rounded"
                  title="Bold"
                >
                  B
                </button>
                <button
                  onClick={() => formatText('italic')}
                  className="p-2 text-sm italic hover:bg-gray-200 rounded"
                  title="Italic"
                >
                  I
                </button>
                <button
                  onClick={() => formatText('underline')}
                  className="p-2 text-sm underline hover:bg-gray-200 rounded"
                  title="Underline"
                >
                  U
                </button>
                <button
                  onClick={insertTemplate}
                  className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Template
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Unified Editor / Preview Pane */}
        <div className="bg-white/60 backdrop-blur-sm border-x border-gray-200/80 p-4 sm:p-8 flex-grow">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                {isEditing ? (
                  <Edit3 className="w-5 h-5 mr-2 text-indigo-500" />
                ) : (
                  <Eye className="w-5 h-5 mr-2 text-purple-500" />
                )}
                {isEditing ? 'Editing Content' : 'Content Preview'}
              </h3>
              <p className="text-sm text-gray-500">
                {isEditing
                  ? "Click 'Save' when you are finished."
                  : "Click 'Edit' to make changes."}
              </p>
            </div>
            <div
              id={editorId}
              ref={editorRef}
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
              className={`flex-grow w-full border-2 rounded-xl bg-white p-6 overflow-y-auto text-left focus:outline-none min-h-[400px] ${
                isEditing
                  ? 'border-indigo-300 shadow-inner ring-4 ring-indigo-50'
                  : 'border-gray-200'
              }`}
              onInput={handleInput}
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-b-2xl border border-t-0 border-gray-200/80 shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleEditToggle}
                disabled={!content || isLoading}
                className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition transform hover:scale-105 ${
                  isEditing
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
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
                disabled={!content || isLoading}
                className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition disabled:opacity-50"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownloadPdf}
                disabled={!isHtml || !content || isLoading}
                className="flex items-center px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition transform hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                PDF
                {!canUsePremiumFeatures && (
                  <ShieldCheck className="ml-2 h-4 w-4 text-yellow-300" />
                )}
              </button>
              <button onClick={handleRegenerate}> Regenerate</button>
              <button
                onClick={handleDownloadDocx}
                disabled={!isHtml || !content || isLoading}
                className="flex items-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition transform hover:scale-105 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                DOCX
                {!canUsePremiumFeatures && (
                  <ShieldCheck className="ml-2 h-4 w-4 text-yellow-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditableMaterial;
