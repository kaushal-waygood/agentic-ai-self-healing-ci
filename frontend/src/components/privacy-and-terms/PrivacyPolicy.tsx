'use client';

import React from 'react';
import { Mail, CheckCircle } from 'lucide-react';
// Make sure this path is correct for your project structure
import { Navigation } from '@/components/layout/site-header';
// Import the data from the file you just created
import { privacyData } from '@/services/dummy/privacy-policy';
import { Footer } from '@/components/layout/footer';
// This is the same reusable component from your original file
const PolicySection = ({
  icon: Icon,
  title,
  iconBgColor,
  iconTextColor,
  children,
}) => (
  <section className="mb-10 last:mb-0">
    <div className="flex items-start sm:items-center mb-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 ${iconBgColor} shadow-sm`}
      >
        <Icon className={`w-6 h-6 ${iconTextColor}`} />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
    </div>
    <div className="pl-0 sm:pl-16 space-y-4 text-gray-700 leading-relaxed">
      {children}
    </div>
  </section>
);

// Helper function to render different content types from our data file
const renderContent = (contentBlock) => {
  switch (contentBlock.type) {
    case 'paragraph':
      return <p>{contentBlock.text}</p>;
    case 'subheading':
      return (
        <p className="font-semibold italic text-gray-600">
          {contentBlock.text}
        </p>
      );
    case 'nestedList':
      return (
        <div className="mt-4">
          <h4 className="font-bold text-lg text-gray-800 mb-2">
            {contentBlock.title}
          </h4>
          <ul className="space-y-3">
            {contentBlock.items.map((item, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-gray-800">{item.title}</strong>
                  <span className="ml-1">{item.text}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    case 'table':
      return (
        <div className="overflow-x-auto my-6">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                {contentBlock.headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contentBlock.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 whitespace-normal text-sm text-gray-800"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden ">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-cyan-200 to-green-200 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full filter blur-3xl opacity-40 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-30 animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 md:py-5">
          {/* Header Section */}
          <header className="text-center mb-5">
            <h1 className="text-5xl sm:text-6xl lg:text-6xl font-black text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600">
              Last Updated: {privacyData.lastUpdated}
            </p>
          </header>

          {/* Main Content Card */}
          <main className="max-w-4xl mx-auto bg-white/70 backdrop-blur-lg rounded-3xl p-6 md:p-12 border border-gray-200 shadow-xl">
            {privacyData.sections.map((section) => (
              <PolicySection
                key={section.id}
                icon={section.icon}
                title={section.title}
                iconBgColor={section.iconBgColor}
                iconTextColor={section.iconTextColor}
              >
                {section.content.map((block, index) => (
                  <React.Fragment key={index}>
                    {renderContent(block)}
                  </React.Fragment>
                ))}
              </PolicySection>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
