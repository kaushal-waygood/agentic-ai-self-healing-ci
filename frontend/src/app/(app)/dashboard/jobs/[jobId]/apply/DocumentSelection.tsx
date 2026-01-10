import React from 'react';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Circle,
  ArrowRight,
  Upload,
  MapPin,
  Briefcase,
  DollarSign,
} from 'lucide-react';

// --- Sub-component for Job Badges ---
const Badge = ({ children, icon: Icon, color = 'gray' }: any) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 border border-${color}-200 mr-2 mb-2`}
  >
    {Icon && <Icon className="w-3 h-3 mr-1" />}
    {children}
  </span>
);

// --- Refined Tabs ---
const SelectionTabs = ({
  label,
  choice,
  setChoice,
  hasSaved,
  required,
}: any) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
    <label className="text-sm font-semibold text-gray-800">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="bg-gray-100 p-1 rounded-xl flex text-xs font-bold">
      <button
        onClick={() => hasSaved && setChoice('saved')}
        disabled={!hasSaved}
        className={`px-4 py-1.5 rounded-lg transition-all duration-200 ${
          choice === 'saved'
            ? 'bg-white text-purple-700 shadow-sm'
            : 'text-gray-500'
        } ${
          !hasSaved ? 'opacity-40 cursor-not-allowed' : 'hover:text-purple-600'
        }`}
      >
        Use Saved
      </button>
      <button
        onClick={() => setChoice('upload')}
        className={`px-4 py-1.5 rounded-lg transition-all duration-200 ${
          choice === 'upload'
            ? 'bg-white text-purple-700 shadow-sm'
            : 'text-gray-500 hover:text-purple-600'
        }`}
      >
        Upload New
      </button>
    </div>
  </div>
);

export const DocumentSelection = ({
  resume,
  resumeChoice,
  setResumeChoice,
  selectedSavedResumeId,
  setSelectedSavedResumeId,
  cvFile,
  cvError,
  handleFileChange,
  setCvFile,
  setCvError,
  job,
  coverLetter, // Object containing saved cover letters
  selectedSavedClId, // New prop to track CL selection
  setSelectedSavedClId, // New prop to set CL selection
  savedCoverLetterUrl,
  coverLetterChoice,
  setCoverLetterChoice,
  clFile,
  clError,
  setClFile,
  setClError,
  onNext,
}: any) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="border-b border-gray-100 pb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Step 1: Documents
        </h2>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-purple-900">{job?.title}</h3>
          <p className="text-gray-600 font-medium">{job?.company}</p>
          <div className="flex flex-wrap pt-1">
            {job?.location && (
              <Badge icon={MapPin} color="blue">
                {job.location.city}, {job.location.country}
              </Badge>
            )}
            {job?.salary?.min && (
              <Badge icon={DollarSign} color="green">
                {job.salary.currency}
                {job.salary.min.toLocaleString()} -{' '}
                {job.salary.max.toLocaleString()}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="border-2 border-gray-100 p-4 rounded-xl">
        <h3 className="text-lg font-semibold mb-2">Job Description</h3>
        <p dangerouslySetInnerHTML={{ __html: job?.description }} />
      </div>

      {/* Resume Section */}
      <div className="space-y-4">
        <SelectionTabs
          label="Resume / CV"
          choice={resumeChoice}
          setChoice={setResumeChoice}
          hasSaved={resume?.html?.length > 0}
          required={job?.resumeRequired}
        />

        {resumeChoice === 'saved' ? (
          <div className="grid gap-3">
            {resume?.html?.map((item: any) => (
              <div
                key={item._id}
                onClick={() => {
                  setSelectedSavedResumeId(item._id);
                  setCvError(null);
                }}
                className={`flex items-center p-4 bg-white border-2 rounded-xl cursor-pointer transition-all ${
                  selectedSavedResumeId === item._id
                    ? 'border-purple-500 bg-purple-50/30 ring-4 ring-purple-50'
                    : 'border-gray-100 hover:border-purple-200'
                }`}
              >
                {selectedSavedResumeId === item._id ? (
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                <div className="ml-4">
                  <p
                    className={`text-sm font-semibold ${
                      selectedSavedResumeId === item._id
                        ? 'text-purple-900'
                        : 'text-gray-700'
                    }`}
                  >
                    {item.htmlCVTitle || 'Untitled Resume'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <label
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
              cvFile
                ? 'border-green-400 bg-green-50/30'
                : 'border-gray-300 hover:border-purple-400'
            }`}
          >
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileChange(e, setCvFile, setCvError)}
            />
            <Upload
              className={`w-8 h-8 mb-2 ${
                cvFile ? 'text-green-500' : 'text-gray-400'
              }`}
            />
            <p className="text-sm font-medium text-gray-700">
              {cvFile ? cvFile.name : 'Click to upload resume'}
            </p>
          </label>
        )}
        {cvError && (
          <p className="text-xs text-red-500 flex items-center mt-1">
            <AlertCircle className="w-3 h-3 mr-1" /> {cvError}
          </p>
        )}
      </div>

      {/* Cover Letter Section */}
      <div className="pt-6 border-t border-gray-100 space-y-4">
        <SelectionTabs
          label="Cover Letter (Optional)"
          choice={coverLetterChoice}
          setChoice={setCoverLetterChoice}
          hasSaved={coverLetter?.html?.length > 0}
        />

        {coverLetterChoice === 'saved' ? (
          <div className="grid gap-3">
            {coverLetter?.html?.map((item: any) => (
              <div
                key={item._id}
                onClick={() => {
                  setSelectedSavedClId(item._id);
                  setClError(null);
                }}
                className={`flex items-center p-4 bg-white border-2 rounded-xl cursor-pointer transition-all ${
                  selectedSavedClId === item._id
                    ? 'border-blue-500 bg-blue-50/30 ring-4 ring-blue-50'
                    : 'border-gray-100 hover:border-blue-200'
                }`}
              >
                {selectedSavedClId === item._id ? (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
                <div className="ml-4 flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      selectedSavedClId === item._id
                        ? 'text-blue-900'
                        : 'text-gray-700'
                    }`}
                  >
                    {item.coverLetterTitle || 'Untitled Cover Letter'}
                  </p>
                </div>
                <FileText
                  className={`w-4 h-4 ${
                    selectedSavedClId === item._id
                      ? 'text-blue-400'
                      : 'text-gray-300'
                  }`}
                />
              </div>
            ))}
          </div>
        ) : (
          <label
            className={`flex items-center p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-all ${
              clFile ? 'border-green-400 bg-green-50/30' : ''
            }`}
          >
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileChange(e, setClFile, setClError)}
            />
            <Upload className="w-5 h-5 text-gray-400 mr-3" />
            <span className="text-sm font-medium text-gray-600 truncate">
              {clFile ? clFile.name : 'Upload cover letter'}
            </span>
          </label>
        )}
        {clError && (
          <p className="text-xs text-red-500 flex items-center mt-1">
            <AlertCircle className="w-3 h-3 mr-1" /> {clError}
          </p>
        )}
      </div>

      {/* Submit Action */}
      <button
        onClick={onNext}
        className="group w-full flex items-center justify-center rounded-2xl px-6 py-4 text-white font-bold bg-gray-900 hover:bg-purple-700 transition-all duration-300 shadow-xl shadow-gray-200 hover:shadow-purple-200"
      >
        Continue to Questions
        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
