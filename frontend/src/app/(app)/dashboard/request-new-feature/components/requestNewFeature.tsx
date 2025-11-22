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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Job Search',
      icon: Briefcase,
      path: '/dashboard/search-jobs',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      label: 'CV Generator',
      icon: FileText,
      path: '/dashboard/cv-generator',
      gradient: 'from-green-500 to-teal-500',
    },
    {
      label: 'Home',
      icon: Home,
      path: '/',
      gradient: 'from-indigo-500 to-blue-500',
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50 py-12 px-4 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {submitted ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Success State */}
            <div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg blur-xl opacity-30 group-hover:opacity-50 transition duration-300" />
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
                          className={`absolute inset-0 bg-gradient-to-r ${button.gradient} opacity-0 group-hover:opacity-10 transition duration-300`}
                        />
                        <div
                          className={`relative flex items-center justify-between w-full px-6 py-4 rounded-lg border-2 transition-all ${
                            isPrimary
                              ? `border-blue-400 bg-gradient-to-r ${button.gradient} text-white `
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
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-lg blur-2xl opacity-30 group-hover:opacity-40 transition duration-500" />

              <div className="relative bg-white rounded-lg  border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-8 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg ">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Request New Feature
                    </h2>
                  </div>
                  <p className="text-gray-600 ml-11 text-sm">
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
                          ? 'border-blue-500 bg-blue-50  shadow-blue-200'
                          : 'border-gray-200 bg-gradient-to-br from-white to-gray-50'
                      } placeholder-gray-400 focus:scale-105`}
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
                          ? 'border-indigo-500 bg-indigo-50  shadow-indigo-200'
                          : 'border-gray-200 bg-gradient-to-br from-white to-gray-50'
                      } placeholder-gray-400 focus:scale-105`}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                    <button
                      type="submit"
                      className="relative w-full group overflow-hidden"
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition duration-300" />
                      <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all group-hover: hover:scale-105 active:scale-95">
                        <span>Submit Request</span>
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
