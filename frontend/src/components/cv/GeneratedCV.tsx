import React, { useState, useEffect, useRef } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import EditableMaterial from '../application/editable-material';
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

// Mock data for initial rendering
const mockData = {
  atsScore: 92,
  cv: `<h2>John Doe</h2>
       <p><strong>Senior Software Engineer</strong></p>
       <p>Email: john@example.com | Phone: +1234567890</p>
       <h3>Professional Summary</h3>
       <p>Experienced software engineer with 8+ years in full-stack development, specializing in React, Node.js, and cloud technologies.</p>
       <h3>Experience</h3>
       <p><strong>Senior Software Engineer</strong> - Tech Corp (2020-Present)</p>
       <ul>
         <li>Led development of microservices architecture</li>
         <li>Mentored junior developers and conducted code reviews</li>
       </ul>`,
};

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

  const cvData = generatedCvOutput || mockData;

  useEffect(() => {
    if (cvData && cvData.cv) {
      setEditableContent(cvData.cv);
    }
  }, [cvData]);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditableContent(cvData.cv);
    }
    setIsEditing(!isEditing);
  };

  const handleDownload = async (format) => {
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
          html: editableContent,
          title: 'Generated_CV',
        },
        {
          responseType: 'blob',
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      let filename = `CareerPilot_Generated_CV.${format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading ${format}:`, error);
      alert(
        `Failed to download ${format.toUpperCase()}. Please check the console for details.`,
      );
    } finally {
      setLoading(false);
    }
  };

  const onSave = () => {
    if (isEditing) {
      setIsEditing(false);
    }

    handleInitiateSave(editableContent);
  };

  // Safe data extraction with fallbacks
  const atsScore = cvData?.atsScore || cvData?.ats || 0;
  const cvContent = cvData?.cv;

  return (
    <div className="min-h-screen p-2 md:p-3 lg:p-4">
      <div className="max-w-7xl mx-auto">
        {/* ATS Score Header */}
        <div className="mb-3 md:mb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg">
          <div className="flex items-center gap-2 ">
            <div className="w-12 h-12  rounded-xl flex items-center justify-center flex-shrink-0">
              <Award className="h-7 w-7 text-white" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl text-white bg-transparent font-bold">
                {cvData ? 'CV Generated Successfully!' : 'Loading CV...'}
              </h2>
            </div>
            <div className="text-center  p-2 rounded-lg">
              <div className={`text-4xl font-bold bg-clip-text`}>
                {atsScore}
              </div>
              <div className="text-xs ">ATS Score</div>
            </div>
          </div>
        </div>

        {/* Main CV Content */}
        <div className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-3">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg text-white md:text-xl font-bold">
                  {cvData ? 'Your AI Generated CV' : 'Loading CV...'}
                </h3>
              </div>
              {cvData && (
                <button
                  onClick={onSave}
                  className="w-full lg:w-auto bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl px-6 py-2.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-medium flex-shrink-0"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Final Version</span>
                </button>
              )}
            </div>
          </div>

          {cvData ? (
            <div className="p-2 md:p-3 lg:p-4">
              <EditableMaterial
                isEditing={isEditing}
                content={
                  typeof cvContent.cv === 'object' ? cvContent.cv : cvContent
                }
                isHtml={true}
                setContent={setEditableContent}
                handleEditToggle={handleEditToggle}
                handleDownload={handleDownload}
                isDownloadingPdf={isDownloadingPdf}
                isDownloadingDocx={isDownloadingDocx}
                type="resume"
              />
            </div>
          ) : (
            <div className="p-8 flex justify-center items-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        {/* Action Footer */}
        {cvData && (
          <div className="mt-6 md:mt-8 bg-white/60 backdrop-blur-xl border border-gray-200 rounded-2xl p-2 md:p-3">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm md:text-base font-semibold text-gray-900">
                    Ready to apply?
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Your CV is optimized and ready to impress employers
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button className="flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  <span>Save for Later</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all text-sm font-medium">
                  <Award className="h-4 w-4" />
                  <span>Start Applying</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isNamingDialogDisplayed && (
        <AlertDialog
          open={isNamingDialogDisplayed}
          onOpenChange={setIsNamingDialogDisplayed}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Name Your CV</AlertDialogTitle>
              <AlertDialogDescription>
                Give this version a unique name. E.g., "CV for Google PM Role".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              placeholder="Enter CV Name"
              value={cvNameForSavingInput}
              onChange={(e) => setCvNameForSavingInput(e.target.value)}
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
