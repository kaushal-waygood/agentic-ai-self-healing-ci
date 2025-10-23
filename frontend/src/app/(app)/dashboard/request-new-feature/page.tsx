'use client';

import React, { useState } from 'react';
import {
  Layers,
  Home,
  Briefcase,
  FileText,
  LayoutDashboard,
  Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiInstance from '@/services/api';

const Page = () => {
  const [featureName, setFeatureName] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Log the data from the input fields to the console
    console.log({
      title: featureName,
      description: description,
    });

    try {
      const response = await apiInstance.post('/new-feature', {
        title: featureName,
        description: description,
      });

      console.log(response);

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

  const navigationButtons = [
    {
      label: 'Submit Another Request',
      icon: Plus,
      action: handleReset,
      primary: true,
    },
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Job Search', icon: Briefcase, path: '/dashboard/search-jobs' },
    { label: 'CV Generator', icon: FileText, path: '/dashboard/cv-generator' },
    { label: 'Home', icon: Home, path: '/' },
  ];

  return (
    <div className="mt-10 max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
      <div className="flex items-center gap-2 mb-6">
        <Layers className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Request New Feature
        </h2>
      </div>

      {submitted ? (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">✓</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-2">
              Success!
            </h3>
            <p className="text-green-700 dark:text-green-300 font-medium">
              Your Request for New Feature has been Received Successfully
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-gray-700 dark:text-gray-300 font-medium text-center mb-4">
              What would you like to do next?
            </p>

            {navigationButtons.map((button, index) => {
              const Icon = button.icon;
              const isPrimary = button.primary;

              return (
                <button
                  key={index}
                  onClick={() =>
                    button.action ? button.action() : router.push(button.path!)
                  }
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isPrimary
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {button.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Feature Name
            </label>
            <input
              type="text"
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              placeholder="Enter feature name"
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your feature..."
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 h-24 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition shadow-md hover:shadow-lg"
          >
            Submit Request
          </button>
        </form>
      )}
    </div>
  );
};

export default Page;
