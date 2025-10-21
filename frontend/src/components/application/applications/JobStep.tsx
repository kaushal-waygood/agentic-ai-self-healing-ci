'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  UploadCloud,
  List,
  ClipboardPaste,
  Briefcase,
} from 'lucide-react';

interface JobListing {
  _id: string; // Use _id to match the database
  title: string;
  company: string;
}

type JobStepProps = {
  isLoading: boolean;
  loadingMessage: string;
  jobListings: JobListing[];
  handleJobContextSubmit: (
    mode: 'select' | 'paste' | 'upload',
    value: File | string,
  ) => void;
};

const OptionCard = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-lg">
    <div className="flex items-center mb-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center mr-4">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

export function JobStep({
  isLoading,
  loadingMessage,
  jobListings = [],
  handleJobContextSubmit,
}: JobStepProps) {
  const [pastedJobDesc, setPastedJobDesc] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const jobDescFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl shadow-sm">
            <Briefcase className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Step 1: The Job Description
          </h2>
          <p className="text-slate-600 text-lg max-w-md mx-auto">
            Start by providing the job you're applying for.
          </p>
        </div>

        <div className="space-y-6">
          <OptionCard title="Select a Saved Job" icon={List}>
            <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg bg-slate-50/50 p-2 border border-slate-200">
              {jobListings.length > 0 ? (
                jobListings.slice(0, 10).map((job) => (
                  <label
                    key={job._id}
                    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                      selectedJobId === job._id
                        ? 'bg-purple-50 border-purple-400 shadow-sm'
                        : 'bg-white border-transparent hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="job-selection"
                      value={job._id}
                      checked={selectedJobId === job._id}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-slate-300"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">
                        {job.title}
                      </span>
                      <span className="text-slate-600"> at {job.company}</span>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center p-4 text-slate-500">
                  No saved jobs found.
                </div>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => handleJobContextSubmit('select', selectedJobId)}
                disabled={!selectedJobId || isLoading}
                className="w-full p-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-xl font-bold text-md shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Use Selected Job
              </button>
            </motion.div>
          </OptionCard>

          <OptionCard title="Paste Job Details" icon={ClipboardPaste}>
            <textarea
              placeholder="Paste the full job description here..."
              className="w-full min-h-[150px] p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-shadow"
              value={pastedJobDesc}
              onChange={(e) => setPastedJobDesc(e.target.value)}
            />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => handleJobContextSubmit('paste', pastedJobDesc)}
                disabled={!pastedJobDesc || isLoading}
                className="w-full p-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-xl font-bold text-md shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Use Pasted Description
              </button>
            </motion.div>
          </OptionCard>

          <OptionCard title="Upload a File" icon={UploadCloud}>
            <button
              onClick={() => jobDescFileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full p-4 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold text-md hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && loadingMessage ? (
                <>
                  {' '}
                  <Loader2 className="mr-2 h-5 w-5 text-purple-600 animate-spin" />{' '}
                  {loadingMessage}{' '}
                </>
              ) : (
                <>
                  {' '}
                  <UploadCloud className="mr-2 h-5 w-5 text-purple-500" />{' '}
                  Upload Job Description File{' '}
                </>
              )}
            </button>
            <input
              type="file"
              ref={jobDescFileInputRef}
              onChange={(e) =>
                e.target.files?.[0] &&
                handleJobContextSubmit('upload', e.target.files[0])
              }
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"
            />
            <p className="text-xs text-slate-500 text-center">
              PDF, PNG, JPG, DOCX, and TXT are supported.
            </p>
          </OptionCard>
        </div>
      </div>
    </div>
  );
}
