'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FileText, Loader2 } from 'lucide-react';

import EditableMaterial from '../application/editable-material';
import { Input } from '../ui/input';
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

import { CV_TEMPLATES } from '@/utils/cvTemplate';

// ---------------------------------------------
// Types (stop using `any`, it bites later)
// ---------------------------------------------
interface GeneratedCVProps {
  generatedCvOutput: {
    cv: string;
    atsScore?: number;
    template?: string;
  } | null;
  handleInitiateSave: (payload: { html: string; template: string }) => void;
  isNamingDialogDisplayed: boolean;
  setIsNamingDialogDisplayed: (v: boolean) => void;
  cvNameForSavingInput: string;
  setCvNameForSavingInput: (v: string) => void;
  confirmSaveNamedCv: () => void;
}

// ---------------------------------------------
// Template list (single source of truth)
// ---------------------------------------------
const TEMPLATE_OPTIONS = Object.keys(CV_TEMPLATES);

// ---------------------------------------------
// Component
// ---------------------------------------------
const GeneratedCV: React.FC<GeneratedCVProps> = ({
  generatedCvOutput,
  handleInitiateSave,
  isNamingDialogDisplayed,
  setIsNamingDialogDisplayed,
  cvNameForSavingInput,
  setCvNameForSavingInput,
  confirmSaveNamedCv,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  // ---------------------------------------------
  // Initialize content + template
  // ---------------------------------------------
  useEffect(() => {
    if (!generatedCvOutput) return;

    setEditableContent(generatedCvOutput.cv || '');
    setSelectedTemplate(generatedCvOutput.template || 'classic');
  }, [generatedCvOutput]);

  // ---------------------------------------------
  // Final HTML = TEMPLATE CSS + CONTENT
  // ---------------------------------------------
  const finalHtml = useMemo(() => {
    const templateCss = CV_TEMPLATES[selectedTemplate] || CV_TEMPLATES.classic;

    return `
      ${templateCss}
      <div class="container">
        ${editableContent}
      </div>
    `;
  }, [selectedTemplate, editableContent]);

  // ---------------------------------------------
  // Download handler
  // ---------------------------------------------
  const handleDownload = async (format: 'pdf' | 'docx') => {
    const setLoading =
      format === 'pdf' ? setIsDownloadingPdf : setIsDownloadingDocx;
    setLoading(true);

    try {
      const API_BASE_URL = 'http://localhost:8080/api/v1/students';
      const endpoint =
        format === 'pdf'
          ? `${API_BASE_URL}/pdf/generate-pdf`
          : `${API_BASE_URL}/docx/generate-docx`;

      const response = await axios.post(
        endpoint,
        {
          html: finalHtml,
          title: 'Generated_CV',
        },
        { responseType: 'blob' },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `CareerPilot_CV.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // Save handler (persist template + content)
  // ---------------------------------------------
  const onSave = () => {
    if (isEditing) setIsEditing(false);

    handleInitiateSave({
      html: editableContent,
      template: selectedTemplate,
    });
  };

  if (!generatedCvOutput) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const atsScore = generatedCvOutput.atsScore ?? 0;

  return (
    <div className="min-h-screen p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 bg-header-gradient-primary text-white p-3 rounded-t-lg">
          <FileText className="w-6 h-6" />
          <h2 className="text-lg font-bold flex-1">Your AI Generated CV</h2>
          <div className="text-center">
            <div className="text-3xl font-bold">{atsScore}</div>
            <div className="text-xs">ATS Score</div>
          </div>
        </div>

        {/* Template Selector */}
        <div className="flex flex-wrap gap-2 p-3 bg-white border-b">
          {TEMPLATE_OPTIONS.map((tpl) => (
            <button
              key={tpl}
              onClick={() => setSelectedTemplate(tpl)}
              className={`px-3 py-1 text-sm rounded border transition ${
                selectedTemplate === tpl
                  ? 'bg-black text-white'
                  : 'bg-white text-black'
              }`}
            >
              {tpl}
            </button>
          ))}
        </div>

        {/* CV Content */}
        <div className="bg-white shadow rounded-b-lg p-4">
          <EditableMaterial
            isEditing={isEditing}
            content={finalHtml}
            isHtml
            title="CV Content"
            setContent={setEditableContent}
            handleEditToggle={() => setIsEditing((v) => !v)}
            handleDownload={handleDownload}
            isDownloadingPdf={isDownloadingPdf}
            isDownloadingDocx={isDownloadingDocx}
            onSave={onSave}
            type="resume"
          />
        </div>
      </div>

      {/* Naming Dialog */}
      {isNamingDialogDisplayed && (
        <AlertDialog
          open={isNamingDialogDisplayed}
          onOpenChange={setIsNamingDialogDisplayed}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Name Your CV</AlertDialogTitle>
              <AlertDialogDescription>
                Give this version a clear name.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Input
              value={cvNameForSavingInput}
              onChange={(e) => setCvNameForSavingInput(e.target.value)}
              placeholder="e.g. CV for Backend Engineer Role"
              className="my-4"
            />

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSaveNamedCv}>
                Save CV
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default GeneratedCV;
