'use client';

import React, { useState } from 'react';
import {
  Layers,
  Home,
  Briefcase,
  FileText,
  LayoutDashboard,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiInstance from '@/services/api';

const RequestNewFeature = () => {
  const [featureName, setFeatureName] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await apiInstance.post('/new-feature', {
        title: featureName,
        description: description,
      });
      if (response.status === 200) {
        setSubmitted(true);
        setFeatureName('');
        setDescription('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFeatureName('');
    setDescription('');
  };

  const handleTest = async () => {
    try {
      const response = await apiInstance.post(
        '/notifications/test-notification',
      );
    } catch (error) {
      console.error(error);
    }
  };

  const navigationButtons = [
    {
      label: 'Submit Another Request',
      icon: Plus,
      action: handleReset,
      primary: true,
      gradient: 'buttonPrimary',
    },
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      gradient: 'buttonPrimary',
    },
    {
      label: 'Job Search',
      icon: Briefcase,
      path: '/dashboard/search-jobs',
      gradient: 'buttonPrimary',
    },
    {
      label: 'CV Generator',
      icon: FileText,
      path: '/dashboard/cv-generator',
      gradient: 'buttonPrimary',
    },
    {
      label: 'Home',
      icon: Home,
      path: '/',
      gradient: 'buttonPrimary',
    },
  ];

  return (
    <div className="relative min-h-screen py-12 px-4 overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        {submitted ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Success State */}
            <div>
              <div className="relative group">
                <div className="absolute -inset-1 rounded-lg group-hover:opacity-50 transition duration-300" />
                <div className="relative bg-white rounded-lg p-12  border border-green-200">
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-100 rounded-full blur-lg" />
                      <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center  animate-bounce">
                        <span className="text-white text-4xl font-bold">✓</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        Success!
                      </h3>
                      <p className="text-green-700 font-medium text-lg">
                        Your Request for New Feature has been Received
                        Successfully
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <p className="text-center text-gray-700 font-semibold text-lg mb-6">
                What would you like to do next?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {navigationButtons.map((button, index) => {
                  const Icon = button.icon;
                  const isPrimary = button.primary;

                  return (
                    <button
                      key={index}
                      onClick={() =>
                        button.action
                          ? button.action()
                          : router.push(button.path!)
                      }
                      className="group transition-all duration-300 hover:-translate-y-1  animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${100 + index * 50}ms` }}
                    >
                      <div className="relative overflow-hidden">
                        <div
                          className={`absolute inset-0 bg-${button.gradient} opacity-0 group-hover:opacity-10 transition duration-300`}
                        />
                        <div
                          className={`relative flex items-center justify-between w-full px-6 py-4 rounded-lg border-2 transition-all ${
                            isPrimary
                              ? `border-blue-400 bg-${button.gradient} text-white `
                              : 'border-gray-200 bg-white text-gray-800 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2.5 rounded-lg ${
                                isPrimary ? 'bg-white/20' : 'bg-gray-100'
                              }`}
                            >
                              <Icon
                                className={`w-5 h-5 ${
                                  isPrimary ? 'text-white' : 'text-gray-700'
                                }`}
                              />
                            </div>
                            <span className="font-semibold text-sm md:text-base">
                              {button.label}
                            </span>
                          </div>
                          <ArrowRight
                            className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                              isPrimary ? 'text-white' : 'text-gray-400'
                            }`}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Form State */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-lg opacity-30 group-hover:opacity-40 transition duration-500" />

              <div className="relative bg-white rounded-lg  border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-header-gradient-primary px-4 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2  rounded-lg ">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-semibold text-gray-100 ">
                      Request New Feature
                    </h2>
                  </div>
                  <p className="text-gray-200 ml-11 text-sm">
                    Share your innovative ideas with us
                  </p>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  {/* Feature Name Input */}
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <label className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Feature Name
                    </label>
                    <input
                      type="text"
                      value={featureName}
                      onChange={(e) => setFeatureName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="e.g., Real-time Notifications"
                      required
                      className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-all duration-300 ${
                        focusedField === 'name'
                          ? 'border-blue-500 '
                          : 'border-gray-200 '
                      } placeholder-gray-400 `}
                    />
                  </div>

                  {/* Description Input */}
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
                    <label className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onFocus={() => setFocusedField('description')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Tell us more about your feature idea..."
                      required
                      className={`w-full px-4 py-3 rounded-lg border-2 h-32 resize-none outline-none transition-all duration-300 ${
                        focusedField === 'description'
                          ? 'border-indigo-500 '
                          : 'border-gray-200 '
                      } placeholder-gray-400 `}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative w-full group overflow-hidden"
                    >
                      <div className="relative bg-buttonPrimary text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95">
                        <span className="">Submit Request</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestNewFeature;
