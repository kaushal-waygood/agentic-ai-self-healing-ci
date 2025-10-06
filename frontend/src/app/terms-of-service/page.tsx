'use client';

import React from 'react';
import { Mail, XCircle } from 'lucide-react';
import { Navigation } from '@/components/layout/site-header';
import { termsData } from '@/services/dummy/terms-of-service';

// This is the same reusable component from your original file
const LegalSection = ({
  icon: Icon,
  title,
  iconBgColor,
  iconTextColor,
  children,
}: any) => (
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
      // Use dangerouslySetInnerHTML to render HTML tags like <b>
      return <p dangerouslySetInnerHTML={{ __html: contentBlock.text }} />;
    case 'list':
      return (
        <ul className="space-y-3 mt-4">
          {contentBlock.items.map((item, index) => (
            <li key={index} className="flex items-start">
              <XCircle className="w-5 h-5 text-rose-500 mr-3 mt-1 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
};

export default function TermsAndConditionsPage() {
  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden ">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-0">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-r from-lime-200 to-green-200 rounded-full filter blur-3xl opacity-40 animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-30 animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-10 md:py-5">
          {/* Header Section */}
          <header className="text-center mb-5">
            <h1 className="text-5xl sm:text-6xl lg:text-6xl font-black text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Terms and Conditions
            </h1>
            <p className="text-xl text-gray-600">
              Last Updated: {termsData.lastUpdated}
            </p>
          </header>

          {/* Main Content Card */}
          <main className="max-w-4xl mx-auto bg-white/70 backdrop-blur-lg rounded-3xl p-6 md:p-12 border border-gray-200 shadow-xl">
            {/* Loop through the sections from the data file and render them */}
            {termsData.sections.map((section) => (
              <LegalSection
                key={section.id}
                icon={section.icon}
                title={section.title}
                iconBgColor={section.iconBgColor}
                iconTextColor={section.iconTextColor}
              >
                {/* Loop through the content blocks within each section */}
                {section.content.map((block, index) => (
                  <React.Fragment key={index}>
                    {renderContent(block)}
                  </React.Fragment>
                ))}
              </LegalSection>
            ))}

            {/* Contact Section (kept separate as it's a unique final block) */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-white shadow-sm">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-800">
                    Contact Us
                  </h3>
                  <p className="text-gray-600">
                    In order to resolve a complaint or to receive further
                    information, please contact us at:{' '}
                    <a
                      href="mailto:support@zobsai.com"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      support@zobsai.com
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
