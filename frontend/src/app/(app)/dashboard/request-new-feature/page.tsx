'use client';

import React, { useState } from 'react';
import { Layers } from 'lucide-react';

const page = () => {
  const [featureName, setFeatureName] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can call your API to submit the feature request
    console.log('Feature Requested:', { featureName, description });
    setSubmitted(true);
    setFeatureName('');
    setDescription('');
  };
  return (
    <div className="mt-10  max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl ">
      <div className="flex items-center gap-2 mb-6">
        <Layers className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800">
          Request New Feature
        </h2>
      </div>

      {submitted && (
        <p className="mb-4 text-green-600 font-medium">
          ✅ Feature request submitted successfully!
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Feature Name
          </label>
          <input
            type="text"
            value={featureName}
            onChange={(e) => setFeatureName(e.target.value)}
            placeholder="Enter feature name"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your feature..."
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default page;
