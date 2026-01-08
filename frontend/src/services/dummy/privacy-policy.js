// // app/data/privacy-data.js

// import {
//   ShieldCheck,
//   Database,
//   Settings,
//   Share2,
//   Users,
//   FileClock,
//   Lock,
//   User,
//   UserCheck,
//   MapPin,
//   Globe,
//   RefreshCw,
//   Mail,
//   FileQuestion,
// } from 'lucide-react';

// export const privacyData = {
//   lastUpdated: 'January 08, 2026',
//   sections: [
//     {
//       id: 'introduction',
//       title: 'Introduction',
//       icon: ShieldCheck,
//       iconBgColor: 'bg-blue-50',
//       iconTextColor: 'text-blue-600',
//       content: [
//         {
//           type: 'paragraph',
//           text: 'Zobsai ("we", "us", "our") is committed to protecting your privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us at support@zobsai.com.',
//         },
//         {
//           type: 'paragraph',
//           text: 'When you visit our website at zobsai.com (the "Website"), use our web application (the "App"), or more generally, use any of our services (the "Services", which include the Website and App), you are trusting us with your personal information. We take this responsibility seriously. If any part of this privacy notice is unacceptable to you, please stop using our Services immediately.',
//         },
//       ],
//     },
//     {
//       id: 'info-collection',
//       title: '1. What Information Do We Collect?',
//       icon: Database,
//       iconBgColor: 'bg-lime-50',
//       iconTextColor: 'text-lime-600',
//       content: [
//         {
//           type: 'subheading',
//           text: 'In Short: We collect personal information that you provide to us, information collected automatically as you use our Services, and data accessed through authorized integrations like Gmail.',
//         },
//         {
//           type: 'nestedList',
//           title: 'Personal Information You Disclose to Us',
//           items: [
//             {
//               title: 'Personal Identifiers:',
//               text: 'Names, phone numbers, email addresses, mailing addresses, usernames, passwords, and contact preferences.',
//             },
//             {
//               title: 'Professional and Educational Information:',
//               text: 'Employment history, job titles, skills, resume details, LinkedIn profile data, cover letters, and references.',
//             },
//             {
//               title: 'Payment Data:',
//               text: 'We collect billing addresses and payment instrument details through our payment processor, Stripe. We do not retain card details.',
//             },
//             {
//               title: 'Gmail Integration Data:',
//               text: 'If authorized via OAuth, we may read and write to your Gmail account to scan for job opportunities, draft applications, and send responses. Access is strictly limited to the scopes you grant.',
//             },
//           ],
//         },
//         {
//           type: 'paragraph',
//           text: 'We also automatically collect Device and Usage Data as you interact with our Services using cookies and similar technologies, including IP address, browser type, and pages viewed.',
//         },
//       ],
//     },
//     {
//       id: 'info-usage',
//       title: '2. How Do We Use Your Information?',
//       icon: Settings,
//       iconBgColor: 'bg-purple-50',
//       iconTextColor: 'text-purple-600',
//       content: [
//         {
//           type: 'subheading',
//           text: 'In Short: We use your information to provide, improve, and secure our AI-powered Services, including automated job applications via Gmail integration.',
//         },
//         {
//           type: 'paragraph',
//           text: 'We process your information for legitimate business purposes, including: Account Management, Service Delivery (AI features), Personalization, Communications, Payments, Analytics, Marketing, and Legal Compliance.',
//         },
//       ],
//     },
//     {
//       id: 'info-sharing',
//       title: '3. Will Your Information Be Shared?',
//       icon: Share2,
//       iconBgColor: 'bg-teal-50',
//       iconTextColor: 'text-teal-600',
//       content: [
//         {
//           type: 'subheading',
//           text: 'In Short: We share information only with consent, for legal reasons, to deliver Services (e.g., job submissions), protect rights, or meet business needs.',
//         },
//         {
//           type: 'paragraph',
//           text: 'We may disclose information to our internal teams, during business transactions, with service providers (e.g., AWS, Stripe), with ad partners (e.g., Google, Meta), and with employers when you use auto-submission features.',
//         },
//       ],
//     },
//     {
//       id: 'who-sharing',
//       title: '4. Who Will Your Information Be Shared With?',
//       icon: Users,
//       iconBgColor: 'bg-pink-50',
//       iconTextColor: 'text-pink-600',
//       content: [
//         {
//           type: 'subheading',
//           text: 'In Short: We share with specific categories of third parties as needed.',
//         },
//         {
//           type: 'paragraph',
//           text: 'Categories include: Ad Networks, Payment Processors, Social Networks (for OAuth), Cloud Computing Services, and Job Platform Partners.',
//         },
//       ],
//     },
//     {
//       id: 'info-retention',
//       title: '5. How Long Do We Keep Your Information?',
//       icon: FileClock,
//       iconBgColor: 'bg-orange-50',
//       iconTextColor: 'text-orange-600',
//       content: [
//         {
//           type: 'subheading',
//           text: 'In Short: We retain information only as long as needed for our purposes or required by law, generally up to 2 years post-account closure for anonymized AI training data.',
//         },
//         {
//           type: 'paragraph',
//           text: 'We retain your profile and professional information for the duration of your active account plus 1 year after closure. Anonymized analytics data may be kept for up to 2 years.',
//         },
//       ],
//     },
//     {
//       id: 'info-safety',
//       title: '6. How Do We Keep Your Information Safe?',
//       icon: Lock,
//       iconBgColor: 'bg-amber-50',
//       iconTextColor: 'text-amber-600',
//       content: [
//         {
//           type: 'subheading',
//           text: 'In Short: We use robust technical and organizational measures to protect your data, including encryption for Gmail transmissions and AI processing.',
//         },
//         {
//           type: 'paragraph',
//           text: 'Our safeguards include AES-256 encryption, role-based access controls, and regular security audits. However, no online service is 100% secure.',
//         },
//       ],
//     },
//     {
//       id: 'minors-info',
//       title: '7. Do We Collect Information From Minors?',
//       icon: User,
//       iconBgColor: 'bg-red-50',
//       iconTextColor: 'text-red-600',
//       content: [
//         {
//           type: 'subheading',
//           text: 'In Short: No, we do not knowingly collect data from or target children under 18.',
//         },
//         {
//           type: 'paragraph',
//           text: 'Users must be 18 years of age or older. If we discover we have collected data from an underage user, we will take immediate steps to delete it.',
//         },
//       ],
//     },
//     {
//       id: 'privacy-rights',
//       title: '8. What Are Your Privacy Rights?',
//       icon: UserCheck,
//       iconBgColor: 'bg-green-50',
//       iconTextColor: 'text-green-600',
//       content: [
//         {
//           type: 'subheading',
//           text: 'In Short: You have rights to access, delete, correct, and opt out of certain processing, depending on your location.',
//         },
//         {
//           type: 'paragraph',
//           text: 'Under laws like GDPR and CCPA, you have the right to access, correct, or delete your data. You can also opt out of targeted advertising and certain uses of sensitive data. To exercise your rights, please email us at support@zobsai.com.',
//         },
//       ],
//     },
//     {
//       id: 'california-residents',
//       title: '9. Disclosures for California Residents',
//       icon: MapPin,
//       iconBgColor: 'bg-yellow-50',
//       iconTextColor: 'text-yellow-600',
//       content: [
//         {
//           type: 'subheading',
//           text: 'In Short: Yes, additional CCPA disclosures apply regarding the collection and "sale/sharing" of personal information for advertising purposes.',
//         },
//         {
//           type: 'table',
//           headers: [
//             'Personal Information Category',
//             'Third Parties We Share With',
//           ],
//           rows: [
//             [
//               'Personal identifiers (name, IP, email, etc.)',
//               'Ad networks (Google, Meta)',
//             ],
//             ['California Customer Records (employment history)', 'Ad networks'],
//             ['Commercial information (purchases)', 'Ad networks'],
//             ['Internet activity (browsing, searches)', 'Ad networks'],
//             [
//               'Professional/employment info (resumes, skills)',
//               'Ad networks, job partners',
//             ],
//             ['Inferences (profiles from AI)', 'Ad networks'],
//           ],
//         },
//       ],
//     },
//     {
//       id: 'third-party-links',
//       title: '10. Third-Party Websites & Integrations',
//       icon: Globe,
//       iconBgColor: 'bg-sky-50',
//       iconTextColor: 'text-sky-600',
//       content: [
//         {
//           type: 'paragraph',
//           text: 'We link to and integrate with third parties like Gmail, LinkedIn, and job boards. We are not responsible for their privacy practices and encourage you to review their policies.',
//         },
//       ],
//     },
//     {
//       id: 'updates',
//       title: '11. Updates to This Notice',
//       icon: RefreshCw,
//       iconBgColor: 'bg-gray-100',
//       iconTextColor: 'text-gray-600',
//       content: [
//         {
//           type: 'subheading',
//           text: 'In Short: Yes, we will update this notice as our practices may change and as necessary to stay compliant with relevant laws.',
//         },
//         {
//           type: 'paragraph',
//           text: 'The updated version will be indicated by the "Updated" date at the top. We encourage you to review this notice frequently.',
//         },
//       ],
//     },
//     {
//       id: 'contact',
//       title: '12. How to Contact Us',
//       icon: Mail,
//       iconBgColor: 'bg-blue-50',
//       iconTextColor: 'text-blue-600',
//       content: [
//         {
//           type: 'paragraph',
//           text: 'If you have questions or comments about this notice, you may email us at support@zobsai.com. For EU/UK residents, you may also contact our Data Protection Officer (DPO) at dpo@zobsai.com.',
//         },
//       ],
//     },
//   ],
// };

