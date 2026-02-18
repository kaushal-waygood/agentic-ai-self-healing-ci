'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Briefcase,
  CheckCircle,
  Loader,
  Zap,
  Star,
  Loader2,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import apiInstance from '@/services/api';

// Props interface based on your original component
interface GenerateStepProps {
  isLoading: boolean;
  jobContext: any;
  cvContext: any;
  clContext: any;
  handleGenerate: () => void;
  setWizardStep: (step: string) => void;
}

// This is the merged component that combines the UI from the generated code
// with the functionality from your original code.
export const GenerateStep = ({
  isLoading,
  jobContext,
  cvContext,
  clContext,
  handleGenerate,
  setWizardStep,
}: GenerateStepProps) => {
  const searchParams = useSearchParams();

  const jobId = searchParams.get('slug');

  const rawMode = searchParams.get('mode');
  const mode =
    rawMode === 'paste' || rawMode === 'upload' || rawMode === 'select'
      ? rawMode
      : null;

  const [jobDetail, setJobDetail] = useState<any>(null);
  const [jobLoading, setJobLoading] = useState(false);
  const getJobPositionLabel = () => {
    // 1️⃣ Saved Job (highest priority)
    if (jobId && jobDetail?.title) {
      return jobDetail.title;
    }

    // 2️⃣ Paste JD
    if (mode === 'paste') {
      return 'Pasted Job Description';
    }

    // 3️⃣ Upload JD
    if (mode === 'upload') {
      return 'Uploaded Job Description';
    }

    // 4️⃣ Fallback
    return 'Job Description';
  };

  useEffect(() => {
    if (!jobId) return;

    const fetchJobDetail = async () => {
      try {
        setJobLoading(true);
        const response = await apiInstance.get(`/jobs/job-desc/${jobId}`);
        setJobDetail(response.data.singleJob);
      } catch (error) {
        console.error('Failed to fetch job detail:', error);
      } finally {
        setJobLoading(false);
      }
    };

    fetchJobDetail();
  }, [jobId]);
  const contextItems = [
    {
      icon: Briefcase,
      label: 'Job Position',
      value: jobDetail?.title || 'Not specified',
      sublabel: jobContext?.company || 'Company not specified',
      color: 'from-purple-500 to-purple-600',
    },

    {
      icon: FileText,
      label: 'CV Source',
      value: cvContext?.name || 'No CV selected',
      // sublabel: `Using selected CV`,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Star,
      label: 'Cover Letter',
      value:
        clContext?.mode === 'skip'
          ? 'Generate from scratch'
          : `Based on ${clContext?.name}`,
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-2 sm:p-3 font-sans">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          Ready to Generate?
        </h2>
        <p className="text-slate-600 text-lg  mx-auto">
          We'll use the provided info to tailor your application documents with
          AI precision.
        </p>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mt-6">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
            <div className="w-8 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
        {/* Context Summary */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            Application Summary
          </h3>

          <div className="space-y-4">
            {contextItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="group flex items-start space-x-4 p-4 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100/50 hover:from-purple-50 hover:to-blue-50 transition-all duration-300 border border-slate-100 hover:border-purple-200"
                  style={{
                    animation: `slideInUp 0.6s ease-out ${
                      index * 150
                    }ms forwards`,
                    opacity: 0,
                  }}
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-700 text-sm uppercase tracking-wide mb-1">
                      {item.label}
                    </h4>
                    <p className="font-semibold text-slate-900 mb-1 truncate">
                      {item.value}
                    </p>
                    <p className="text-sm text-slate-500">{item.sublabel}</p>
                  </div>

                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Generate Section */}
        <div className="p-3 sm:p-4">
          <div className="flex flex-wrap  justify-between">
            <button
              type="button"
              onClick={() => setWizardStep('cl')}
              className="flex items-center space-x-2 px-6 py-3 text-slate-600 hover:text-slate-900 transition-colors duration-200 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back</span>
            </button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {isLoading ? (
                <div className="relative flex items-center justify-center space-x-3">
                  <Loader2 className="w-6 h-6 text-buttonPrimary animate-spin" />
                </div>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="group relative flex items-center justify-center p-4 bg-buttonPrimary text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-purple-500/25"
                >
                  <div className="relative flex items-center justify-center space-x-3">
                    <Zap className="w-6 h-6" />

                    <span>Tailor My Application</span>
                    <Sparkles className="w-6 h-6" />
                  </div>
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
