import React, { useState } from 'react';
import {
  Save,
  Star,
  CheckCircle,
  Award,
  Target,
  FileText,
  Sparkles,
  BarChart3,
  ThumbsUp,
  Clock,
  Edit3,
  Copy,
  Download,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

// Mock EditableMaterial component
const EditableMaterial = ({ content, isHtml }) => (
  <div className="bg-white rounded-lg p-6 border border-red-800">
    {isHtml ? (
      <div
        className="prose prose-sm md:prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    ) : (
      <div className="whitespace-pre-wrap">{content}</div>
    )}
    {/* Action Bar */}
    <div className="bg-white/80 backdrop-blur-sm rounded-b-2xl border border-t-0 border-gray-200/80 shadow-lg p- sm:p-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            // onClick={handleEditToggle}
            // disabled={!content || isLoading}
            className="flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition transform hover:scale-105 bg-green-500 hover:bg-green-600 text-white"
          >
            <>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </>
          </button>
          <button
            // onClick={handleCopy}
            // disabled={!content || isLoading}
            className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition disabled:opacity-50"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button
            // onClick={handleDownloadPdf}
            // disabled={!isHtml || !content || isLoading}
            className="flex items-center px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition transform hover:scale-105 disabled:opacity-50"
          >
            {/* (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )  */}
            <Download className="w-4 h-4 mr-2" />
            PDF
            {/* {<ShieldCheck className="ml-2 h-4 w-4 text-yellow-300" />} */}
          </button>
          <button
            // onClick={handleDownloadDocx}
            // disabled={!isHtml || !content || isLoading}
            className="flex items-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition transform hover:scale-105 disabled:opacity-50"
          >
            {/* (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )  */}
            <Download className="w-4 h-4 mr-2" />
            DOCX
            {/* {<ShieldCheck className="ml-2 h-4 w-4 text-yellow-300" />} */}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Mock data for demo
const mockData = {
  atsScore: 92,
  jobMatch: 94,
  keywordMatch: 88,
  formatScore: 95,
  atsScoreReasoning:
    'Your CV demonstrates excellent alignment with the job requirements. Strong keyword optimization and professional formatting make it highly ATS-friendly.',
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
  generatedCvOutput = mockData,
  handleInitiateSave = () => console.log('Save'),
  setCurrentCvContent = () => {},
  handleRegenerate = () => console.log('Regenerate'),
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-500';
    if (score >= 80) return 'from-blue-500 to-indigo-500';
    if (score >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="min-h-screen  p-2 md:p-3 lg:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Success Banner */}
        <div className="mb-3 md:mb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-1 md:p-2 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-6 w-6 md:h-7 md:w-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg md:text-xl font-bold mb-1">
                CV Generated Successfully!
              </h2>
              {/* <p className="text-sm md:text-base text-green-100">
                Your AI-optimized CV is ready for review and customization.
              </p> */}
            </div>
            <div className="text-center">
              <div
                className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${getScoreBg(
                  generatedCvOutput.atsScore,
                )} bg-clip-text  `}
              >
                {generatedCvOutput.atsScore}
              </div>
              <div className=" text-xs md:text-sm">ATS Score / 100</div>
            </div>
            {/* <div className="text-left sm:text-right w-full sm:w-auto">
              <div className="text-xs md:text-sm text-green-100">
                Generated at
              </div>
              <div className="text-sm md:text-base font-medium">
                {new Date().toLocaleTimeString()}
              </div>
            </div> */}
          </div>
        </div>

        <div className="flex flex-col gap-4 md:gap-4">
          {/* Analytics Cards - Fixed Grid Layout */}

          {/* CV Content Card */}
          <div className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-2 md:p-3">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg md:text-xl font-bold mb-1">
                      Your AI Generated CV
                    </h3>
                    {/* <p className="text-xs md:text-sm text-indigo-100">
                      Review and customize your optimized CV below
                    </p> */}
                  </div>
                </div>
                <button
                  onClick={handleInitiateSave}
                  disabled={isSaving}
                  className="w-full lg:w-auto bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl px-4 py-2 md:px-6 md:py-2.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-medium flex-shrink-0"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Final</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-2 md:p-3 lg:p-4">
              <EditableMaterial
                editorId="cv-live-editor"
                title="CV"
                content={generatedCvOutput.cv}
                setContent={setCurrentCvContent}
                handleRegenerate={handleRegenerate}
                isHtml
              />
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-6 md:mt-8 bg-white/60 backdrop-blur-xl border border-gray-200 rounded-2xl p-2 md:p-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
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
