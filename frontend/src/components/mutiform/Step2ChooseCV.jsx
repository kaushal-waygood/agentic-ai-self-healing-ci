import apiInstance from '@/services/api';
import {
  Briefcase,
  Loader2,
  User,
  ArrowLeft,
  Check,
  Clock,
  ChevronDown,
  Calendar,
  UploadCloud,
  Star,
  FileText,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const Step2ChooseCV = ({ nextStep, prevStep, handleFileChange, values }) => {
  const [dragActive, setDragActive] = useState(false);
  const [savedCVs] = useState([]); // Mock saved CVs array
  const [expandedCv, setExpandedCv] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [stats, setStats] = useState({ cvsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCvs = async () => {
      try {
        setLoading(true);
        const response = await apiInstance.get('/students/resume/saved');
        setCvs(response.data.html || []);
        setStats((prev) => ({
          ...prev,
          cvsCount: response.data.html?.length || 0,
        }));
      } catch (error) {
        console.error('Failed to fetch CVs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCvs();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Step Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-2xl p-8 mb-6 text-white shadow-xl overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center font-bold text-xl">
              2
            </div>
            <h2 className="text-3xl font-bold">Choose Your Master CV</h2>
          </div>
          <p className="text-white/90 ml-13">
            Select a base CV from your saved list or upload a new one. This is
            required.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100">
        {/* Saved CVs Section */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Select a Base CV *
          </label>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {cvs.length === 0 ? (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-2">
                  No saved CVs found
                </p>
                <p className="text-sm text-gray-500">
                  Please create or upload one below
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {cvs.map((cv, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      📄
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {cv.htmlCVTitle || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cv.createdAt}
                      </div>
                    </div>
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-blue-500 transition-colors"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-6 text-gray-500 font-semibold text-sm">
              OR
            </span>
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 font-semibold text-gray-700 text-sm">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Add a New CV
          </label>

          <div
            className={`relative border-3 border-dashed rounded-2xl p-8 transition-all duration-300 ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50 scale-105'
                : values.cvFile
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="cv-upload"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.png,.jpg"
              className="hidden"
            />

            <label htmlFor="cv-upload" className="cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-4">
                {values.cvFile ? (
                  <>
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-4xl animate-bounce-slow shadow-lg">
                      ✓
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-800 mb-1">
                        {values.cvFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(values.cvFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleFileChange({ target: { files: [] } });
                      }}
                      className="text-sm text-red-500 hover:text-red-600 font-medium underline"
                    >
                      Remove file
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-4xl animate-float">
                      📤
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-700 mb-2">
                        Click to browse or drag & drop
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports PDF, DOC, DOCX, PNG, JPG
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                      {['PDF', 'DOC', 'DOCX', 'PNG', 'JPG'].map((format) => (
                        <span
                          key={format}
                          className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Create CV Button */}
        <div className="pt-2">
          <button
            type="button"
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
          >
            <svg
              className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create a New CV with AI Assistant
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Next: Cover Letter
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
};

export default Step2ChooseCV;
