'use client';

import React, { useState, useRef } from 'react';
import {
  Send,
  CheckCircle,
  User,
  Mail,
  FileUp,
  X,
  Bug,
  AlertTriangle,
  Type,
} from 'lucide-react';
import apiInstance from '@/services/api';
import { Navigation } from '@/components/layout/site-header';

export default function BugReportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bugTitle: '',
    description: '',
    severity: '',
  });
  const [files, setFiles] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles((prevFiles) => [...prevFiles, ...Array.from(e.target.files)]);
  };

  const removeFile = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  const handleFileAreaClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Create a new FormData object to send to the API
    const dataForApi = new FormData();

    // Correctly loop over the state object (formData) to append its values
    Object.entries(formData).forEach(([key, value]) => {
      dataForApi.append(key, value);
    });

    // Correctly append each file to the 'attachment' field
    files.forEach((file) => {
      dataForApi.append('attachment', file);
    });

    try {
      // Pass the FormData object directly to the API call.
      // Axios will automatically set the correct 'Content-Type' header.
      const response = await apiInstance.post('/form/bug-report', dataForApi);

      // Renamed this variable to avoid the naming conflict
      const responseData = response.data;
      console.log(responseData);

      setIsSubmitted(true);
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          bugTitle: '',
          description: '',
          severity: 'medium',
        });
        setFiles([]);
      }, 3000);
    } catch (error) {
      console.error('Failed to submit bug report:', error);
      // Add user-facing error handling here, e.g., a toast notification
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 ">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-lime-200 to-green-200 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full filter blur-3xl opacity-40 animate-pulse delay-1000"></div>
          <div className="absolute top-40 left-40 w-60 h-60 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full filter blur-3xl opacity-40 animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-5">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Report an Issue
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Spotted a bug? Your feedback is invaluable in helping us improve.
              Please provide as much detail as possible.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Bug Report Form Section */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 shadow-lg">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors duration-300" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your Name"
                        className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300"
                        required
                      />
                    </div>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors duration-300" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Your Email"
                        className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <Type className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors duration-300" />
                    <input
                      type="text"
                      name="bugTitle"
                      value={formData.bugTitle}
                      onChange={handleInputChange}
                      placeholder="Bug Title / Summary"
                      className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="relative">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Please describe the issue in detail. What did you expect to happen, and what happened instead?"
                      className="w-full p-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300 resize-none"
                      required
                    ></textarea>
                  </div>

                  <div className="relative group">
                    <AlertTriangle className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-purple-500 transition-colors duration-300" />
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300 appearance-none"
                    >
                      <option value="low">Low Severity</option>
                      <option value="medium">Medium Severity</option>
                      <option value="high">High Severity</option>
                      <option value="critical">Critical Severity</option>
                    </select>
                  </div>

                  {/* File Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attach Screenshots or Videos
                    </label>
                    <div
                      onClick={handleFileAreaClick}
                      className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:border-purple-400 hover:bg-gray-50 transition-colors duration-300"
                    >
                      <div className="space-y-1 text-center">
                        <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <p className="pl-1">
                            Click to upload or drag and drop
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF, MP4 up to 10MB
                        </p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,video/*"
                    />
                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-800">
                          Selected files:
                        </h4>
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-100 p-2 rounded-lg"
                          >
                            <span className="text-sm text-gray-700 truncate">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(file.name)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting Report...</span>
                      </>
                    ) : (
                      <>
                        <Bug className="w-5 h-5" />
                        <span>Submit Report</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Report Submitted!
                  </h3>
                  <p className="text-gray-700">
                    Thank you for your help. Our team will review your report
                    shortly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
