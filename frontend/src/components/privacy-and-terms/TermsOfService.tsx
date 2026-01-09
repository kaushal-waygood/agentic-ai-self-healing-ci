'use client';

import React from 'react';
import { Dot, Mail, XCircle } from 'lucide-react';

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
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="pl-14 space-y-3 text-gray-700 leading-relaxed">
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
              {/* Replaced Dot icon with a number span */}
              <span className="font-semibold  mr-3 flex-shrink-0">
                {index + 1}.
              </span>
              <span className="text-gray-700">{item}</span>
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
      <div className="min-h-screen relative overflow-hidden ">
        <div className="relative z-10 container mx-auto px-4 py-10 md:py-5">
          {/* Header Section */}
          <header className="text-center mb-5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl bg-headingTextPrimary bg-clip-text text-transparent relative mb-2">
              Terms and Conditions
            </h1>
            <p className="text-lg text-gray-600">
              Last Updated: {termsData.lastUpdated}
            </p>
          </header>

          {/* Main Content Card */}
          <main className="max-w-4xl mx-auto bg-white/70 backdrop-blur-lg rounded-lg p-6 md:p-12 border border-gray-200 shadow-xl">
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
                    For questions or complaints, contact us at:{' '}
                    <a
                      href="mailto:support@zobsai.com"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      info@zobsai.com
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
