'use client';

import React from 'react';
import {
  FileText,
  UserCircle,
  ShieldAlert,
  Copyright,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Mail,
  CheckCircle,
} from 'lucide-react';
import { Navigation } from '@/components/layout/site-header';

// Reusable helper component for consistent section styling
const LegalSection = ({
  icon: Icon,
  title,
  iconBgColor,
  iconTextColor,
  children,
}) => (
  <section className="mb-10 last:mb-0">
    <div className="flex items-center mb-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${iconBgColor} shadow-sm`}
      >
        <Icon className={`w-6 h-6 ${iconTextColor}`} />
      </div>
      <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
    </div>
    <div className="pl-16 space-y-4 text-gray-700 leading-relaxed">
      {children}
    </div>
  </section>
);

export default function TermsAndConditionsPage() {
  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden pt-16">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-0">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-r from-lime-200 to-green-200 rounded-full filter blur-3xl opacity-40 animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-30 animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          {/* Header Section */}
          <header className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Terms and Conditions
            </h1>
            <p className="text-xl text-gray-600">
              Last Updated: September 16, 2025
            </p>
          </header>

          {/* Main Content Card */}
          <main className="max-w-4xl mx-auto bg-white/70 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl">
            <LegalSection
              icon={FileText}
              title="Agreement to Terms"
              iconBgColor="bg-blue-50"
              iconTextColor="text-blue-600"
            >
              <p>
                Welcome to [Your Company Name]! These Terms and Conditions
                ("Terms") govern your use of our website and services
                (collectively, the "Service"). By accessing or using our
                Service, you agree to be bound by these Terms. If you disagree
                with any part of the terms, then you may not access the Service.
              </p>
            </LegalSection>

            <LegalSection
              icon={UserCircle}
              title="User Accounts"
              iconBgColor="bg-pink-50"
              iconTextColor="text-pink-600"
            >
              <p>
                When you create an account with us, you must provide us with
                information that is accurate, complete, and current at all
                times. Failure to do so constitutes a breach of the Terms, which
                may result in immediate termination of your account on our
                Service. You are responsible for safeguarding the password that
                you use to access the Service and for any activities or actions
                under your password.
              </p>
            </LegalSection>

            <LegalSection
              icon={ShieldAlert}
              title="Acceptable Use"
              iconBgColor="bg-lime-50"
              iconTextColor="text-lime-600"
            >
              <p>
                You agree not to use the Service for any unlawful purpose or any
                purpose prohibited under this clause. You agree not to use the
                Service in any way that could damage the Service, the business
                of [Your Company Name], or any user.
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-start">
                  <XCircle className="w-5 h-5 text-rose-500 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    You may not harass, abuse, or threaten others or otherwise
                    violate any person's legal rights.
                  </span>
                </li>
                <li className="flex items-start">
                  <XCircle className="w-5 h-5 text-rose-500 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    You may not violate any intellectual property rights of
                    [Your Company Name] or any third party.
                  </span>
                </li>
                <li className="flex items-start">
                  <XCircle className="w-5 h-5 text-rose-500 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    You may not upload or otherwise disseminate any computer
                    viruses or other software that may damage the property of
                    another.
                  </span>
                </li>
              </ul>
            </LegalSection>

            <LegalSection
              icon={Copyright}
              title="Intellectual Property"
              iconBgColor="bg-amber-50"
              iconTextColor="text-amber-600"
            >
              <p>
                The Service and its original content, features, and
                functionality are and will remain the exclusive property of
                [Your Company Name] and its licensors. The Service is protected
                by copyright, trademark, and other laws of both the [Your
                Country] and foreign countries.
              </p>
            </LegalSection>

            <LegalSection
              icon={AlertTriangle}
              title="Limitation of Liability"
              iconBgColor="bg-yellow-50"
              iconTextColor="text-yellow-600"
            >
              <p>
                In no event shall [Your Company Name], nor its directors,
                employees, partners, agents, suppliers, or affiliates, be liable
                for any indirect, incidental, special, consequential or punitive
                damages, including without limitation, loss of profits, data,
                use, goodwill, or other intangible losses, resulting from your
                access to or use of or inability to access or use the Service.
              </p>
            </LegalSection>

            <LegalSection
              icon={RefreshCw}
              title="Changes to Terms"
              iconBgColor="bg-gray-100"
              iconTextColor="text-gray-600"
            >
              <p>
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. If a revision is material we
                will provide at least 30 days' notice prior to any new terms
                taking effect. What constitutes a material change will be
                determined at our sole discretion.
              </p>
            </LegalSection>

            {/* Contact Section */}
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
                    If you have any questions about these Terms, please contact
                    us at{' '}
                    <a
                      href="mailto:support@yourcompany.com"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      support@yourcompany.com
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
