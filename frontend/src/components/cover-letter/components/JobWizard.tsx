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
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { MapPin, DollarSign } from 'lucide-react';
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
  // Destructure the nested job object for cleaner access
  const { job } = savedJob;

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 transition-all duration-300 hover:border-blue-400 hover:shadow-lg">
      <div className="flex items-start gap-4">
        {/* Company Logo or Fallback */}
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          {job.logo ? (
            <img
              src={job.logo}
              alt={`${job.company} logo`}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <span className="text-xl font-bold text-gray-500">
              {/* FIXED: Removed trailing dot and access property correctly */}
              {job.company?.charAt(0)}
            </span>
          )}
        </div>

        {/* Job Details */}
        <div className="flex-1 min-w-0">
          {/* FIXED: Access nested property */}
          <p className="text-sm text-gray-500 truncate">{job.company}</p>
          <h3 className="text-lg font-bold text-gray-800 truncate">
            {job.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
            {/* FIXED: Access location from nested structure */}
            {job.location?.city && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{job.location.city}</span>
              </div>
            )}

            {/* FIXED: Access salary from nested structure */}
            {job.salary && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span>{formatSalary(job.salary)}</span>
              </div>
            )}

            {/* FIXED: Access jobTypes from nested structure */}
            {job.jobTypes && job.jobTypes.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="capitalize">
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

  const tabData = [
    {
      value: 'paste',
      icon: FileSignature,
      label: 'Paste JD',
      description: 'Full job description',
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      value: 'select',
      icon: Briefcase,
      label: 'Select Saved Jobs',
      description: 'Choose from saved',
      gradient: 'from-purple-500 to-pink-400',
    },
    {
      value: 'title',
      icon: User,
      label: 'Job Title',
      description: 'Quick setup',
      gradient: 'from-green-500 to-emerald-400',
    },
  ];

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

  return (
    <div className="p-3 sm:p-3 md:p-6 lg:p-2  ">
      <div className="max-w-7xl mx-auto">
        <div className="text-center m-4">
          <h1 className="text-3xl  bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
            Cover Letter Generator
          </h1>
          <p className="text-gray-600 text-md max-w-2xl mx-auto">
            Transform your Cover Letter with AI-powered insights tailored to
            your dream job
          </p>
        </div>

        <Card className=" bg-white/80s backdrop-blur-xl border-0 shadow-2xl shadow-blue-500/10 rounded-3xl  overflow-hidden">
          {/* Animated Header */}

          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden p-2">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 animate-pulse"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">
                  Step 1: Provide Job Context
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-2 md:p-1">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* Enhanced Tabs List */}
              <TabsList className="grid  grid-cols-3 bg-gray-100 rounded-2xl p-1 mb-1 h-auto">
                {tabData.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={`flex flex-row items-center gap-2 p-3 border rounded-xl transition-all duration-300 hover:scale-105  ${
                        activeTab === tab.value
                          ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                          : 'hover:bg-white/80 data-[state=active]:bg-white data-[state=active]:shadow-lg'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="text-center">
                        <div
                          className={`text-sm ${
                            activeTab === tab.value
                              ? 'text-white/80'
                              : 'text-gray-500'
                          }`}
                        >
                          {tab.description}
                        </div>
                      </div>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Paste Tab */}
              {/* <TabsContent value="paste" className="space-y-3">
                <div className="space-y-4">
                  <div className="relative group">
                    <Textarea
                      placeholder="Paste the full job description here... 
                "
                      className="min-h-[240px] border-2 border-gray-200 rounded-2xl p-4 focus:border-blue-500 focus:ring-0 resize-none transition-all duration-300 group-hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm"
                      value={pastedJobDescription}
                      onChange={(e) => setPastedJobDescription(e.target.value)}
                    />
                    <div className="absolute top-4 right-4 text-gray-400">
                      <FileSignature className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <Zap className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="font-medium">Pro tip:</span> Include
                    requirements, responsibilities, and company culture for best
                    results
                  </div>
                </div>

                <Button
                  className={`h-14  text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                    pastedJobDescription && !isLoading
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                  onClick={() => handleSetJobContext('paste')}
                  disabled={!pastedJobDescription || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Analyzing Job Description...
                    </>
                  ) : (
                    <>
                      <ChevronsRight className="mr-2 h-5 w-5" />
                      Generate My Cover Letter
                    </>
                  )}
                </Button>
              </TabsContent> */}
              {/* new code with 200 character counter and limits */}
              <TabsContent value="paste" className="space-y-3">
                <div className="space-y-4">
                  <div className="relative group">
                    <Textarea
                      placeholder="Paste the full job description here... "
                      className={`min-h-[240px] border-2 rounded-2xl p-4 focus:ring-0 resize-none transition-all duration-300 group-hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm ${
                        pastedJobDescription.trim().length < 200
                          ? 'border-gray-300 focus:border-red-400'
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                      value={pastedJobDescription}
                      onChange={(e) => setPastedJobDescription(e.target.value)}
                    />
                    <div className="absolute top-4 right-4 text-gray-400">
                      <FileSignature className="h-5 w-5" />
                    </div>
                  </div>

                  {/* ✅ Character Counter */}
                  <div className="flex justify-between items-center text-sm">
                    <span
                      className={`font-medium ${
                        pastedJobDescription.trim().length < 200
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      Characters: {pastedJobDescription.trim().length} / 200
                    </span>

                    {pastedJobDescription.trim().length < 200 && (
                      <span className="text-red-500">
                        Minimum 200 characters required.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center flex-wrap  justify-between gap-2 text-sm text-gray-700 p-2">
                    {/* ✅ Button disabled until 200+ characters */}
                    <Button
                      className={`h-14 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                        pastedJobDescription.trim().length >= 200 && !isLoading
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700  text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      onClick={() => handleSetJobContext('paste')}
                      disabled={
                        pastedJobDescription.trim().length < 200 || isLoading
                      }
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-5 w-5" />
                          Analyzing Job Description...
                        </>
                      ) : (
                        <>
                          <ChevronsRight className="mr-2 h-5 w-5" />
                          Generate My CV
                        </>
                      )}
                    </Button>

                    <div className="flex items-center gap-2 text-sm text-gray-700 bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <Zap className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="font-medium">Pro tip:</span> Include
                      requirements, responsibilities, and company culture for
                      best results.
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Select Tab */}
              <TabsContent value="select" className="space-y-6">
                {savedJobs.length > 0 ? (
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                    {savedJobs.map((job: any) => (
                      <div
                        key={job.job._id} // Corrected: Use _id for the key
                        onClick={() =>
                          handleSetJobContext('select', job.job._id)
                        }
                        className="cursor-pointer transition-transform transform"
                      >
                        <JobCard job={job} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                      <Briefcase className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      No Saved Jobs
                    </h3>
                    <p className="text-gray-600 text-lg max-w-md mx-auto">
                      You haven't saved any jobs yet. Saved jobs will appear
                      here for quick Cover letter generation.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Title Tab */}
              <TabsContent value="title" className="space-y-6">
                <div className=" flex flex-row gap-4 ">
                  <div className="relative group flex-1">
                    <Input
                      placeholder="e.g., Senior Software Engineer..."
                      className="h-14 border-2 border-gray-200 rounded-2xl px-6 text-lg focus:border-green-500 focus:ring-0 transition-all duration-300 group-hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm"
                      value={enteredJobTitle}
                      onChange={(e) => setEnteredJobTitle(e.target.value)}
                    />
                    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-400">
                      <User className="h-5 w-5" />
                    </div>
                  </div>
                  <Button
                    className={` h-14 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                      enteredJobTitle && !isLoading
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl text-white'
                        : 'bg-gray-300 text-gray-500'
                    }`}
                    onClick={() => handleSetJobContext('title')}
                    disabled={!enteredJobTitle || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        Preparing Optimization...
                      </>
                    ) : (
                      <>
                        <ChevronsRight className="mr-2 h-5 w-5" />
                        Start Optimization
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobWizard;
