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
} from 'lucide-react';

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

export default function CookiePolicyPage() {
  return (
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
            Last Updated: September 16, 2025
          </p>
        </header>

        {/* Main Content Card */}
        <main className="max-w-4xl mx-auto bg-white/70 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl">
          <LegalSection
            icon={Cookie}
            title="What Are Cookies?"
            iconBgColor="bg-amber-50"
            iconTextColor="text-amber-600"
          >
            <p>
              Cookies are small text files that are placed on your computer or
              mobile device when you visit a website. They are widely used to
              make websites work, or work more efficiently, as well as to
              provide information to the owners of the site. Cookies help us
              recognize your device and remember information about your visit,
              like your preferences, settings, and how you use our website.
            </p>
          </LegalSection>

          <LegalSection
            icon={Cog}
            title="How We Use Cookies"
            iconBgColor="bg-blue-50"
            iconTextColor="text-blue-600"
          >
            <p>
              We use cookies for a variety of reasons, like enabling certain
              functions of the Service, providing analytics, storing your
              preferences, and enabling advertisement delivery. This helps us to
              provide you with a good experience when you browse our website and
              also allows us to improve our site.
            </p>
          </LegalSection>

          <LegalSection
            icon={ListChecks}
            title="Types of Cookies We Use"
            iconBgColor="bg-lime-50"
            iconTextColor="text-lime-600"
          >
            <p>
              We use both session and persistent cookies on our Service and we
              use different types of cookies to run the Service:
            </p>
            <ul className="space-y-4 mt-4">
              <li className="flex items-start">
                <ShieldCheck className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900">Essential Cookies:</strong>
                  <p>
                    These are necessary for the website to function and cannot
                    be switched off in our systems. They are usually only set in
                    response to actions made by you which amount to a request
                    for services, such as setting your privacy preferences,
                    logging in, or filling in forms.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <BarChart2 className="w-6 h-6 text-orange-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900">
                    Performance and Analytics Cookies:
                  </strong>
                  <p>
                    These cookies allow us to count visits and traffic sources
                    so we can measure and improve the performance of our site.
                    They help us to know which pages are the most and least
                    popular and see how visitors move around the site.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <Megaphone className="w-6 h-6 text-pink-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-gray-900">Marketing Cookies:</strong>
                  <p>
                    These cookies may be set through our site by our advertising
                    partners. They may be used by those companies to build a
                    profile of your interests and show you relevant adverts on
                    other sites.
                  </p>
                </div>
              </li>
            </ul>
          </LegalSection>

          <LegalSection
            icon={SlidersHorizontal}
            title="Your Choices Regarding Cookies"
            iconBgColor="bg-pink-50"
            iconTextColor="text-pink-600"
          >
            <p>
              You have the right to decide whether to accept or reject cookies.
              You can exercise your cookie preferences by setting or amending
              your web browser controls to accept or refuse cookies. If you
              choose to reject cookies, you may still use our website though
              your access to some functionality and areas of our website may be
              restricted.
            </p>
          </LegalSection>

          <LegalSection
            icon={RefreshCw}
            title="Changes to This Cookie Policy"
            iconBgColor="bg-gray-100"
            iconTextColor="text-gray-600"
          >
            <p>
              We may update this Cookie Policy from time to time in order to
              reflect, for example, changes to the cookies we use or for other
              operational, legal, or regulatory reasons. Please therefore
              re-visit this Cookie Policy regularly to stay informed about our
              use of cookies and related technologies.
            </p>
          </LegalSection>

          {/* Contact Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 bg-white shadow-sm">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-800">Contact Us</h3>
                <p className="text-gray-600">
                  If you have any questions about our use of cookies, please
                  contact us at{' '}
                  <a
                    href="mailto:cookies@yourcompany.com"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    cookies@yourcompany.com
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
