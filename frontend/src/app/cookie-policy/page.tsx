'use client';

import React from 'react';
import {
  Cookie,
  Cog,
  ListChecks,
  SlidersHorizontal,
  RefreshCw,
  Mail,
  ShieldCheck,
  BarChart2,
  Megaphone,
  Share2,
  FunctionSquare,
} from 'lucide-react';
// Make sure this path is correct for your project structure
import { Navigation } from '@/components/layout/site-header';

// Data for the sections, making the component dynamic
const policyData = [
  {
    id: 'introduction',
    icon: Cookie,
    title: 'Introduction & What Are Cookies?',
    iconBgColor: 'bg-amber-50',
    iconTextColor: 'text-amber-600',
    content: [
      'Zobsai ("we," "us," or "our") uses cookies and similar tracking technologies on our website at zobsai.com (the "Website"), our web application (the "App"), and related services (collectively, the "Services"). This Cookie Policy explains what these technologies are, how we use them, and your choices regarding their use. It supplements our Privacy Policy.',
      'Cookies are small text files placed on your device (e.g., computer, smartphone) when you visit a website. They help websites remember your preferences, analyze usage, and enable features. Similar technologies include web beacons, pixels, tags, local storage, and scripts.',
    ],
  },
  {
    id: 'types',
    icon: ListChecks,
    title: 'Types of Cookies We Use',
    iconBgColor: 'bg-lime-50',
    iconTextColor: 'text-lime-600',
    content:
      'We categorize cookies based on purpose. Below is a list of cookies we use, their purposes, and whether consent is required under applicable laws. Essential cookies do not require consent, but others do (e.g., under GDPR).',
    subsections: [
      {
        icon: ShieldCheck,
        iconColor: 'text-green-500',
        title: 'Strictly Necessary (Essential) Cookies',
        text: 'These are required for the Services to function properly, such as maintaining your session, enabling logins, securing the site, and facilitating core features. Without them, the Services may not work.',
      },
      {
        icon: BarChart2,
        iconColor: 'text-orange-500',
        title: 'Performance and Analytics Cookies',
        text: 'These help us understand how users interact with our Services, measure performance, and improve features. We use aggregated data to optimize AI models and detect issues. Examples include Google Analytics and Hotjar.',
      },
      {
        icon: FunctionSquare,
        iconColor: 'text-blue-500',
        title: 'Functional Cookies',
        text: 'These enhance usability by remembering your preferences (e.g., language, consent choices) and enabling integrations like LinkedIn profile import or Gmail OAuth for auto-applications.',
      },
      {
        icon: Megaphone,
        iconColor: 'text-pink-500',
        title: 'Advertising and Targeting Cookies',
        text: 'These track your browsing for interest-based ads, retargeting, and measuring ad effectiveness. We may "sell" or "share" this data under CCPA/CPRA for personalized marketing. Examples include Meta Pixels and Google Ads.',
      },
    ],
  },
  {
    id: 'third-party',
    icon: Share2,
    title: 'Third-Party Cookies and Data Sharing',
    iconBgColor: 'bg-teal-50',
    iconTextColor: 'text-teal-600',
    content: [
      'Third parties (e.g., Google, Meta) may set cookies through our Services and access data for their purposes, subject to their policies. This may involve cross-site tracking. Under CCPA/CPRA, this could be a "sale" or "sharing" of personal information—we provide opt-outs via links in our Privacy Policy.',
    ],
  },
  {
    id: 'choices',
    icon: SlidersHorizontal,
    title: 'Your Choices Regarding Cookies',
    iconBgColor: 'bg-pink-50',
    iconTextColor: 'text-pink-600',
    content: [
      'We respect your choices. Since we currently do not have a built-in opt-out tool on the Website, you can manage cookies via browser settings (Chrome, Firefox, Safari) and global opt-out tools like the NAI, DAA, or Google Analytics Opt-Out. We also honor browser-based signals like Global Privacy Control (GPC).',
    ],
  },
  {
    id: 'changes',
    icon: RefreshCw,
    title: 'Changes to This Cookie Policy',
    iconBgColor: 'bg-gray-100',
    iconTextColor: 'text-gray-600',
    content: [
      'We may update this policy to reflect changes in our practices or laws. Updates will be posted here with a revised date. Material changes will be notified via email or a site notice.',
    ],
  },
];

// Reusable helper component for consistent section styling
const LegalSection = ({
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

export default function CookiePolicyPage() {
  return (
    <div>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden pt-16">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-r from-cyan-200 to-green-200 rounded-full filter blur-3xl opacity-40 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-30 animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          {/* Header Section */}
          <header className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Cookie Policy
            </h1>
            <p className="text-xl text-gray-600">
              Last Updated: September 22, 2025
            </p>
          </header>

          {/* Main Content Card */}
          <main className="max-w-4xl mx-auto bg-white/70 backdrop-blur-lg rounded-3xl p-6 md:p-12 border border-gray-200 shadow-xl">
            {policyData.map((section) => (
              <LegalSection
                key={section.id}
                icon={section.icon}
                title={section.title}
                iconBgColor={section.iconBgColor}
                iconTextColor={section.iconTextColor}
              >
                {/* Render main content paragraphs */}
                {Array.isArray(section.content) ? (
                  section.content.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p>{section.content}</p>
                )}

                {/* Render subsections if they exist (e.g., for "Types of Cookies") */}
                {section.subsections && (
                  <ul className="space-y-4 mt-4">
                    {section.subsections.map((sub, index) => {
                      const SubIcon = sub.icon;
                      return (
                        <li key={index} className="flex items-start">
                          <SubIcon
                            className={`w-6 h-6 ${sub.iconColor} mr-3 mt-1 flex-shrink-0`}
                          />
                          <div>
                            <strong className="text-gray-900">
                              {sub.title}:
                            </strong>
                            <p className="mt-1">{sub.text}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </LegalSection>
            ))}

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
                    Questions? Email us at{' '}
                    <a
                      href="mailto:support@zobsai.com"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      support@zobsai.com
                    </a>{' '}
                    or our Data Protection Officer at{' '}
                    <a
                      href="mailto:dpo@zobsai.com"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      dpo@zobsai.com
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
