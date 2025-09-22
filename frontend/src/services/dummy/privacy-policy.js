// app/data/privacy-data.js

import {
  ShieldCheck,
  Database,
  Settings,
  Share2,
  Users,
  FileClock,
  Lock,
  User,
  UserCheck,
  MapPin,
  Globe,
  RefreshCw,
  Mail,
  FileQuestion,
} from 'lucide-react';

export const privacyData = {
  lastUpdated: 'September 22, 2025',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: ShieldCheck,
      iconBgColor: 'bg-blue-50',
      iconTextColor: 'text-blue-600',
      content: [
        {
          type: 'paragraph',
          text: 'Zobsai ("we", "us", "our") is committed to protecting your privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us at support@zobsai.com.',
        },
        {
          type: 'paragraph',
          text: 'When you visit our website at zobsai.com (the "Website"), use our web application (the "App"), or more generally, use any of our services (the "Services", which include the Website and App), you are trusting us with your personal information. We take this responsibility seriously. If any part of this privacy notice is unacceptable to you, please stop using our Services immediately.',
        },
      ],
    },
    {
      id: 'info-collection',
      title: '1. What Information Do We Collect?',
      icon: Database,
      iconBgColor: 'bg-lime-50',
      iconTextColor: 'text-lime-600',
      content: [
        {
          type: 'subheading',
          text: 'In Short: We collect personal information that you provide to us, information collected automatically as you use our Services, and data accessed through authorized integrations like Gmail.',
        },
        {
          type: 'nestedList',
          title: 'Personal Information You Disclose to Us',
          items: [
            {
              title: 'Personal Identifiers:',
              text: 'Names, phone numbers, email addresses, mailing addresses, usernames, passwords, and contact preferences.',
            },
            {
              title: 'Professional and Educational Information:',
              text: 'Employment history, job titles, skills, resume details, LinkedIn profile data, cover letters, and references.',
            },
            {
              title: 'Payment Data:',
              text: 'We collect billing addresses and payment instrument details through our payment processor, Stripe. We do not retain card details.',
            },
            {
              title: 'Gmail Integration Data:',
              text: 'If authorized via OAuth, we may read and write to your Gmail account to scan for job opportunities, draft applications, and send responses. Access is strictly limited to the scopes you grant.',
            },
          ],
        },
        {
          type: 'paragraph',
          text: 'We also automatically collect Device and Usage Data as you interact with our Services using cookies and similar technologies, including IP address, browser type, and pages viewed.',
        },
      ],
    },
    {
      id: 'info-usage',
      title: '2. How Do We Use Your Information?',
      icon: Settings,
      iconBgColor: 'bg-purple-50',
      iconTextColor: 'text-purple-600',
      content: [
        {
          type: 'subheading',
          text: 'In Short: We use your information to provide, improve, and secure our AI-powered Services, including automated job applications via Gmail integration.',
        },
        {
          type: 'paragraph',
          text: 'We process your information for legitimate business purposes, including: Account Management, Service Delivery (AI features), Personalization, Communications, Payments, Analytics, Marketing, and Legal Compliance.',
        },
      ],
    },
    {
      id: 'info-sharing',
      title: '3. Will Your Information Be Shared?',
      icon: Share2,
      iconBgColor: 'bg-teal-50',
      iconTextColor: 'text-teal-600',
      content: [
        {
          type: 'subheading',
          text: 'In Short: We share information only with consent, for legal reasons, to deliver Services (e.g., job submissions), protect rights, or meet business needs.',
        },
        {
          type: 'paragraph',
          text: 'We may disclose information to our internal teams, during business transactions, with service providers (e.g., AWS, Stripe), with ad partners (e.g., Google, Meta), and with employers when you use auto-submission features.',
        },
      ],
    },
    {
      id: 'who-sharing',
      title: '4. Who Will Your Information Be Shared With?',
      icon: Users,
      iconBgColor: 'bg-pink-50',
      iconTextColor: 'text-pink-600',
      content: [
        {
          type: 'subheading',
          text: 'In Short: We share with specific categories of third parties as needed.',
        },
        {
          type: 'paragraph',
          text: 'Categories include: Ad Networks, Payment Processors, Social Networks (for OAuth), Cloud Computing Services, and Job Platform Partners.',
        },
      ],
    },
    {
      id: 'info-retention',
      title: '5. How Long Do We Keep Your Information?',
      icon: FileClock,
      iconBgColor: 'bg-orange-50',
      iconTextColor: 'text-orange-600',
      content: [
        {
          type: 'subheading',
          text: 'In Short: We retain information only as long as needed for our purposes or required by law, generally up to 2 years post-account closure for anonymized AI training data.',
        },
        {
          type: 'paragraph',
          text: 'We retain your profile and professional information for the duration of your active account plus 1 year after closure. Anonymized analytics data may be kept for up to 2 years.',
        },
      ],
    },
    {
      id: 'info-safety',
      title: '6. How Do We Keep Your Information Safe?',
      icon: Lock,
      iconBgColor: 'bg-amber-50',
      iconTextColor: 'text-amber-600',
      content: [
        {
          type: 'subheading',
          text: 'In Short: We use robust technical and organizational measures to protect your data, including encryption for Gmail transmissions and AI processing.',
        },
        {
          type: 'paragraph',
          text: 'Our safeguards include AES-256 encryption, role-based access controls, and regular security audits. However, no online service is 100% secure.',
        },
      ],
    },
    {
      id: 'minors-info',
      title: '7. Do We Collect Information From Minors?',
      icon: User,
      iconBgColor: 'bg-red-50',
      iconTextColor: 'text-red-600',
      content: [
        {
          type: 'subheading',
          text: 'In Short: No, we do not knowingly collect data from or target children under 18.',
        },
        {
          type: 'paragraph',
          text: 'Users must be 18 years of age or older. If we discover we have collected data from an underage user, we will take immediate steps to delete it.',
        },
      ],
    },
    {
      id: 'privacy-rights',
      title: '8. What Are Your Privacy Rights?',
      icon: UserCheck,
      iconBgColor: 'bg-green-50',
      iconTextColor: 'text-green-600',
      content: [
        {
          type: 'subheading',
          text: 'In Short: You have rights to access, delete, correct, and opt out of certain processing, depending on your location.',
        },
        {
          type: 'paragraph',
          text: 'Under laws like GDPR and CCPA, you have the right to access, correct, or delete your data. You can also opt out of targeted advertising and certain uses of sensitive data. To exercise your rights, please email us at support@zobsai.com.',
        },
      ],
    },
    {
      id: 'california-residents',
      title: '9. Disclosures for California Residents',
      icon: MapPin,
      iconBgColor: 'bg-yellow-50',
      iconTextColor: 'text-yellow-600',
      content: [
        {
          type: 'subheading',
          text: 'In Short: Yes, additional CCPA disclosures apply regarding the collection and "sale/sharing" of personal information for advertising purposes.',
        },
        {
          type: 'table',
          headers: [
            'Personal Information Category',
            'Third Parties We Share With',
          ],
          rows: [
            [
              'Personal identifiers (name, IP, email, etc.)',
              'Ad networks (Google, Meta)',
            ],
            ['California Customer Records (employment history)', 'Ad networks'],
            ['Commercial information (purchases)', 'Ad networks'],
            ['Internet activity (browsing, searches)', 'Ad networks'],
            [
              'Professional/employment info (resumes, skills)',
              'Ad networks, job partners',
            ],
            ['Inferences (profiles from AI)', 'Ad networks'],
          ],
        },
      ],
    },
    {
      id: 'third-party-links',
      title: '10. Third-Party Websites & Integrations',
      icon: Globe,
      iconBgColor: 'bg-sky-50',
      iconTextColor: 'text-sky-600',
      content: [
        {
          type: 'paragraph',
          text: 'We link to and integrate with third parties like Gmail, LinkedIn, and job boards. We are not responsible for their privacy practices and encourage you to review their policies.',
        },
      ],
    },
    {
      id: 'updates',
      title: '11. Updates to This Notice',
      icon: RefreshCw,
      iconBgColor: 'bg-gray-100',
      iconTextColor: 'text-gray-600',
      content: [
        {
          type: 'subheading',
          text: 'In Short: Yes, we will update this notice as our practices may change and as necessary to stay compliant with relevant laws.',
        },
        {
          type: 'paragraph',
          text: 'The updated version will be indicated by the "Updated" date at the top. We encourage you to review this notice frequently.',
        },
      ],
    },
    {
      id: 'contact',
      title: '12. How to Contact Us',
      icon: Mail,
      iconBgColor: 'bg-blue-50',
      iconTextColor: 'text-blue-600',
      content: [
        {
          type: 'paragraph',
          text: 'If you have questions or comments about this notice, you may email us at support@zobsai.com. For EU/UK residents, you may also contact our Data Protection Officer (DPO) at dpo@zobsai.com.',
        },
      ],
    },
  ],
};
