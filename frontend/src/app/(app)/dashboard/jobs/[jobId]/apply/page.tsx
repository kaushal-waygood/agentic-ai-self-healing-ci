'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { findSingleJobRequest } from '@/redux/reducers/jobReducer';
import { RootState } from '@/redux/rootReducer';
import {
  savedStudentCoverLetterRequest,
  savedStudentResumeRequest,
} from '@/redux/reducers/aiReducer';
import { getStudentDetailsRequest } from '@/redux/reducers/studentReducer';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Circle,
  Disc,
} from 'lucide-react';

const JobDetailPage = () => {
  const { jobId } = useParams();
  const dispatch = useDispatch();

  // Redux Data
  const { students } = useSelector((state: RootState) => state.student);
  const { job, loading, error } = useSelector((state: RootState) => state.jobs);
  const { resume, coverLetter } = useSelector((state: RootState) => state.ai);

  // Fallback for students data just in case, though we primarily use 'resume' state now for list
  const savedCoverLetterUrl = students?.[0]?.student?.coverLetterUrl;

  // Application State
  const [step, setStep] = useState<number>(1);

  // Document Selection State
  const [resumeChoice, setResumeChoice] = useState<'saved' | 'upload'>('saved');

  // Track specifically WHICH saved resume is selected (by ID or Index)
  const [selectedSavedResumeId, setSelectedSavedResumeId] = useState<
    string | null
  >(null);

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);

  const [coverLetterChoice, setCoverLetterChoice] = useState<
    'saved' | 'upload'
  >('saved');
  const [clFile, setClFile] = useState<File | null>(null);
  const [clError, setClError] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      dispatch(findSingleJobRequest(jobId as string));
    }
  }, [jobId, dispatch]);

  useEffect(() => {
    dispatch(getStudentDetailsRequest());
    dispatch(savedStudentResumeRequest());
    dispatch(savedStudentCoverLetterRequest());
  }, [dispatch]);

  // Set default selection if saved resumes exist
  useEffect(() => {
    if (resume?.html?.length > 0) {
      setResumeChoice('saved');
      // Optional: Auto-select the first one
      // setSelectedSavedResumeId(resume.html[0]._id);
    } else {
      setResumeChoice('upload');
    }

    if (!savedCoverLetterUrl) setCoverLetterChoice('upload');
  }, [resume, savedCoverLetterUrl]);

  // Handlers
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, DOC, or DOCX files are allowed.');
      setFile(null);
      return;
    }

    setError(null);
    setFile(file);
  };

  const validateAndProceed = () => {
    // Resume Validation
    if (job?.resumeRequired) {
      if (resumeChoice === 'upload' && !cvFile) {
        setCvError('Please upload a resume to proceed.');
        return;
      }
      if (resumeChoice === 'saved' && !selectedSavedResumeId) {
        setCvError('Please select one of your saved resumes.');
        return;
      }
    }
    // Clear transient errors if valid
    setCvError(null);
    setStep(2);
  };

  const getSelectedResumeDetails = () => {
    if (resumeChoice === 'saved') {
      return resume?.html?.find((r: any) => r._id === selectedSavedResumeId);
    }
    return null;
  };

  // Helper UI Components
  const SelectionTabs = ({
    label,
    choice,
    setChoice,
    hasSaved,
    required,
  }: any) => (
    <div className="flex items-center justify-between mb-3">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-medium">
        <button
          onClick={() => hasSaved && setChoice('saved')}
          disabled={!hasSaved}
          className={`px-3 py-1.5 rounded-md transition-all ${
            choice === 'saved'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-500'
          } ${!hasSaved ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Use Saved
        </button>
        <button
          onClick={() => setChoice('upload')}
          className={`px-3 py-1.5 rounded-md transition-all ${
            choice === 'upload'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-500'
          }`}
        >
          Upload New
        </button>
      </div>
    </div>
  );

  const FileSummary = ({ label, choice, savedItem, file, colorClass }: any) => (
    <div
      className={`p-3 rounded-lg border ${colorClass} flex items-center mb-3`}
    >
      <div className="bg-white p-2 rounded-full shadow-sm mr-3">
        <FileText className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">
          {choice === 'saved'
            ? savedItem?.htmlCVTitle || 'Saved File'
            : file?.name || 'No file uploaded'}
        </p>
      </div>
      {choice === 'saved' && savedItem && (
        <span className="text-xs text-green-600 bg-white px-2 py-1 rounded-md border border-green-100">
          Ready
        </span>
      )}
    </div>
  );

  // --- MAIN SWITCH LOGIC ---
  const renderApplicationStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Step 1: Documents
            </h2>

            {/* Resume Selection */}
            <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30">
              <SelectionTabs
                label="Resume / CV"
                choice={resumeChoice}
                setChoice={setResumeChoice}
                hasSaved={resume?.html?.length > 0}
                required={job?.resumeRequired}
              />

              {resumeChoice === 'saved' ? (
                <div className="space-y-2">
                  {resume?.html?.length > 0 ? (
                    resume.html.map((item: any) => (
                      <div
                        key={item._id}
                        onClick={() => {
                          setSelectedSavedResumeId(item._id);
                          setCvError(null);
                        }}
                        className={`flex items-center p-3 bg-white border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedSavedResumeId === item._id
                            ? 'border-purple-500 ring-1 ring-purple-500 bg-purple-50/50'
                            : 'border-purple-200 hover:border-purple-300'
                        }`}
                      >
                        <div
                          className={`mr-3 ${
                            selectedSavedResumeId === item._id
                              ? 'text-purple-600'
                              : 'text-gray-300'
                          }`}
                        >
                          {selectedSavedResumeId === item._id ? (
                            <Disc className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {item.htmlCVTitle || 'Untitled Resume'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created:{' '}
                            {new Date(
                              item.createdAt || Date.now(),
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic p-2">
                      No saved resumes found. Please upload one.
                    </div>
                  )}
                  {/* Validation Error Display for Saved Tab */}
                  {cvError && !selectedSavedResumeId && (
                    <p className="text-xs text-red-500 flex items-center mt-2">
                      <AlertCircle className="w-3 h-3 mr-1" /> {cvError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, setCvFile, setCvError)}
                    className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-white hover:file:opacity-90 border border-purple-200/50 rounded-lg bg-white"
                  />
                  {cvFile && (
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" /> {cvFile.name}
                    </p>
                  )}
                  {cvError && !cvFile && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" /> {cvError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Cover Letter Selection */}
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30">
              <SelectionTabs
                label="Cover Letter (Optional)"
                choice={coverLetterChoice}
                setChoice={setCoverLetterChoice}
                hasSaved={!!savedCoverLetterUrl}
              />
              {coverLetterChoice === 'saved' ? (
                <div className="flex items-center p-3 bg-white border border-blue-200 rounded-lg text-sm text-gray-700">
                  <FileText className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="flex-1 font-medium">
                    Saved Cover Letter Selected
                  </span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, setClFile, setClError)}
                    className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:opacity-90 border border-blue-200/50 rounded-lg bg-white"
                  />
                  {clFile && (
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" /> {clFile.name}
                    </p>
                  )}
                  {clError && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" /> {clError}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={validateAndProceed}
              className="w-full flex items-center justify-center rounded-xl px-6 py-3 text-white font-medium bg-gray-900 hover:bg-gray-800 transition shadow-lg"
            >
              Next Step <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Step 2: Review & Apply
            </h2>

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Documents to Send:
              </h3>

              <FileSummary
                label="Resume"
                choice={resumeChoice}
                savedItem={getSelectedResumeDetails()}
                file={cvFile}
                colorClass="border-purple-200 bg-purple-50"
              />

              <FileSummary
                label="Cover Letter"
                choice={coverLetterChoice}
                savedItem={{ htmlCVTitle: 'Default Cover Letter' }} // Placeholder for now since CL structure differs slightly in log
                file={clFile}
                colorClass="border-blue-200 bg-blue-50"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 flex items-center justify-center rounded-xl px-4 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>

              {job.applyMethod?.method === 'EMAIL' && (
                <a
                  href={`mailto:${job.applyMethod.email}`}
                  className="flex-[2] flex items-center justify-center rounded-xl px-6 py-3 text-white font-medium bg-gradient-to-r from-purple-600 to-purple-700 hover:opacity-90 transition shadow-lg shadow-purple-200"
                >
                  Confirm & Apply via Email
                </a>
              )}

              {job.applyMethod?.method === 'URL' && job.applyMethod.url && (
                <a
                  href={job.applyMethod.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-[2] flex items-center justify-center rounded-xl px-6 py-3 text-white font-medium bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:opacity-90 transition shadow-lg shadow-blue-200"
                >
                  Go to Company Website
                </a>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-24 text-gray-500">
        Loading job details…
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center py-24 text-red-500">
        Failed to load job.
      </div>
    );
  if (!job)
    return (
      <div className="flex justify-center py-24 text-gray-500">
        Job not found.
      </div>
    );

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Decorative Gradient Line */}
      <div className="h-1 w-full rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600" />

      {/* Header */}
      <div className="rounded-2xl bg-white/80 backdrop-blur border border-purple-200/50 p-6 space-y-3">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          {job.title}
        </h1>
        <p className="text-gray-600">
          {job.company} · {job.jobAddress}
        </p>
        {job.salary && (
          <p className="text-sm font-medium text-gray-700">
            ₹{job.salary.min.toLocaleString()} – ₹
            {job.salary.max.toLocaleString()} /{' '}
            {job.salary.period.toLowerCase()}
          </p>
        )}
      </div>

      {/* Description & Requirements */}
      <section className="rounded-2xl bg-white/80 backdrop-blur border border-white/20 p-6">
        <h2 className="text-xl font-semibold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Job Description
        </h2>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: job.description }}
        />
      </section>

      {/* Application Steps */}
      <section className="rounded-2xl bg-white/80 backdrop-blur border border-white/20 p-6">
        {renderApplicationStep()}
      </section>
    </div>
  );
};

export default JobDetailPage;
