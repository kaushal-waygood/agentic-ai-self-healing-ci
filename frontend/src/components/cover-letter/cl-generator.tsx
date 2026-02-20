import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Loader2,
  UploadCloud,
  FileText,
  Calendar,
  Check,
  ChevronDown,
  Star,
  Clock,
} from 'lucide-react';
import apiInstance from '@/services/api';
import { Loader } from '../Loader';

const ClGenerator = ({
  selectedSavedCvId,
  setSelectedSavedCvId,
  mockUserProfile,
  handleSetCvContext,
  handleUseActiveProfileCv,
  fileInputRef,
  handleFileUpload,
  isLoading,
  loadingMessage,
  setWizardStep,
}: any) => {
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

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                <Check className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline ml-2 text-sm font-medium text-green-600">
                Job Details
              </span>
            </div>
            <div className="w-16 h-0.5 bg-blue-200"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="hidden sm:inline ml-2 text-sm font-medium text-blue-600">
                CV Context
              </span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="hidden sm:inline ml-2 text-sm font-medium text-gray-500">
                Generate
              </span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="p-2 bg-header-gradient-primary px-8 text-white">
            <h2 className="text-xl ">CV Context Selection</h2>
            <p className="text-blue-100">
              Choose the CV the AI should reference for generating your cover
              letter
            </p>
          </div>

          {/* Content */}
          <div className="sm:p-8 p-4 space-y-4">
            {/* Saved CVs Section */}
            <div className="space-y-4">
              <div className="flex flex-row flex-wrap justify-between text-sm  font-medium mb-2">
                <label className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-500" />
                  Select From Saved CVs
                </label>
                <p>Total CVs: {stats.cvsCount}</p>
                {/* render CV list */}
              </div>

              {loading ? (
                <Loader message="Fetching saved CVs" />
              ) : (
                <div>
                  {cvs?.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {cvs?.map((cv: any) => (
                        <div
                          key={cv._id}
                          className={`group relative overflow-hidden rounded-lg border-2 transition-all duration-300 cursor-pointer transform  ${
                            selectedSavedCvId === cv._id
                              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                          }`}
                          onClick={() => {
                            setSelectedSavedCvId(cv._id);
                            // setExpandedCv(expandedCv === cv._id ? null : cv._id);
                          }}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                                    selectedSavedCvId === cv._id
                                      ? 'border-blue-500 bg-blue-500'
                                      : 'border-gray-300 group-hover:border-blue-400'
                                  }`}
                                >
                                  {selectedSavedCvId === cv._id && (
                                    <div className="w-full h-full bg-white rounded-full scale-50"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 text-sm sm:text-lg">
                                    {cv.htmlCVTitle || 'Untitled CV'}
                                  </h4>
                                  <div className="flex items-center mt-1">
                                    <span className="text-sm text-gray-500 flex items-center">
                                      <Clock className="w-4 h-4 mr-1.5" />

                                      {new Date(cv.updatedAt).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedCv(
                                    expandedCv === cv._id ? null : cv._id,
                                  );
                                }}
                                className="text-gray-400  hover:bg-gray-50  flex items-center hover:text-gray-600 transition-colors"
                              >
                                <p className="text-sm text-gray-600 flex items-center">
                                  <Star className="w-4 h-4 mr-2" />
                                  Ats Score:{' '}
                                  <span className="ml-1 font-medium">
                                    {cv.ats}
                                  </span>
                                </p>
                                <ChevronDown
                                  className={`w-6 h-6 transition-transform  ${
                                    expandedCv === cv._id ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>
                            </div>

                            {expandedCv === cv._id && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600 flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Created:{' '}
                                  <span className="ml-1 font-medium">
                                    {new Date(cv.createdAt).toLocaleDateString(
                                      'en-US',
                                      {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      },
                                    )}
                                  </span>
                                </p>
                                <p className="text-sm text-gray-600 flex items-center">
                                  <Star className="w-4 h-4 mr-2" />
                                  Ats Score:{' '}
                                  <span className="ml-1 font-medium">
                                    {cv.ats}
                                  </span>
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  This CV will be used as the context for AI
                                  generation.
                                </p>
                              </div>
                            )}
                          </div>

                          {selectedSavedCvId === cv._id && (
                            <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-blue-500">
                              <Check className="absolute -top-4 -right-3 w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center p-8">
                      No saved CVs available.
                    </p>
                  )}
                </div>
              )}

              {/* {selectedSavedCvId && (
                <button
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  onClick={() =>
                    handleSetCvContext('saved', {
                      value:
                        cvs.find((c) => c._id === selectedSavedCvId)
                          ?.htmlContent || '',
                      name:
                        cvs.find((c) => c._id === selectedSavedCvId)?.name ||
                        '',
                    })
                  }
                >
                  Use Selected CV
                </button>
              )} */}

              {selectedSavedCvId && (
                <button
                  className="w-full bg-buttonPrimary text-white py-3 px-6 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  onClick={() => {
                    const foundCv = cvs.find(
                      (c: any) => c._id === selectedSavedCvId,
                    );

                    if (!foundCv) {
                      console.error('Could not find CV with that ID!');
                      // Optionally, show a toast error here
                      return;
                    }

                    // --- THIS IS THE FIX ---
                    handleSetCvContext('saved', {
                      value: foundCv._id || '', // Use 'html'
                      name: foundCv.htmlCVTitle || '', // Use 'htmlCVTitle'
                      id: foundCv._id, // Pass the ID as well
                    });
                  }}
                >
                  Use Selected CV
                </button>
              )}
            </div>

            {/* Separator */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  or choose alternative
                </span>
              </div>
            </div>

            {/* Alternative Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Active Profile CV */}
              <button
                className="group p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-300 text-left"
                onClick={handleUseActiveProfileCv}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center transition-colors">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Active Profile CV
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Use your current profile information
                    </p>
                  </div>
                </div>
              </button>

              {/* Upload New CV */}
              <div className="relative">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.png,.jpg"
                  disabled={isLoading}
                />
                <div
                  className={`group p-6 border-2 border-dashed rounded-lg transition-all duration-300 text-left ${
                    isLoading
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        isLoading
                          ? 'bg-blue-200'
                          : 'bg-blue-100 group-hover:bg-blue-200'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      ) : (
                        <UploadCloud className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {isLoading && loadingMessage
                          ? loadingMessage
                          : 'Upload New CV'}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {isLoading
                          ? 'Please wait...'
                          : 'PDF, DOC, DOCX, PNG, JPG'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 flex justify-between items-center">
            <button
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              onClick={() => setWizardStep('job')}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Job Details</span>
            </button>

            <div className="text-sm text-gray-500">Step 2 of 3</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClGenerator;
