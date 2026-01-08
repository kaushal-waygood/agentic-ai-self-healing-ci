// 'use client';

// import React from 'react';
// import { Mail, CheckCircle } from 'lucide-react';
// // Make sure this path is correct for your project structure
// import { Navigation } from '@/components/layout/site-header';
// // Import the data from the file you just created
// import { privacyData } from '@/services/dummy/privacy-policy';
// import { Footer } from '@/components/layout/footer';

// const PolicySection = ({
//   icon: Icon,
//   title,
//   iconBgColor,
//   iconTextColor,
//   children,
// }) => (
//   <section className="mb-10 last:mb-0">
//     <div className="flex items-start sm:items-center mb-4">
//       <div
//         className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 ${iconBgColor} shadow-sm`}
//       >
//         <Icon className={`w-6 h-6 ${iconTextColor}`} />
//       </div>
//       <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
//     </div>
//     <div className="pl-0 sm:pl-16 space-y-4 text-gray-700 leading-relaxed">
//       {children}
//     </div>
//   </section>
// );

// // Helper function to render different content types from our data file
// const renderContent = (contentBlock) => {
//   switch (contentBlock.type) {
//     case 'paragraph':
//       return <p>{contentBlock.text}</p>;
//     case 'subheading':
//       return (
//         <p className="font-semibold italic text-gray-600">
//           {contentBlock.text}
//         </p>
//       );
//     case 'nestedList':
//       return (
//         <div className="mt-4">
//           <h4 className="font-bold text-lg text-gray-800 mb-2">
//             {contentBlock.title}
//           </h4>
//           <ul className="space-y-3">
//             {contentBlock.items.map((item, index) => (
//               <li key={index} className="flex items-start">
//                 <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
//                 <div>
//                   <strong className="text-gray-800">{item.title}</strong>
//                   <span className="ml-1">{item.text}</span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       );
//     case 'table':
//       return (
//         <div className="overflow-x-auto my-6">
//           <table className="min-w-full bg-white border border-gray-200 rounded-lg">
//             <thead className="bg-gray-50">
//               <tr>
//                 {contentBlock.headers.map((header, index) => (
//                   <th
//                     key={index}
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                   >
//                     {header}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {contentBlock.rows.map((row, rowIndex) => (
//                 <tr key={rowIndex}>
//                   {row.map((cell, cellIndex) => (
//                     <td
//                       key={cellIndex}
//                       className="px-6 py-4 whitespace-normal text-sm text-gray-800"
//                     >
//                       {cell}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       );
//     default:
//       return null;
//   }
// };

// export default function PrivacyPolicyPage() {
//   return (
//     <div>
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden ">
//         {/* Animated background elements */}
//         <div className="absolute inset-0 -z-0">
//           <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-cyan-200 to-green-200 rounded-full filter blur-3xl opacity-40 animate-pulse"></div>
//           <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full filter blur-3xl opacity-40 animate-pulse delay-1000"></div>
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-30 animate-pulse delay-500"></div>
//         </div>

//         <div className="relative z-10 container mx-auto px-4 py-16 md:py-5">
// {/* Header Section */}
// <header className="text-center mb-5">
//   <h1 className="text-5xl sm:text-6xl lg:text-6xl font-black text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
//     Privacy Policy
//   </h1>
//   <p className="text-xl text-gray-600">
//     Last Updated: {privacyData.lastUpdated}
//   </p>
// </header>

