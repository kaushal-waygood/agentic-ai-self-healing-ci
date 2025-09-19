'use client';

import React from 'react';
import {
  ShieldCheck,
  Database,
  Users,
  Lock,
  UserCheck,
  FileClock,
  Mail,
  CheckCircle,
} from 'lucide-react';
import { Navigation } from '@/components/layout/site-header';

// A small helper component for consistent section styling
const PolicySection = ({
  icon: Icon,
  title,
  iconBgColor,
  iconTextColor,
  children,
}) => (
  <section className="mb-10">
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

export default function PrivacyPolicyPage() {
  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden pt-16">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-cyan-200 to-green-200 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full filter blur-3xl opacity-40 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-30 animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          {/* Header Section */}
          <header className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600">
              Last Updated: September 16, 2025
            </p>
          </header>

          {/* Main Content Card */}
          <main className="max-w-4xl mx-auto bg-white/70 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl">
            <PolicySection
              icon={ShieldCheck}
              title="Our Commitment to Privacy"
              iconBgColor="bg-blue-50"
              iconTextColor="text-blue-600"
            >
              <p>
                Your privacy is critically important to us. At [Your Company
                Name], we have a few fundamental principles: We are thoughtful
                about the personal information we ask you to provide and the
                personal information that we collect about you through the
                operation of our services. We store personal information for
                only as long as we have a reason to keep it. We aim for full
                transparency on how we gather, use, and share your personal
                information.
              </p>
            </PolicySection>

            <PolicySection
              icon={Database}
              title="Information We Collect"
              iconBgColor="bg-lime-50"
              iconTextColor="text-lime-600"
            >
              <p>
                We only collect information about you if we have a reason to do
                so—for example, to provide our Services, to communicate with
                you, or to make our Services better. We collect this information
                from three sources: if and when you provide information to us,
                automatically through operating our Services, and from outside
                sources.
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    <strong>Account Information:</strong> We ask for basic
                    information from you in order to set up your account. For
                    example, we require individuals who sign up for an account
                    to provide a username and email address.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    <strong>Transactional Information:</strong> If you purchase
                    something from us, we collect information to process the
                    transaction, such as your name, credit card information, and
                    contact information.
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    <strong>Usage Information:</strong> We collect information
                    about your usage of our Services. For example, we collect
                    information about the actions that site administrators and
                    users perform on a site.
                  </span>
                </li>
              </ul>
            </PolicySection>

            <PolicySection
              icon={Users}
              title="How and Why We Use Information"
              iconBgColor="bg-pink-50"
              iconTextColor="text-pink-600"
            >
              <p>
                We use information about you for the purposes listed below: to
                provide our Services, to ensure quality, maintain safety, and
                improve our Services, to market our Services and measure, gauge,
                and improve the effectiveness of our marketing, and to protect
                our Services, our users, and the public.
              </p>
            </PolicySection>

            <PolicySection
              icon={Lock}
              title="Data Security"
              iconBgColor="bg-amber-50"
              iconTextColor="text-amber-600"
            >
              <p>
                While no online service is 100% secure, we work very hard to
                protect information about you against unauthorized access, use,
                alteration, or destruction, and take reasonable measures to do
                so, such as monitoring our Services for potential
                vulnerabilities and attacks.
              </p>
            </PolicySection>

            <PolicySection
              icon={UserCheck}
              title="Your Rights & Choices"
              iconBgColor="bg-green-50"
              iconTextColor="text-green-600"
            >
              <p>
                You have several choices available when it comes to information
                about you: You can limit the information that you provide. You
                can access and update your information through your account
                settings. You have the right to deactivate your account. You can
                also opt out of our marketing communications at any time.
              </p>
            </PolicySection>

            <PolicySection
              icon={FileClock}
              title="Changes to This Policy"
              iconBgColor="bg-gray-100"
              iconTextColor="text-gray-600"
            >
              <p>
                Although most changes are likely to be minor, we may change our
                Privacy Policy from time to time. We encourage visitors to
                frequently check this page for any changes to its Privacy
                Policy. Your continued use of the Services after any change in
                this Privacy Policy will constitute your acceptance of such
                change.
              </p>
            </PolicySection>

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
                    If you have any questions about this Privacy Policy, please
                    contact us at{' '}
                    <a
                      href="mailto:privacy@yourcompany.com"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      privacy@yourcompany.com
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
