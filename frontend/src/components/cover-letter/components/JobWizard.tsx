'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getAllSavedJobs } from '@/services/api/student';
import {
  Briefcase,
  ChevronsRight,
  FileSignature,
  Loader2,
  Sparkles,
  Target,
  User,
  Zap,
  CheckCircle2,
  MapPin,
  DollarSign,
  FileText,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import apiInstance from '@/services/api';

// Define the structure of the job object for type safety
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
      className=" bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg p-4 transition-all duration-500 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4 relative z-10">
        {/* Company Logo with enhanced animation */}
        <div
          className=" hidden
    sm:flex flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 border-2 border-white"
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
          {/* <h3 className="text-xl font-bold text-gray-900 truncate mb-3 group-hover:text-purple-600 transition-colors duration-300">
            {job.title  }
          </h3> */}
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

const JobWizard = ({
  isLoading,
  pastedJobDescription,
  setPastedJobDescription,
  enteredJobTitle,
  handleSetJobContext,
  setEnteredJobTitle,
}: any) => {
  const [activeTab, setActiveTab] = useState('paste');
  const [savedJobs, setSavedJobs] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const tabData = [
    {
      value: 'paste',
      icon: FileSignature,
      label: 'Paste JD',
      // description: 'Full job description',
      gradient: 'tabPrimary',
    },
    {
      value: 'select',
      icon: Briefcase,
      label: 'Saved Job',
      // description: 'Choose from saved',
      gradient: 'tabPrimary',
    },
    {
      value: 'title',
      icon: User,
      label: 'Job Title',
      // description: 'Quick setup',
      gradient: 'tabPrimary',
    },
  ];

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        setLoading(true);
        const response = await apiInstance.get(
          '/students/jobs/events?type=SAVED',
        );
        setSavedJobs(response.data.jobs);
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  const charCount = pastedJobDescription.trim().length;
  const charProgress = Math.min((charCount / 200) * 100, 100);

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8  ">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-4 relative">
          <div className="inline-block relative ">
            <div className="absolute inset-0 "></div>
            <h1 className="text-2xl uppercase font-semibold sm:text-3xl md:text-4xl bg-headingTextPrimary text-foreground bg-clip-text text-transparent relative z-10">
              AI Cover Letter Generator
            </h1>
          </div>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Transform your Cover Letter with AI-powered insights tailored to
            your dream jobddsfs
          </p>
        </div>

        <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-pink-500/10 rounded-lg overflow-hidden">
          {/* Enhanced Animated Header */}
          <CardHeader className="bg-header-gradient-primary text-white relative overflow-hidden p-2">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg border border-white/30">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semoibold">
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
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* Enhanced Tabs List */}
              <TabsList className="grid grid-cols-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-1.5 mb-4 h-auto shadow-inner">
                {tabData.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.value;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={`flex flex-row items-center gap-2 p-4 rounded-lg transition-all duration-500 ${
                        isActive
                          ? `bg-${tab.gradient} text-white shadow-xl scale-105 transform`
                          : 'hover:bg-white/80 hover:scale-102 transform'
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 transition-transform duration-300 ${
                          isActive ? 'scale-110' : ''
                        }`}
                      />
                      <div className="text-center">
                        <div
                          className={`text-sm font-medium mb-0.5 ${
                            isActive ? 'text-white' : 'text-gray-600'
                          }`}
                        >
                          {tab.label}
                        </div>
                        <div
                          className={`text-xs ${
                            isActive ? 'text-white/90' : 'text-gray-500'
                          }`}
                        >
                          {tab.description}
                        </div>
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Enhanced Paste Tab */}
              <TabsContent
                value="paste"
                className="space-y-6 animate-in fade-in duration-500"
              >
                <div className="space-y-4">
                  <div className="relative group">
                    <Textarea
                      placeholder="✨ Paste the full job description here... Include requirements, responsibilities, and company culture for best results."
                      className={`min-h-[280px] border-2 rounded-lg p-6 pr-16 focus:ring-4 resize-none transition-all duration-500 bg-gradient-to-br from-gray-50 to-white shadow-inner ${
                        isFocused
                          ? ''
                          : charCount < 200
                          ? 'border-gray-300 hover:border-gray-400'
                          : 'border-green-300 hover:border-green-400 ring-green-50'
                      }`}
                      value={pastedJobDescription}
                      onChange={(e) => setPastedJobDescription(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                    />

                    {/* Progress indicator */}
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

                  {/* Enhanced Character Counter */}
                  <div className="flex  flex-wrap justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                          charCount < 200 ? 'text-red-700 ' : 'text-green-700 '
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

                    <Button
                      className={`h-16 text-lg  font-bold rounded-lg transition-all duration-500 transform hover:scale-[1.02] active:scale-95 shadow-xl ${
                        charCount >= 200 && !isLoading
                          ? 'hover:shadow-2xl hover:shadow-pink-500/50 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={() => handleSetJobContext('paste')}
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
                          <Sparkles className=" h-6 w-6 animate-pulse" />
                          Generate My Cover Letter
                          <ChevronsRight className=" h-6 w-6" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Enhanced Select Tab */}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                  {/* <Loader2 className="w-6 h-6 animate-spin mb-2 text-purple-500" /> */}
                  <div>
                    <img
                      src="/logo.png"
                      alt=""
                      className="w-10 h-10 animate-bounce"
                    />
                  </div>

                  <p>Fetching saved Jobs...</p>
                </div>
              ) : (
                <TabsContent
                  value="select"
                  className="space-y-6 animate-in fade-in duration-500"
                >
                  {savedJobs.length > 0 ? (
                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                      {savedJobs.map((job: any) => (
                        <div
                          key={job.job._id}
                          onClick={() =>
                            handleSetJobContext('select', job.job._id)
                          }
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
                </TabsContent>
              )}

              {/* Enhanced Title Tab */}
              <TabsContent
                value="title"
                className="space-y-6 animate-in fade-in duration-500"
              >
                {/* <div className="space-y-4">
                  <div className="flex items-center justify-end">
                    <div className="">
                      <Input
                        placeholder="e.g., Senior Software Engineer, Product Manager..."
                        className="h-16 border-2 border-gray-300 rounded-lg px-6 pr-16 text-md focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-500 group-hover:border-gray-400 bg-gradient-to-br from-gray-50 to-white shadow-inner"
                        value={enteredJobTitle}
                        onChange={(e) => setEnteredJobTitle(e.target.value)}
                      />
                      <div className="absolute top-1/2 right-5 transform -translate-y-1/2 transition-all duration-300 group-hover:scale-110">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                          <User
                            className={`h-6 w-6 ${
                              enteredJobTitle
                                ? 'text-green-600'
                                : 'text-gray-400'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Button
                        className={` h-16 text-lg font-semibold rounded-lg transition-all duration-500 transform hover:scale-[1.02] active:scale-95  ${
                          enteredJobTitle && !isLoading
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-2xl hover:shadow-green-500/50 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={() => handleSetJobContext('title')}
                        disabled={!enteredJobTitle || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="animate-spin mr-3 h-6 w-6" />
                            <span className="animate-pulse">
                              Preparing Optimization...
                            </span>
                          </>
                        ) : (
                          <>
                            Start Cover Letter Optimization
                            <ChevronsRight className=" " />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-100 shadow-sm">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">
                        Quick Setup Mode
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Enter your target job title and our AI will craft a
                        compelling cover letter based on common industry
                        requirements and expectations for that role.
                      </p>
                    </div>
                  </div>
                </div> */}
                <div className="space-y-4">
                  {/* Input + Button Row */}
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center">
                    {/* Input Wrapper */}
                    <div className="relative">
                      <Input
                        placeholder="e.g., Senior Software Engineer, Product Manager..."
                        className="h-14 md:h-16 border-2 border-gray-300 rounded-lg px-5 pr-14 text-md focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-gradient-to-br from-gray-50 to-white shadow-inner"
                        value={enteredJobTitle}
                        onChange={(e) => setEnteredJobTitle(e.target.value)}
                      />

                      {/* Icon */}
                      <div className="absolute top-1/2 right-4 -translate-y-1/2">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                          <User
                            className={`h-5 w-5 ${
                              enteredJobTitle
                                ? 'text-green-600'
                                : 'text-gray-400'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Button */}
                    <Button
                      className={`h-14 md:h-16 px-6 md:px-8 text-base md:text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95  whitespace-nowrap ${
                        enteredJobTitle && !isLoading
                          ? 'bg-buttonPrimary over:shadow-2xl hover:shadow-green-500/50 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }
      `}
                      onClick={() => handleSetJobContext('title')}
                      disabled={!enteredJobTitle || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5" />
                          Preparing...
                        </>
                      ) : (
                        <>
                          Start Cover Letter Optimization
                          <ChevronsRight className=" " />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Info Box */}
                  <div className="flex items-start gap-3  p-4 rounded-lg border-2 border-green-100">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 mb-1">
                        Quick Setup Mode
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Enter your target job title and our AI will craft a
                        compelling cover letter based on common industry
                        requirements and expectations for that role.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #ec4899);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7e22ce, #db2777);
        }
      `}</style>
    </div>
  );
};

export default JobWizard;
