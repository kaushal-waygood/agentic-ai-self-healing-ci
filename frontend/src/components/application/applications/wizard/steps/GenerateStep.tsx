'use client';

import React from 'react';
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
} from 'lucide-react';

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
  // We build the context items array using the props, similar to the generated code's approach.
  // This keeps the rendering logic clean.
  const contextItems = [
    {
      icon: Briefcase,
      label: 'Job Position',
      value: jobContext?.jobTitle || 'Not specified',
      sublabel: jobContext?.company || 'Company not specified',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: FileText,
      label: 'CV Source',
      value: cvContext?.name || 'No CV selected',
      sublabel: `Using selected CV`,
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Star,
      label: 'Cover Letter',
      value:
        clContext?.mode === 'skip'
          ? 'Generate from scratch'
          : `Based on ${clContext?.name}`,
      sublabel:
        clContext?.mode === 'skip'
          ? 'AI will create new content'
          : 'Using existing context',
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
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
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
                  className="group flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 hover:from-purple-50 hover:to-blue-50 transition-all duration-300 border border-slate-100 hover:border-purple-200"
                  style={{
                    animation: `slideInUp 0.6s ease-out ${
                      index * 150
                    }ms forwards`,
                    opacity: 0,
                  }}
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
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
          {isLoading ? (
            /* Loading State driven by the `isLoading` prop */
            <div className="text-center py-8 animate-fadeIn">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 animate-spin"
                  style={{ animationDuration: '2s' }}
                ></div>
                <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                  <Loader className="w-8 h-8 text-purple-600 animate-spin" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Generating Your Documents
              </h3>
              <p className="text-slate-600">
                AI is tailoring your application, please wait...
              </p>
            </div>
          ) : (
            /* Default State */
            <>
              {/* Generate Button connected to your `handleGenerate` prop */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="group relative w-full p-5 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    <Zap className="w-6 h-6" />

                    <span>Tailor My Application</span>
                    <Sparkles className="w-6 h-6" />
                  </div>
                </button>
              </motion.div>

              {/* Back Button connected to your `setWizardStep` prop */}
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={() => setWizardStep('cl')}
                  className="flex items-center space-x-2 px-6 py-3 text-slate-600 hover:text-slate-900 transition-colors duration-200 rounded-xl hover:bg-slate-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Back</span>
                </button>
              </div>
            </>
          )}
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