import {
  ShieldCheck,
  Database,
  Settings,
  CreditCard,
  Clock,
  Users,
  Globe,
  UserCheck,
  Cookie,
  Bot,
  Baby,
  Scale,
  RefreshCw,
  Mail,
  Chrome,
  Lock,
  FileCheck,
} from 'lucide-react';

export const privacyData = {
  lastUpdated: 'January 08, 2026',

  sections: [
    /* ------------------------------------------------------------------ */
    {
      id: 'data-controller',
      title: '1. Data Controller (Article 13(1)(a))',
      icon: ShieldCheck,
      iconBgColor: 'bg-blue-50',
      iconTextColor: 'text-blue-600',
      content: [
        {
          type: 'paragraph',
          text: 'The data controller responsible for your personal data is Zobsai.',
        },
        {
          type: 'paragraph',
          text: 'Owned and operated by Waygood EdTech Private Limited, incorporated under the Companies Act, 2013, India.',
        },
        {
          type: 'paragraph',
          text: 'Registered Jurisdiction: Delhi, India',
        },
        {
          type: 'paragraph',
          text: 'Website: https://zobsai.com',
        },
        {
          type: 'paragraph',
          text: 'Email: info@zobsai.com',
        },
        {
          type: 'paragraph',
          text: 'For EU/UK users: Data Protection Officer (DPO): info@zobsai.com',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'categories-data',
      title: '2. Categories of Personal Data We Collect (Article 13(1)(c))',
      icon: Database,
      iconBgColor: 'bg-lime-50',
      iconTextColor: 'text-lime-600',
      content: [
        {
          type: 'nestedList',
          title: 'A. Data You Provide Directly',
          items: [
            {
              title: 'Personal identifiers:',
              text: 'Name, email, phone number, address, login credentials.',
            },
            {
              title: 'Professional information:',
              text: 'Resumes, skills, job history, LinkedIn data.',
            },
            {
              title: 'Application content:',
              text: 'Cover letters, job preferences, references.',
            },
          ],
        },
        {
          type: 'nestedList',
          title: 'B. Data Collected Automatically',
          items: [
            {
              title: 'Device data:',
              text: 'IP address, browser type, operating system.',
            },
            {
              title: 'Usage data:',
              text: 'Logs, feature interactions, timestamps.',
            },
            {
              title: 'Tracking data:',
              text: 'Cookies and session identifiers.',
            },
          ],
        },
        {
          type: 'nestedList',
          title: 'C. Gmail Integration Data',
          items: [
            {
              title: 'OAuth-scoped access:',
              text: 'Email metadata and content limited strictly to granted scopes.',
            },
            {
              title: 'Purpose limitation:',
              text: 'Drafting, reading, and sending job-related emails only.',
            },
          ],
        },
        {
          type: 'nestedList',
          title: 'D. Chrome Extension Data',
          items: [
            {
              title: 'Permitted access:',
              text: 'Job postings, application forms, AI-assisted automation.',
            },
            {
              title: 'No session recording:',
              text: 'We do not store full browser sessions, browsing history, or unrelated data.',
            },
            {
              title: 'Conditional collection:',
              text: 'Limited browser data may be processed only to deliver a user-requested feature.',
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'purposes',
      title: '3. Purposes of Processing (Article 13(1)(c))',
      icon: Settings,
      iconBgColor: 'bg-purple-50',
      iconTextColor: 'text-purple-600',
      content: [
        {
          type: 'nestedList',
          title: 'We process personal data for:',
          items: [
            {
              title: 'Account management:',
              text: 'Account creation and maintenance.',
            },
            {
              title: 'AI services:',
              text: 'Job discovery, drafting, and automated applications.',
            },
            {
              title: 'Gmail features:',
              text: 'Job-related email drafting and sending.',
            },
            {
              title: 'Analytics:',
              text: 'Improving Services, AI models, and user experience.',
            },
            { title: 'Support:', text: 'Customer support and communications.' },
            { title: 'Marketing:', text: 'Only with explicit consent.' },
            {
              title: 'Security:',
              text: 'Fraud prevention and legal compliance.',
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'legal-basis',
      title: '4. Legal Basis for Processing (Article 13(1)(c))',
      icon: Scale,
      iconBgColor: 'bg-indigo-50',
      iconTextColor: 'text-indigo-600',
      content: [
        {
          type: 'nestedList',
          title: 'Lawful bases under GDPR:',
          items: [
            {
              title: 'Consent:',
              text: 'Gmail access, Chrome extension usage, marketing.',
            },
            {
              title: 'Contractual necessity:',
              text: 'To provide requested Services.',
            },
            {
              title: 'Legitimate interests:',
              text: 'Analytics, security, fraud prevention.',
            },
            {
              title: 'Legal obligation:',
              text: 'Tax, accounting, and regulatory compliance.',
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'payments',
      title: '5. Payment Processing (Article 13(1)(e))',
      icon: CreditCard,
      iconBgColor: 'bg-emerald-50',
      iconTextColor: 'text-emerald-600',
      content: [
        {
          type: 'paragraph',
          text: 'Payments are processed securely through Razorpay and Stripe.',
        },
        {
          type: 'paragraph',
          text: 'We do not store full card or bank details. All transactions comply with PCI-DSS standards.',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'retention',
      title: '6. Data Retention Period (Article 13(2)(a))',
      icon: Clock,
      iconBgColor: 'bg-orange-50',
      iconTextColor: 'text-orange-600',
      content: [
        {
          type: 'nestedList',
          title: 'Retention limits:',
          items: [
            {
              title: 'Account data:',
              text: 'Active account + up to 10 years.',
            },
            { title: 'Payment records:', text: 'As required by Indian law.' },
            { title: 'Anonymized analytics:', text: 'Up to 10 years.' },
            {
              title: 'User requests:',
              text: 'Earlier deletion where legally permitted.',
            },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'recipients',
      title: '7. Data Recipients (Article 13(1)(e))',
      icon: Users,
      iconBgColor: 'bg-pink-50',
      iconTextColor: 'text-pink-600',
      content: [
        {
          type: 'paragraph',
          text: 'We may share data with cloud providers, payment processors, OAuth providers, employers (when initiated), and regulators.',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'international',
      title: '8. International Data Transfers (Article 13(1)(f))',
      icon: Globe,
      iconBgColor: 'bg-sky-50',
      iconTextColor: 'text-sky-600',
      content: [
        {
          type: 'paragraph',
          text: 'Data may be transferred outside the EU/EEA including to India and the United States, using safeguards such as SCCs.',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'gdpr-rights',
      title: '9. Your GDPR Rights (Article 13(2)(b–d))',
      icon: UserCheck,
      iconBgColor: 'bg-green-50',
      iconTextColor: 'text-green-600',
      content: [
        {
          type: 'nestedList',
          title: 'Your rights include:',
          items: [
            { title: 'Access:', text: 'Request access to your data.' },
            { title: 'Rectification:', text: 'Correct inaccurate data.' },
            { title: 'Erasure:', text: 'Right to be forgotten.' },
            { title: 'Restriction:', text: 'Limit processing.' },
            { title: 'Portability:', text: 'Receive your data.' },
            { title: 'Withdraw consent:', text: 'At any time.' },
          ],
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'cookies',
      title: '10. Cookies and Tracking',
      icon: Cookie,
      iconBgColor: 'bg-yellow-50',
      iconTextColor: 'text-yellow-600',
      content: [
        {
          type: 'paragraph',
          text: 'We use cookies for sessions, analytics, and platform improvement. You may disable cookies in browser settings.',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'automation',
      title: '11. Automated Decision-Making',
      icon: Bot,
      iconBgColor: 'bg-gray-100',
      iconTextColor: 'text-gray-600',
      content: [
        {
          type: 'paragraph',
          text: 'AI automation assists job recommendations and drafting but does not produce legal effects without user initiation.',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'children',
      title: '12. Children’s Data',
      icon: Baby,
      iconBgColor: 'bg-red-50',
      iconTextColor: 'text-red-600',
      content: [
        {
          type: 'paragraph',
          text: 'Services are intended for users 18+. We do not knowingly collect data from minors.',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'updates',
      title: '15. Updates to This Policy',
      icon: RefreshCw,
      iconBgColor: 'bg-gray-100',
      iconTextColor: 'text-gray-600',
      content: [
        {
          type: 'paragraph',
          text: 'We may update this policy. Material changes are reflected in the Last Updated date.',
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'contact',
      title: '16. Contact Information',
      icon: Mail,
      iconBgColor: 'bg-blue-50',
      iconTextColor: 'text-blue-600',
      content: [
        {
          type: 'paragraph',
          text: 'Email: support@zobsai.com | DPO (EU/UK): dpo@zobsai.com',
        },
      ],
    },
  ],
};