//           {/* Main Content Card */}
//           <main className="max-w-4xl mx-auto bg-white/70 backdrop-blur-lg rounded-3xl p-6 md:p-12 border border-gray-200 shadow-xl">
//             {/* {privacyData.sections.map((section) => (
//               <PolicySection
//                 key={section.id}
//                 icon={section.icon}
//                 title={section.title}
//                 iconBgColor={section.iconBgColor}
//                 iconTextColor={section.iconTextColor}
//               >
//                 {section.content.map((block, index) => (
//                   <React.Fragment key={index}>
//                     {renderContent(block)}
//                   </React.Fragment>
//                 ))}
//               </PolicySection>
//             ))} */}
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React from 'react';
import {
  ShieldCheck,
  Database,
  Settings,
  Scale,
  CreditCard,
  Clock,
  Users,
  Globe,
  UserCheck,
  Cookie,
  Bot,
  Baby,
  Gavel,
  RefreshCw,
  Mail,
  Chrome,
  Lock,
  FileText,
  AlertCircle,
} from 'lucide-react';

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-12 scroll-mt-20" id={title.split(' ')[0]}>
    <div className="flex items-start gap-4 mb-4">
      <div className="hidden sm:flex w-10 h-10 rounded-lg bg-blue-50 flex-shrink-0  items-center justify-center">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="pl-14 space-y-3 text-gray-700 leading-relaxed">
      {children}
    </div>
  </section>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl ">
      {/* Header Section */}
      <header className="text-center mb-5">
        <h1 className="text-2xl sm:text-3xl md:text-4xl bg-headingTextPrimary bg-clip-text text-transparent relative mb-2">
          Privacy Policy
        </h1>
        <p className="text-lg text-gray-600">
          {' '}
          Privacy Policy (GDPR Article 13 Compliant)
        </p>
        <p className="text-lg text-gray-600">Last Updated: January 8, 2026</p>
      </header>
      {/* Header */}

      <div className="max-w-4xl mx-auto bg-white/70 backdrop-blur-lg rounded-lg p-6 md:p-12 border border-gray-200 shadow-xl">
        <Section
          icon={ShieldCheck}
          title="1. Data Controller (Article 13(1)(a))"
        >
          <p>
            The data controller responsible for your personal data is:{' '}
            <strong>Zobsai</strong>
          </p>
          <p>
            Owned and operated by{' '}
            <strong>Waygood EdTech Private Limited</strong>, a company
            incorporated under the Companies Act, 2013, India.
          </p>
          <ul className="list-none space-y-1 mt-2">
            <li>
              <strong>Registered Jurisdiction:</strong> Delhi, India
            </li>
            <li>
              <strong>Website:</strong> https://zobsai.com
            </li>
            <li>
              <strong>Email:</strong> info@zobsai.com
            </li>
          </ul>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="font-semibold text-sm text-gray-900 uppercase tracking-wide mb-2">
              For EU/UK users:
            </p>
            <p>
              Data Protection Officer (DPO):{' '}
              <a
                href="mailto:info@zobsai.com"
                className="text-blue-600 hover:underline"
              >
                info@zobsai.com
              </a>
            </p>
          </div>
        </Section>

        <Section
          icon={Database}
          title="2. Categories of Personal Data We Collect (Article 13(1)(c))"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                A. Data You Provide Directly
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Personal identifiers (name, email, phone number, address,
                  login credentials)
                </li>
                <li>
                  Professional and employment information (resumes, skills, job
                  history, LinkedIn data)
                </li>
                <li>
                  Application content (cover letters, job preferences,
                  references)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                B. Data Collected Automatically
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>IP address, browser type, operating system</li>
                <li>Usage logs, feature interactions, timestamps</li>
                <li>Cookie identifiers and session data</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                C. Gmail Integration Data
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Email metadata and content strictly limited to OAuth scopes
                  granted by you
                </li>
                <li>Drafting, reading, and sending job-related emails only</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                D. Chrome Extension Data
              </h3>
              <p className="mb-2">
                Our Chrome extension may read information displayed in your
                browser strictly to enable job application automation and
                AI-assisted features.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  We do <strong>NOT</strong> store full browser sessions,
                  browsing history, or unrelated website data.
                </li>
                <li>
                  We only store information directly related to job application
                  processing and AI feature usage initiated by you.
                </li>
                <li>
                  Browser sessions are <strong>NOT</strong> recorded or
                  retained.
                </li>
                <li>
                  We reserve the right to temporarily collect and process
                  browser information if required to deliver a service
                  explicitly requested by the user.
                </li>
              </ul>
            </div>
          </div>
        </Section>

        <Section
          icon={Settings}
          title="3. Purposes of Processing (Article 13(1)(c))"
        >
          <p>We process your data for the following purposes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account creation and management</li>
            <li>AI-powered job discovery and automated applications</li>
            <li>Gmail-based drafting and communication</li>
            <li>
              Analyzing user interactions with different features to understand
              usage patterns and improve our Services, AI models, performance,
              and user experience
            </li>
            <li>Personalization of recommendations</li>
            <li>Customer support and communications</li>
            <li>Marketing communications (with consent)</li>
            <li>Security, fraud prevention, and compliance</li>
          </ul>
        </Section>

        <Section
          icon={Scale}
          title="4. Legal Basis for Processing (Article 13(1)(c))"
        >
          <p>We rely on the following lawful bases under GDPR:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Consent</strong> – for Gmail access, Chrome extension
              usage, and marketing emails
            </li>
            <li>
              <strong>Contractual necessity</strong> – to provide Services you
              request
            </li>
            <li>
              <strong>Legitimate interests</strong> – service improvement,
              analytics, fraud prevention, platform security
            </li>
            <li>
              <strong>Legal obligation</strong> – accounting, tax, and
              regulatory compliance
            </li>
          </ul>
        </Section>

        <Section
          icon={CreditCard}
          title="5. Payment Processing (Article 13(1)(e))"
        >
          <p>Payments are processed securely through third-party processors:</p>
          <ul className="list-disc pl-5 mb-3">
            <li>Razorpay (India-based processor)</li>
            <li>Stripe (global processor)</li>
          </ul>
          <p className="mb-2">
            We do not store or retain your full card or bank details. All
            transactions are encrypted and processed in compliance with PCI-DSS
            standards.
          </p>
          <p className="mb-2">
            Payment data is used strictly to complete transactions and meet
            legal and accounting obligations.
          </p>
          <p>You are encouraged to review:</p>
          <ul className="list-disc pl-5">
            <li>
              <a href="#" className="text-blue-600 hover:underline">
                Razorpay Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-600 hover:underline">
                Stripe Privacy Policy
              </a>
            </li>
          </ul>
        </Section>

        <Section
          icon={Clock}
          title="6. Data Retention Period (Article 13(2)(a))"
        >
          <p>
            We retain personal data for up to <strong>TEN (10) years</strong>,
            unless a longer or shorter retention period is required by law or
            justified by legitimate business needs.
          </p>
          <h4 className="font-semibold mt-3 mb-1">Retention breakdown:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Account and profile data:</strong> Active account + up to
              10 years
            </li>
            <li>
              <strong>Payment and financial records:</strong> As required under
              Indian tax and corporate laws
            </li>
            <li>
              <strong>Anonymized analytics and AI training data:</strong> Up to
              10 years
            </li>
            <li>
              <strong>Data deleted earlier</strong> upon valid user request,
              where legally permissible
            </li>
          </ul>
        </Section>

        <Section icon={Users} title="7. Data Recipients (Article 13(1)(e))">
          <p>We may share data with:</p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>Cloud infrastructure providers (e.g., AWS)</li>
            <li>Payment processors (Razorpay, Stripe)</li>
            <li>OAuth providers (Google, LinkedIn)</li>
            <li>Advertising and analytics partners (where permitted)</li>
            <li>
              Employers and job platforms (only when you initiate applications)
            </li>
            <li>Legal and regulatory authorities, if required</li>
          </ul>
          <p className="italic">
            All third parties are contractually bound to protect your data.
          </p>
        </Section>

        <Section
          icon={Globe}
          title="8. International Data Transfers (Article 13(1)(f))"
        >
          <p>
            Your data may be transferred outside the EU/EEA, including to India
            and the United States.
          </p>
          <p>
            Where required, we rely on appropriate safeguards such as Standard
            Contractual Clauses (SCCs) or equivalent legal mechanisms.
          </p>
        </Section>

        <Section
          icon={UserCheck}
          title="9. Your GDPR Rights (Article 13(2)(b–d))"
        >
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>Access your personal data</li>
            <li>Rectify inaccurate data</li>
            <li>Erase your data (“right to be forgotten”)</li>
            <li>Restrict or object to processing</li>
            <li>Data portability</li>
            <li>Withdraw consent at any time</li>
            <li>Lodge a complaint with a supervisory authority</li>
          </ul>
          <p>
            Requests can be sent to{' '}
            <a
              href="mailto:support@zobsai.com"
              className="text-blue-600 font-medium"
            >
              support@zobsai.com
            </a>
            .
          </p>
        </Section>

        <Section
          icon={Cookie}
          title="10. Cookies and Tracking (Article 13(2)(a))"
        >
          <p>We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>Maintain sessions</li>
            <li>Analyze usage</li>
            <li>Improve platform functionality</li>
          </ul>
          <p>
            Cookies do not personally identify you across third-party websites.
            You may disable cookies in your browser settings.
          </p>
        </Section>

        <Section
          icon={Bot}
          title="11. Automated Decision-Making (Article 13(2)(f))"
        >
          <p>
            We use AI-driven automation to recommend jobs, draft applications,
            and optimize submissions.
          </p>
          <p>
            These processes do not produce legal or similarly significant
            effects without human initiation by the user.
          </p>
        </Section>

        <Section icon={Baby} title="12. Children’s Data">
          <p>
            Our Services are intended for users 18 years and older. We do not
            knowingly collect data from minors.
          </p>
        </Section>

        <Section icon={Gavel} title="13. Legal Jurisdiction and Governing Law">
          <p>This Privacy Policy is governed by the laws of India.</p>
          <p>
            Any disputes shall be subject to the exclusive jurisdiction of the
            courts of Delhi, India.
          </p>
        </Section>

        <Section icon={FileText} title="14. Business Transfers">
          <p>
            In the event of a merger, acquisition, or restructuring involving
            Waygood EdTech Private Limited, your data may be transferred to the
            successor entity, subject to this Privacy Policy.
          </p>
        </Section>

        <Section icon={RefreshCw} title="15. Updates to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Material
            changes will be reflected by updating the “Last Updated” date.
          </p>
        </Section>

        <Section icon={Mail} title="16. Contact Information">
          <div className="space-y-1">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:support@zobsai.com" className="text-blue-600">
                support@zobsai.com
              </a>
            </p>
            <p>
              <strong>DPO (EU/UK):</strong>{' '}
              <a href="mailto:dpo@zobsai.com" className="text-blue-600">
                dpo@zobsai.com
              </a>
            </p>
          </div>
        </Section>

        {/* --- ADDENDUM SECTION --- */}
        <div className="mt-16 mb-8 pt-8 border-t-2 border-dashed border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Google OAuth & Chrome Extension Compliance Addendum
          </h2>
          <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">
            Sections 17–25
          </p>
        </div>

        <Section
          icon={Chrome}
          title="17. Google OAuth (Gmail API) Data Use Disclosure"
        >
          <p>
            Zobsai uses Google OAuth to access Gmail data only when explicitly
            authorized by the user.
          </p>
          <h4 className="font-semibold mt-3 mb-1">Scope of Access</h4>
          <p className="mb-2">When you connect your Gmail account, we may:</p>
          <ul className="list-disc pl-5 mb-3">
            <li>Read emails related to job opportunities</li>
            <li>Draft job application emails</li>
            <li>Send emails on your behalf related to job applications</li>
          </ul>
          <p className="mb-4">
            We only access Gmail data strictly within the OAuth scopes granted
            by you and solely to provide user-initiated job application and AI
            assistance features.
          </p>

          <h4 className="font-semibold mt-3 mb-1">
            Limited Use Compliance (Google Policy)
          </h4>
          <p>
            Zobsai’s use of Gmail data fully complies with Google’s Limited Use
            requirements. Specifically:
          </p>
          <ul className="list-disc pl-5 mt-2">
            <li>
              We do <strong>NOT</strong> use Gmail data for advertising
            </li>
            <li>
              We do <strong>NOT</strong> sell Gmail data
            </li>
            <li>
              We do <strong>NOT</strong> use Gmail data to train generalized AI
              models
            </li>
            <li>
              We do <strong>NOT</strong> allow humans to read Gmail content
              except where strictly necessary for security, support, or legal
              compliance
            </li>
          </ul>
          <p className="mt-2">
            Gmail data is used only to provide or improve user-facing features
            explicitly requested by the user.
          </p>
        </Section>

        <Section
          icon={Database}
          title="18. Chrome Extension Data Collection & Usage"
        >
          <h4 className="font-semibold mb-1">
            What the Chrome Extension Can Access
          </h4>
          <p>Our Chrome extension may read:</p>
          <ul className="list-disc pl-5 mb-3">
            <li>Page content related to job postings</li>
            <li>Form fields required for job application submission</li>
            <li>
              Browser context needed to trigger AI features (e.g., autofill,
              drafting, submission)
            </li>
          </ul>

          <h4 className="font-semibold mb-1">What We Do NOT Collect</h4>
          <p>We do NOT:</p>
          <ul className="list-disc pl-5 mb-3">
            <li>Record full browser sessions</li>
            <li>Track browsing history</li>
            <li>Store unrelated website data</li>
            <li>Monitor activity outside job application workflows</li>
            <li>Capture keystrokes unrelated to Zobsai features</li>
          </ul>

          <h4 className="font-semibold mb-1">Storage & Retention</h4>
          <ul className="list-disc pl-5 mb-3">
            <li>Browser session data is processed locally or transiently</li>
            <li>We do not store raw browser session data</li>
            <li>
              Only job-application-related inputs and AI outputs initiated by
              the user may be stored
            </li>
            <li>
              Stored data follows the same retention limits outlined in this
              Privacy Policy (up to 10 years)
            </li>
          </ul>

          <h4 className="font-semibold mb-1">Conditional Browser Data Use</h4>
          <p>
            We reserve the right to collect and process limited browser
            information only when required to deliver a feature explicitly
            requested by the user (e.g., application submission, AI autofill).
          </p>
        </Section>

        <Section
          icon={ShieldCheck}
          title="19. Chrome Web Store “Single Purpose” Declaration"
        >
          <p className="font-semibold mb-2">
            The Zobsai Chrome Extension has a single, user-facing purpose:
          </p>
          <p className="italic mb-3">
            To assist users with AI-powered job discovery, application drafting,
            and submission automation.
          </p>
          <p>
            All data access permissions requested by the extension are directly
            related to this purpose and are not used for secondary or unrelated
            activities.
          </p>
        </Section>

        <Section
          icon={Settings}
          title="20. User Control & Consent (Chrome + OAuth)"
        >
          <p>Users have full control over:</p>
          <ul className="list-disc pl-5 mb-3">
            <li>
              Granting or revoking Gmail access via Google Account settings
            </li>
            <li>Installing or uninstalling the Chrome extension at any time</li>
            <li>Disabling specific permissions through browser settings</li>
          </ul>
          <p>Revoking access immediately stops further data collection.</p>
        </Section>

        <Section
          icon={Lock}
          title="21. No Human Review Policy (Google Requirement)"
        >
          <p>
            Zobsai does not allow human review of Gmail or browser data, except
            in the following limited cases:
          </p>
          <ul className="list-disc pl-5 mb-3">
            <li>User-initiated support requests</li>
            <li>Security incident investigation</li>
            <li>Legal or regulatory compliance</li>
          </ul>
          <p>
            Any such access is: Logged, Restricted, Time-bound, and Subject to
            confidentiality obligations.
          </p>
        </Section>

        <Section
          icon={ShieldCheck}
          title="22. Data Security Measures (Chrome & OAuth)"
        >
          <p>We apply:</p>
          <ul className="list-disc pl-5 mb-3">
            <li>Encrypted data transmission (TLS)</li>
            <li>Secure OAuth token handling</li>
            <li>Access controls and permission scoping</li>
            <li>Regular security reviews</li>
          </ul>
          <p>
            OAuth tokens are stored securely and revoked immediately upon user
            request or account termination.
          </p>
        </Section>

        <Section
          icon={AlertCircle}
          title="23. Advertising & Analytics Exclusion"
        >
          <p>
            Data collected via Gmail OAuth or the Chrome Extension is{' '}
            <strong>NEVER</strong> used for:
          </p>
          <ul className="list-disc pl-5 mb-3">
            <li>Advertising</li>
            <li>Retargeting</li>
            <li>Behavioral profiling</li>
            <li>Cross-service tracking</li>
          </ul>
          <p>
            Analytics related to extension usage are aggregated, anonymized, and
            limited to feature performance analysis only.
          </p>
        </Section>

        <Section
          icon={FileText}
          title="24. Compliance Statements (Copy-Paste Ready for Google Forms)"
        >
          <p className="mb-3">
            You can safely use the following statements in Google verification
            forms:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm font-mono text-gray-700 space-y-4">
            <p>
              “Zobsai complies with Google API Services User Data Policy,
              including the Limited Use requirements.”
            </p>
            <p>
              “Data accessed via Gmail OAuth and the Chrome Extension is used
              solely to provide user-facing features explicitly requested by the
              user and is not used for advertising or sold to third parties.”
            </p>
            <p>
              “Zobsai does not store browser session recordings or unrelated
              browsing data.”
            </p>
          </div>
        </Section>

        <Section icon={Mail} title="25. Contact for Google & Chrome Compliance">
          <p className="mb-2">
            For questions related to Google API or Chrome Extension compliance:
          </p>
          <ul className="list-none space-y-1">
            <li>
              <strong>Email:</strong>{' '}
              <a href="mailto:info@zobsai.com" className="text-blue-600">
                info@zobsai.com
              </a>
            </li>
            <li>
              <strong>DPO (EU/UK):</strong>{' '}
              <a href="mailto:info@zobsai.com" className="text-blue-600">
                info@zobsai.com
              </a>
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}
