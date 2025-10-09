import React, { useState, useRef } from 'react';
import {
  User,
  UploadCloud,
  PlusCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Clock,
} from 'lucide-react';

const SleekCvStep = ({
  mockUserProfile,
  handleCvContextSubmit,
  setWizardStep,
  selectedCvId,
  setSelectedCvId,
  isLoading,
  handleCVContext,
}: any) => {
  const cvFileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // **FIX**: This guard clause prevents the component from crashing if mockUserProfile is not ready.
  if (!mockUserProfile) {
    console.log('mockUserProfile not ready');
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-slate-600">Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="gradient-border hover-lift card-entrance">
          {/* Header */}
          <div className="p-8 pb-0">
            <div className="flex items-center justify-center mt-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <div className="w-8 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Provide Your CV
              </h2>
            </div>
            <p className="text-slate-600 ml-11">
              The AI needs your background to tailor it for the job.
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Saved CVs Section */}
            <div className="card-entrance staggered-1">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Select from Saved CVs
              </label>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50/50">
                {/* **FIX**: Using optional chaining for extra safety */}
                {mockUserProfile?.savedCvs?.length > 0 ? (
                  <div className="p-2 space-y-2">
                    {mockUserProfile.savedCvs.map((cv, index) => (
                      <label
                        key={cv.id}
                        className={`radio-card flex items-center gap-4 p-4 rounded-lg cursor-pointer border-2 border-transparent ${
                          selectedCvId === cv.id ? 'selected' : ''
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <input
                          type="radio"
                          value={cv.id}
                          checked={selectedCvId === cv.id}
                          onChange={(e) => setSelectedCvId(e.target.value)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            selectedCvId === cv.id
                              ? 'border-purple-500 bg-purple-500'
                              : 'border-slate-300'
                          }`}
                        >
                          {selectedCvId === cv.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-800">
                            {cv.name}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            Modified {cv.lastModified}
                          </div>
                        </div>
                        <FileText
                          className={`w-5 h-5 transition-colors ${
                            selectedCvId === cv.id
                              ? 'text-purple-500'
                              : 'text-slate-400'
                          }`}
                        />
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center p-8">
                    No saved CVs available.
                  </p>
                )}
              </div>

              <button
                className={`w-full mt-4 px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 ${
                  !selectedCvId || isLoading
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'btn-primary'
                }`}
                disabled={!selectedCvId || isLoading}
                onClick={() => handleCvContextSubmit('saved', selectedCvId)}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Use Selected CV
                  </div>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative card-entrance staggered-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider">
                <span className="bg-white px-4 text-slate-500">
                  Or Choose Alternative
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 card-entrance staggered-3">
              <button
                className="btn-outline h-32 flex flex-col items-center justify-center gap-3 rounded-xl text-slate-700 hover:text-purple-700"
                onClick={() => handleCvContextSubmit('profile')}
                disabled={isLoading}
              >
                <User className="w-8 h-8 text-blue-500" />
                <div className="text-center">
                  <div className="font-semibold">Use My Profile</div>
                  <div className="text-xs text-slate-500 mt-1">Quick setup</div>
                </div>
              </button>

              <button
                className="btn-outline h-32 flex flex-col items-center justify-center gap-3 rounded-xl text-slate-700 hover:text-purple-700 relative"
                onClick={() => cvFileInputRef.current?.click()}
                disabled={isLoading}
              >
                <UploadCloud className="w-8 h-8 text-blue-500" />
                <div className="text-center">
                  <div className="font-semibold">Upload CV File</div>
                  <div className="text-xs text-slate-500 mt-1">
                    PDF, DOC, DOCX
                  </div>
                </div>
                {uploadedFile && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </button>

              <button
                className="btn-outline h-32 flex flex-col items-center justify-center gap-3 rounded-xl text-slate-700 hover:text-purple-700"
                onClick={() => setWizardStep('createCv')}
                disabled={isLoading}
              >
                <PlusCircle className="w-8 h-8 text-blue-500" />
                <div className="text-center">
                  <div className="font-semibold">Create New CV</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Build from scratch
                  </div>
                </div>
              </button>

              <input
                type="file"
                ref={cvFileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadedFile(file);
                    handleCVContext(e);
                  }
                }}
                className="hidden"
                accept=".pdf,.doc,.docx"
              />
            </div>

            {uploadedFile && (
              <div className="card-entrance bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-800">
                      File ready to be processed!
                    </div>
                    <div className="text-sm text-green-600">
                      {uploadedFile.name}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 pt-0">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
              onClick={() => setWizardStep('job')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Job Details
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .card-entrance {
          animation: fadeInUp 0.6s ease-out;
        }
        .staggered-1 {
          animation-delay: 0.1s;
        }
        .staggered-2 {
          animation-delay: 0.2s;
        }
        .staggered-3 {
          animation-delay: 0.3s;
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        .gradient-border {
          position: relative;
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          border-radius: 1rem;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 2px;
          background: linear-gradient(145deg, #9333ea, #3b82f6, #06b6d4);
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: xor;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .gradient-border:hover::before {
          opacity: 1;
        }
        .btn-primary {
          background: linear-gradient(135deg, #9333ea, #3b82f6);
          box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);
          transition: all 0.3s ease;
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(147, 51, 234, 0.4);
        }
        .btn-outline {
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-outline:hover {
          border-color: #9333ea;
          background: linear-gradient(
            135deg,
            rgba(147, 51, 234, 0.05),
            rgba(59, 130, 246, 0.05)
          );
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(147, 51, 234, 0.15);
        }
        .radio-card {
          transition: all 0.3s ease;
          position: relative;
        }
        .radio-card:hover {
          background: linear-gradient(135deg, #fafafa, #f1f5f9);
          transform: translateX(4px);
        }
        .radio-card.selected {
          background: linear-gradient(
            135deg,
            rgba(147, 51, 234, 0.1),
            rgba(59, 130, 246, 0.1)
          );
          border-color: #9333ea;
        }
      `}</style>
    </div>
  );
};

export default SleekCvStep;
