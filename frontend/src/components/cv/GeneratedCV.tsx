import React, { useEffect, useState } from 'react';
import { FileText, Sparkles, Loader2, X } from 'lucide-react';
import EditableMaterial from '../application/editable-material';
import TemplateSidebar, {
  ResumeTemplate,
} from '../application/applications/TemplateSidebar';
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

const GeneratedCV = ({
  generatedCvOutput = null,
  isNamingDialogDisplayed,
  setIsNamingDialogDisplayed,
  cvNameForSavingInput,
  setCvNameForSavingInput,
  confirmSaveNamedCv,
}: any) => {
  const [editableContent, setEditableContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] =
    useState<ResumeTemplate | null>(null);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  const cvData = generatedCvOutput;
  const atsScore = cvData?.atsScore ?? 0;

  useEffect(() => {
    if (cvData?.cv) {
      const content = typeof cvData.cv === 'object' ? cvData.cv.cv : cvData.cv;
      setEditableContent(content);
    }
  }, [cvData]);

  return (
    <div className="min-h-screen p-3">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between  bg-header-gradient-primary text-white ">
          <div className="flex flex-row gap-2 p-4">
            <FileText className=" w-6 h-6 " />
            <h2 className="text-xl font-bold flex-1 ">AI Generated CV</h2>
          </div>
          <div>
            {atsScore > 0 && (
              <div className="text-right px-2">
                <div className="text-3xl  font-bold"> {atsScore}</div>
                <div className="text-xs">ATS Score</div>
              </div>
            )}
          </div>
        </div>

        {cvData ? (
          <div className="flex">
            {/* Desktop Sidebar */}
            <div className="hidden h-[calc(100vh-100px)] lg:flex lg:flex-shrink-0">
              <TemplateSidebar
                activeTemplate={selectedTemplate}
                onSelect={setSelectedTemplate}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Mobile Template Trigger */}
              <div className="lg:hidden flex justify-end mb-2">
                <button
                  onClick={() => setIsTemplateOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Templates
                </button>
              </div>

              {/* 3. The Editable Material Component */}
              <EditableMaterial
                content={editableContent}
                setContent={setEditableContent}
                template={selectedTemplate}
                title="CV Content"
                type="resume"
                isHtml={true}
              />
            </div>
          </div>
        ) : (
          <div className="p-8 flex justify-center w-full">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        )}
      </div>

      {/* Mobile Template Drawer */}
      {isTemplateOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 lg:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
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

      {/* 4. Naming Dialog (If managed by Parent) */}
      {isNamingDialogDisplayed && (
        <AlertDialog
          open={isNamingDialogDisplayed}
          onOpenChange={setIsNamingDialogDisplayed}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Name Your CV</AlertDialogTitle>
              <AlertDialogDescription>
                Give this version a unique name (e.g., "Google Application").
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={cvNameForSavingInput}
              onChange={(e) => setCvNameForSavingInput(e.target.value)}
              placeholder="Enter CV name..."
              className="my-4"
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
