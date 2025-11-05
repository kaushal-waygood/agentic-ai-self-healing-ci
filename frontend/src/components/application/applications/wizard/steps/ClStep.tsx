'use client';

import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form'; // Assuming you use FormProvider
import { Form, FormField } from '@/components/ui/form'; // Assuming these are your form components
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Edit3,
  Save,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea'; // Assuming this is your textarea component
import apiInstance from '@/services/api';

// This is the merged component that combines the UI from the generated code
// with the functionality from your original code.
const SleekClStep = ({
  clForm,
  handleClContextSubmit,
  setWizardStep,
  mockUserProfile,
}: any) => {
  // Options array to build the selection UI, taken from the generated code.
  const [coverLetters, setCoverLetters] = useState([]);

  const [stats, setStats] = useState({ clsCount: 0 });

  useEffect(() => {
    const fetchCoverLetters = async () => {
      try {
        const response = await apiInstance.get('/students/letter/saved');

        setCoverLetters(response.data.html || []);
        setStats((prev) => ({
          ...prev,
          coverLettersCount: response.data.html?.length || 0,
        }));
      } catch (error) {
        console.error('Failed to fetch cover letters:', error);
      }
    };

    fetchCoverLetters();
  }, []);


  const options = [
    {
      value: 'skip',
      icon: Sparkles,
      title: 'Skip this step - Generate from scratch',
      description: 'Let AI create a personalized cover letter for you',
      gradient: 'from-purple-500/20 to-blue-500/20',
    },
    {
      value: 'paste',
      icon: Edit3,
      title: 'Paste content from an old cover letter',
      description: 'Use your existing content as a starting point',
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      value: 'saved',
      icon: Save,
      title: 'Use a saved cover letter',
      description: 'Choose from your previously saved templates',
      gradient: 'from-cyan-500/20 to-purple-500/20',
    },
  ];

  // We use clForm.watch to reactively get the value of 'clSource'
  // to conditionally render the Textarea or the saved CL list.
  const selectedSource = clForm.watch('clSource');

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 font-sans">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Cover Letter Context
        </h2>
        <p className="text-slate-600 text-lg">
          Provide an existing cover letter to give the AI more context, or skip
          to generate one from scratch.
        </p>
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mt-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse delay-150"></div>
            <div className="w-8 h-3 bg-cyan-500 rounded-full"></div>
            <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Card using react-hook-form */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <Form {...clForm}>
            <form onSubmit={clForm.handleSubmit(handleClContextSubmit)}>
              <FormField
                control={clForm.control}
                name="clSource"
                render={({ field }) => (
                  <div className="space-y-4">
                    {/* Main Options: Skip, Paste, Saved */}
                    {options.map((option, index) => {
                      const Icon = option.icon;
                      const isSelected = field.value === option.value;

                      return (
                        <div
                          key={option.value}
                          className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg scale-[1.02]'
                              : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50/30 hover:to-blue-50/30 hover:shadow-md'
                          }`}
                          // Set the form value on click
                          onClick={() => field.onChange(option.value)}
                          style={{
                            animation: `fadeInUp 0.6s ease-out ${
                              index * 100
                            }ms forwards`,
                            opacity: 0, // Start with opacity 0 for animation
                          }}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                          ></div>
                          <div className="relative p-6">
                            <div className="flex items-start space-x-4">
                              {/* Custom Radio Button Visual */}
                              <div
                                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                  isSelected
                                    ? 'border-purple-500 bg-purple-500'
                                    : 'border-slate-300 group-hover:border-purple-400'
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <div
                                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                  isSelected
                                    ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg'
                                    : 'bg-slate-100 text-slate-600 group-hover:bg-gradient-to-br group-hover:from-purple-100 group-hover:to-blue-100'
                                }`}
                              >
                                <Icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3
                                  className={`font-semibold text-lg mb-1 transition-colors duration-200 ${
                                    isSelected
                                      ? 'text-purple-900'
                                      : 'text-slate-900'
                                  }`}
                                >
                                  {option.title}
                                </h3>
                                <p className="text-slate-600 text-sm">
                                  {option.description}
                                </p>
                              </div>
                            </div>

                            {/* Conditional content for 'paste' */}
                            {isSelected && option.value === 'paste' && (
                              <div className="mt-6 animate-fadeIn">
                                <FormField
                                  control={clForm.control}
                                  name="pastedCl"
                                  render={({ field: pastedField }) => (
                                    <Textarea
                                      {...pastedField}
                                      placeholder="Paste your draft cover letter here..."
                                      className="w-full h-32 p-4 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50/30 to-blue-50/30 focus:border-purple-500 focus:outline-none transition-all duration-200 resize-none text-slate-700 placeholder-slate-400"
                                    />
                                  )}
                                />
                              </div>
                            )}

                            {/* Conditional content for 'saved' */}
                            {isSelected && option.value === 'saved' && (
                              // <div className="mt-6 animate-fadeIn">
                              <div className="max-h-[35vh] overflow-y-auto border border-slate-200 rounded-lg bg-slate-50/50">
                                <FormField
                                  control={clForm.control}
                                  name="savedClId"
                                  render={({ field: savedField }) => (
                                    <>
                                      {coverLetters.length > 0 ? (
                                        <div className="space-y-2">
                                          {coverLetters.map((cl, clIndex) => {
                                            const isSavedClSelected =
                                              savedField.value === cl._id;
                                            return (
                                              <div
                                                key={cl._id}
                                                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                                  isSavedClSelected
                                                    ? 'border-cyan-500 bg-gradient-to-r from-cyan-50 to-blue-50'
                                                    : 'border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/30'
                                                }`}
                                                onClick={(e) => {
                                                  e.stopPropagation(); // Prevent parent onClick from firing
                                                  savedField.onChange(cl._id);
                                                }}
                                                style={{
                                                  animation: `slideInLeft 0.4s ease-out ${
                                                    clIndex * 100
                                                  }ms forwards`,
                                                  opacity: 0,
                                                }}
                                              >
                                                <div
                                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    isSavedClSelected
                                                      ? 'border-cyan-500 bg-cyan-500'
                                                      : 'border-slate-300'
                                                  }`}
                                                >
                                                  {isSavedClSelected && (
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                  )}
                                                </div>
                                                <FileText className="w-4 h-4 text-slate-500" />

                                                <div className="flex-1 min-w-0">
                                                  <div className="font-medium text-slate-800">
                                                    {cl.coverLetterTitle?.slice(
                                                      0,
                                                      50,
                                                    ) || 'N/A'}
                                                  </div>

                                                  <div>
                                                    {cl.updatedAt && (
                                                      <div className="text-sm text-slate-500 flex  items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>
                                                          {new Date(
                                                            cl.updatedAt,
                                                          ).toLocaleDateString()}
                                                        </span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <div className="text-center py-8">
                                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FileText className="w-8 h-8 text-slate-400" />
                                          </div>
                                          <p className="text-slate-500 text-sm">
                                            No saved cover letters found.
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  )}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              />

              {/* Footer with navigation buttons */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setWizardStep('cv')}
                  className="flex items-center space-x-2 px-6 py-3 text-slate-600 hover:text-slate-900 transition-colors duration-200 rounded-xl hover:bg-slate-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Back</span>
                </button>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-purple-300"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SleekClStep;
