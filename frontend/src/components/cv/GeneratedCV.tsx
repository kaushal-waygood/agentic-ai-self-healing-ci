import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Save,
  CheckCircle,
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

// Mock data for initial rendering
const mockData = {
  ats: 92,
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

const EditableMaterial = ({
  content,
  setContent,
  isEditing,
  handleEditToggle,
  handleDownload,
  isDownloadingPdf,
  isDownloadingDocx,
}: any) => {
  const [isClient, setIsClient] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCopy = async () => {
    console.log('Handle Copy Invoked');
    console.log('Editor Ref:', editorRef);
    if (!editorRef.current) return;
    const textToCopy = editorRef.current.innerText;
    console.log('Text to Copy:', textToCopy);
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: 'Copied to Clipboard!',
        description: `content has been copied as plain text.`,
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({ variant: 'destructive', title: 'Copy Failed' });
    }
  };

  const handleContentChange = (e: any) => {
    // Don’t update state on every keystroke — only store locally
    if (editorRef.current) {
      editorRef.current._latest = e.currentTarget.innerHTML;
    }
  };

  // ✅ Sync final content when user stops editing
  const handleBlur = () => {
    if (editorRef.current?._latest) {
      setContent(editorRef.current._latest);
    }
  };

  return (
    <div className=" rounded-lg p-4 sm:p-6 border border-gray-200 shadow-md">
      {isEditing ? (
        isClient ? (
          // ✨ FIX: Changed <p> to <div> for better structure,
          // added onInput to update state, and suppressed a React warning.
          <div
            ref={editorRef}
            className="prose prose-sm md:prose max-w-none min-h-[200px] border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            contentEditable={true}
            onBlur={handleBlur}
            onInput={handleContentChange}
            dangerouslySetInnerHTML={{ __html: content }}
            suppressContentEditableWarning={true}
          />
        ) : (
          <div className="min-h-[200px] flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )
      ) : (
        <div
          ref={editorRef}
          className="prose prose-sm md:prose max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      {/* Action Bar (No changes needed here) */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleEditToggle}
              className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition transform hover:scale-105 text-white ${
                isEditing
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel Edit
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
              disabled={!content}
              className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition disabled:opacity-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleDownload('pdf')}
              disabled={!content || isDownloadingPdf}
              className="flex items-center px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition transform hover:scale-105 disabled:opacity-50"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              PDF
            </button>
            <button
              onClick={() => handleDownload('docx')}
              disabled={!content || isDownloadingDocx}
              className="flex items-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition transform hover:scale-105 disabled:opacity-50"
            >
              {isDownloadingDocx ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              DOCX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GeneratedCV = ({
  generatedCvOutput = mockData,
  handleInitiateSave = () => console.log('Save triggered'),
  handleRegenerate = () => console.log('Regenerate'),
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  useEffect(() => {
    if (generatedCvOutput && generatedCvOutput.cv) {
      setEditableContent(generatedCvOutput.cv);
    }
  }, [generatedCvOutput]);

  const getScoreBg = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 80) return 'from-blue-500 to-indigo-500';
    if (score >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditableContent(generatedCvOutput.cv);
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

  console.log('Editable Content:', generatedCvOutput);

  return (
    <div className="min-h-screen p-2 md:p-3 lg:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 md:mb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg">
          <div className="flex items-center gap-2 ">
            <div className="w-12 h-12  rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl text-white bg-transparent font-bold">
                CV Generated Successfully!
              </h2>
            </div>
            <div className="text-center  p-2 rounded-lg">
              <div className={`text-4xl font-bold bg-clip-text`}>
                {generatedCvOutput.atsScore}
              </div>
              <div className="text-xs ">ATS Score</div>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-3">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg text-white md:text-xl font-bold">
                  Your AI Generated CV
                </h3>
              </div>
              <button
                onClick={onSave}
                disabled={isSaving}
                className="w-full lg:w-auto bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl px-6 py-2.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-medium flex-shrink-0"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Final Version</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="p-2 md:p-3 lg:p-4">
            <EditableMaterial
              isEditing={isEditing}
              content={editableContent}
              setContent={setEditableContent}
              handleEditToggle={handleEditToggle}
              handleDownload={handleDownload}
              isDownloadingPdf={isDownloadingPdf}
              isDownloadingDocx={isDownloadingDocx}
            />
          </div>
        </div>
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
      </div>
    </div>
  );
};

export default GeneratedCV;
