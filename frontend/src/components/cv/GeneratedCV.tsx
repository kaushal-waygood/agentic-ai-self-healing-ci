'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Save,
  Award,
  FileText,
  Sparkles,
  Clock,
  Edit3,
  Copy,
  Download,
  Loader2,
  X,
} from 'lucide-react';

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
import { Input } from '../ui/input';
import TemplateSidebar, {
  resumeTemplates,
} from '../application/applications/TemplateSidebar';

const GeneratedCV = ({
  generatedCvOutput = null,
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
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  const cvData = generatedCvOutput;

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

  const [selectedTemplate, setSelectedTemplate] = useState(resumeTemplates[0]);

  return (
    <div className="min-h-screen p-3">
      <div className="max-w-7xl mx-auto">
        {/* Main CV Content */}
        <div className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-lg overflow-hidden">
          {/* header  */}
          <div className="flex items-center gap-2 bg-header-gradient-primary text-white ">
            <div className="w-12 h-12  rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="h-7 w-7 " />
            </div>

            <div className="flex-1">
              <h2 className="text-lg  md:text-xl font-bold ">
                {cvData ? 'Your AI Generated CV' : 'Loading CV...'}
              </h2>
            </div>
            <div className="text-center p-2 rounded-lg">
              <div className={`text-4xl font-bold bg-clip-text`}>
                {atsScore}
              </div>
              <div className="text-xs ">ATS Score</div>
            </div>
          </div>
          {/* content  */}
          {cvData ? (
            // <div className="p-2 md:p-3 lg:p-4">
            //   <EditableMaterial
            //     isEditing={isEditing}
            //     content={
            //       typeof cvContent.cv === 'object' ? cvContent.cv : cvContent
            //     }
            //     title={'CV Content'}
            //     isHtml={true}
            //     setContent={setEditableContent}
            //     handleEditToggle={handleEditToggle}
            //     handleDownload={handleDownload}
            //     isDownloadingPdf={isDownloadingPdf}
            //     isDownloadingDocx={isDownloadingDocx}
            //     type="resume"
            //   />
            // </div>
            <div className="flex relative ">
              {/* Desktop Sidebar */}
              <div className="hidden h-[calc(100vh-140px)] lg:relative lg:flex lg:flex-shrink-0">
                <TemplateSidebar
                  activeTemplate={selectedTemplate}
                  onSelect={setSelectedTemplate}
                />
              </div>

              {/* Resume Content */}
              <div className="flex-1 p-2 md:p-4">
                <div className={selectedTemplate.className}>
                  {/* Mobile template toggle */}
                  <div className="lg:hidden flex justify-end mb-2">
                    <button
                      onClick={() => setIsTemplateOpen(true)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg
                         bg-primary text-white text-sm font-medium"
                    >
                      <Sparkles className="w-4 h-4" />
                      Templates
                    </button>
                  </div>

                  <EditableMaterial
                    isEditing={isEditing}
                    content={
                      typeof cvContent === 'object' ? cvContent.cv : cvContent
                    }
                    title="CV Content"
                    isHtml
                    setContent={setEditableContent}
                    handleEditToggle={handleEditToggle}
                    handleDownload={handleDownload}
                    isDownloadingPdf={isDownloadingPdf}
                    isDownloadingDocx={isDownloadingDocx}
                    type="resume"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}
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

      {isTemplateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl
      max-h-[80vh] overflow-y-auto p-4 animate-slide-up"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Choose Template</h3>
              <button onClick={() => setIsTemplateOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <TemplateSidebar
              activeTemplate={selectedTemplate}
              onSelect={(template) => {
                setSelectedTemplate(template);
                setIsTemplateOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedCV;
