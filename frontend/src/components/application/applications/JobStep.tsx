'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  UploadCloud,
  List,
  ClipboardPaste,
  Briefcase,
  UploadCloudIcon,
  Sparkles,
  ChevronsRight,
  CheckCircle2,
  Zap,
  DollarSign,
  MapPin,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import apiInstance from '@/services/api';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';

interface Job {
  _id: string;
  title: string;
  company: string;
  logo?: string;
  jobAddress: string;
  salary: {
    min: number;
    max: number;
    period: string;
  };
  jobTypes: string[];
}

interface JobCardProps {
  job: Job;
}

// Helper function to format the salary range
const formatSalary = (salary: JobDetails['salary']) => {
  if (!salary || (salary.min === 0 && salary.max === 0)) {
    return 'Not Disclosed';
  }
  const formatValue = (value: number) => `$${Math.round(value / 1000)}k`;
  const periodMap: { [key: string]: string } = {
    YEAR: 'yr',
    MONTH: 'mo',
    HOUR: 'hr',
  };

  return `${formatValue(salary.min)} - ${formatValue(salary.max)} / ${
    periodMap[salary.period] || 'yr'
  }`;
};
export const JobCard = ({ job: savedJob }: JobCardProps) => {
  const { job } = savedJob;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="w-full bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg p-4 transition-all duration-500 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4 relative z-10">
        {/* Company Logo with enhanced animation */}
        <div
          className="hidden
    sm:flex flex-shrink-0 w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 border-2 border-white"
        >
          {job.logo ? (
            <img
              src={job.logo}
              alt={`${job.company} logo`}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {job.company?.charAt(0)}
            </span>
          )}
        </div>

        {/* Job Details */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate mb-1">
            {job.company}
          </p>
          <p className="font-semibold text-gray-900">
            {job.title.length > 45 ? job.title.slice(0, 35) + '…' : job.title}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {job.location?.city && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-gray-100">
                <MapPin className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-gray-700">
                  {job.location.city}
                </span>
              </div>
            )}

            {job.salary && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-green-100">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-700">
                  {formatSalary(job.salary)}
                </span>
              </div>
            )}

            {job.jobTypes && job.jobTypes.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-blue-100">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-700 capitalize">
                  {job.jobTypes[0].toLowerCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
interface JobListing {
  _id: string;
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

export function JobStep({
  isLoading,
  loadingMessage,
  jobListings = [],
  handleJobContextSubmit,
}: JobStepProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'select' | 'upload'>(
    'paste',
  );
  const [pastedJobDesc, setPastedJobDesc] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const jobDescFileInputRef = useRef<HTMLInputElement>(null);
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const response = await apiInstance.get('/students/jobs/saved-all');
        setSavedJobs(response.data.jobs);
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
      }
    };

    fetchSavedJobs();
  }, []);

  // ✅ Added: Character tracking logic (non-breaking)
  const charCount = pastedJobDesc.trim().length;
  const charProgress = Math.min((charCount / 200) * 100, 100);

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 relative">
          <div className="inline-block relative ">
            <div className="absolute inset-0 "></div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl bg-headingTextPrimary bg-clip-text text-transparent relative z-10 mb-3">
              Application Wizard
            </h1>
          </div>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Simplify your job application process with our intuitive
            step-by-step
          </p>
        </div>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-pink-500/10 rounded-lg overflow-hidden">
          <CardHeader className="bg-header-gradient-primary text-white relative overflow-hidden p-2">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg border border-white/30">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold">
                    Step 1: Provide Job Context
                  </CardTitle>
                  <p className="text-white/80 text-sm mt-1">
                    Choose your preferred method below
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-2 md:p-3">
            {/* Tabs */}
            <div className="grid grid-cols-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-1.5 mb-4 shadow-inner">
              {[
                { key: 'paste', label: 'Paste JD', icon: ClipboardPaste },
                { key: 'select', label: 'Saved Job', icon: List },
                { key: 'upload', label: 'Upload', icon: UploadCloudIcon },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() =>
                    setActiveTab(tab.key as 'paste' | 'select' | 'upload')
                  }
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg transition-all duration-500 ${
                    activeTab === tab.key
                      ? 'bg-tabPrimary text-white shadow-md scale-[1.02]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div>
              {/* ✅ Paste Tab Enhanced */}
              {activeTab === 'paste' && (
                <div className="space-y-4">
                  <div className="relative group">
                    <textarea
                      placeholder="✨ Paste the full job description here... Include requirements, responsibilities, and company culture for best results."
                      className={`w-full min-h-[280px] p-6 pr-16 border-2 rounded-lg resize-none focus:ring-4 transition-all duration-500  ${
                        charCount < 200
                          ? ''
                          : 'border-green-300 hover:border-green-400 ring-green-50'
                      }`}
                      value={pastedJobDesc}
                      onChange={(e) => setPastedJobDesc(e.target.value)}
                    />

                    {/* Progress bar */}
                    {charCount > 0 && (
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              charCount >= 200
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500'
                            }`}
                            style={{ width: `${charProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Character Counter */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                          charCount < 200 ? 'text-red-700' : ' text-green-700 '
                        }`}
                      >
                        {charCount} / 200 characters
                      </div>
                      {charCount >= 200 && (
                        <div className="flex items-center gap-1.5 text-green-600 animate-in fade-in slide-in-from-left duration-500">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            Ready to generate!
                          </span>
                        </div>
                      )}
                    </div>

                    {charCount < 200 && charCount > 0 && (
                      <span className="text-sm text-orange-600 font-medium animate-pulse">
                        {200 - charCount} more characters needed
                      </span>
                    )}
                  </div>

                  {/* Generate Button */}
                  <div className="flex flex-col gap-4">
                    <Button
                      className={`h-16 text-lg font-bold rounded-lg transition-all duration-500 transform hover:scale-[1.02] active:scale-95 shadow-xl ${
                        charCount >= 200 && !isLoading
                          ? 'text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={() =>
                        handleJobContextSubmit('paste', pastedJobDesc)
                      }
                      disabled={charCount < 200 || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-3 h-6 w-6" />
                          <span className="animate-pulse">
                            Analyzing Job Description...
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-3 h-6 w-6 animate-pulse" />
                          Generate My Cover Letter
                          <ChevronsRight className="ml-3 h-6 w-6" />
                        </>
                      )}
                    </Button>
                    <div className="flex items-start gap-3  p-2 rounded-lg border-2 border-purple-100 shadow-sm">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg flex-shrink-0">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 ">
                          Pro Tips for Best Results:
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Include job requirements, key responsibilities,
                          required skills, and company culture. The more
                          detailed the job description, the better your cover
                          letter will be optimized!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Existing Select Tab (unchanged) */}
              {activeTab === 'select' && (
                <div
                  value="select"
                  className="space-y-6 animate-in fade-in duration-500"
                >
                  {savedJobs.length > 0 ? (
                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                      {savedJobs.map((job: any) => (
                        <div
                          key={job.job._id}
                          onClick={() => {
                            handleJobContextSubmit('select', job.job._id);
                          }}
                          className=""
                        >
                          <JobCard job={job} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-2xl opacity-30 animate-pulse"></div>
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mx-auto flex items-center justify-center shadow-2xl relative z-10 transform hover:scale-110 transition-transform duration-300">
                          <Briefcase className="h-12 w-12 text-white" />
                        </div>
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        No Saved Jobs Yet
                      </h3>
                      <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
                        Start saving jobs you're interested in, and they'll
                        appear here for quick cover letter generation!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ✅ Existing Upload Tab (unchanged) */}
              {activeTab === 'upload' && (
                <div className="text-center p-10">
                  <button
                    onClick={() => jobDescFileInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-full min-h-[280px] bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold text-md hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading && loadingMessage ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 text-purple-600 animate-spin" />
                        {loadingMessage}
                      </>
                    ) : (
                      <>
                        <UploadCloud className="mr-2 h-5 w-5 text-purple-500" />
                        Upload Job Description File
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
                  <p className="text-xs text-slate-500 text-center mt-2">
                    PDF, PNG, JPG, DOCX, and TXT are supported.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
