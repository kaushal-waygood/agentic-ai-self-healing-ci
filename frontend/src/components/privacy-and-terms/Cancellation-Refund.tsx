'use client';

import React from 'react';
import { Mail } from 'lucide-react';
import { cancellationRefundData } from '@/services/dummy/cancellation-refund-data';

// Reusable Section Component
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

// Content Renderer
const renderContent = (contentBlock: any) => {
  switch (contentBlock.type) {
    case 'paragraph':
      return <p dangerouslySetInnerHTML={{ __html: contentBlock.text }} />;
    case 'list':
      return (
        <ul className="space-y-3 mt-4">
          {contentBlock.items.map((item: string, index: number) => (
            <li key={index} className="flex items-start">
              {/* Numbered List Style */}
              <span className="font-semibold text-rose-500 mr-3 flex-shrink-0">
                {index + 1}.
              </span>
              <span
                className="text-gray-700"
                dangerouslySetInnerHTML={{ __html: item }}
              />
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
};

export default function CancellationRefund() {
  return (
    <div>
      <div className="min-h-screen relative overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 py-10 md:py-5">
          {/* Header Section */}
          <header className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl bg-headingTextPrimary bg-clip-text text-transparent relative mb-2 font-bold text-gray-900">
              Cancellation & Refund Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last Updated: {cancellationRefundData.lastUpdated}
            </p>
          </header>

          {/* Main Content Card */}
          <main className="max-w-4xl mx-auto bg-white/70 backdrop-blur-lg rounded-lg p-6 md:p-12 border border-gray-200 shadow-xl">
            {cancellationRefundData.sections.map((section) => (
              <LegalSection
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
              </LegalSection>
            ))}

            {/* Contact Footer */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-white shadow-sm">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-800">
                    Contact Information
                  </h3>
                  <p className="text-gray-600">
                    For questions, clarification, or to initiate a cancellation
                    or refund request, please contact us at:{' '}
                    <a
                      href="mailto:support@zobsai.com"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      support@zobsai.com
                    </a>
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
