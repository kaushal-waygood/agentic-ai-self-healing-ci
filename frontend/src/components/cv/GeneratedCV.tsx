import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Sparkles, Loader2, X } from 'lucide-react';

import EditableMaterial from '../application/editable-material';
import TemplateSidebar, {
  ResumeTemplate,
} from '../application/applications/TemplateSidebar';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
} from '@radix-ui/react-alert-dialog';
import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Input } from '../ui/input';

const GeneratedCV = ({
  generatedCvOutput = null,
  handleInitiateSave,
  isNamingDialogDisplayed,
  setIsNamingDialogDisplayed,
  cvNameForSavingInput,
  setCvNameForSavingInput,
  confirmSaveNamedCv,
}: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ResumeTemplate | null>(null);

  const cvData = generatedCvOutput;

  useEffect(() => {
    if (cvData?.cv) {
      setEditableContent(cvData.cv);
    }
  }, [cvData]);

  const handleDownload = async (format: 'pdf' | 'docx') => {
    const setLoading =
      format === 'pdf' ? setIsDownloadingPdf : setIsDownloadingDocx;
    setLoading(true);

    try {
      const endpoint =
        format === 'pdf'
          ? '/students/pdf/generate-pdf'
          : '/students/docx/generate-docx';

      const response = await axios.post(
        endpoint,
        {
          html: editableContent,
          title: 'Generated_CV',
        },
        { responseType: 'blob' },
      );

      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CareerPilot_CV.${format}`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  const atsScore = cvData?.atsScore ?? 0;
  const cvContent = cvData?.cv;

  console.log('cvData', selectedTemplate);

  return (
    <div className="min-h-screen p-3">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="flex items-center gap-3 bg-header-gradient-primary text-white p-3">
          <FileText />
          <h2 className="text-xl font-bold flex-1">AI Generated CV</h2>
          <div className="text-right">
            <div className="text-3xl font-bold">{atsScore}</div>
            <div className="text-xs">ATS Score</div>
          </div>
        </div>

        {cvData ? (
          <div className="flex ">
            <div className="hidden h-[calc(100vh-100px)] lg:flex lg:flex-shrink-0">
              <TemplateSidebar
                activeTemplate={selectedTemplate}
                onSelect={setSelectedTemplate}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Inject template CSS */}
              {selectedTemplate?.style && (
                <style
                  dangerouslySetInnerHTML={{
                    __html: selectedTemplate.style,
                  }}
                />
              )}

              <div className="lg:hidden flex justify-end mb-2">
                <button
                  onClick={() => setIsTemplateOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm"
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
                template={selectedTemplate}
                title="CV Content"
                isHtml
                setContent={setEditableContent}
                handleDownload={handleDownload}
                isDownloadingPdf={isDownloadingPdf}
                isDownloadingDocx={isDownloadingDocx}
                type="resume"
              />
            </div>
          </div>
        ) : (
          <div className="p-8 flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        )}
      </div>

      {isTemplateOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 lg:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">Choose Template</h3>
              <button onClick={() => setIsTemplateOpen(false)}>
                <X />
              </button>
            </div>

            <TemplateSidebar
              activeTemplate={selectedTemplate}
              onSelect={(t) => {
                setSelectedTemplate(t);
                setIsTemplateOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {isNamingDialogDisplayed && (
        <AlertDialog
          open={isNamingDialogDisplayed}
          onOpenChange={setIsNamingDialogDisplayed}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Name Your CV</AlertDialogTitle>
              <AlertDialogDescription>
                Give this version a unique name
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Input
              value={cvNameForSavingInput}
              onChange={(e) => setCvNameForSavingInput(e.target.value)}
            />

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSaveNamedCv}>
                Save
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default GeneratedCV;
