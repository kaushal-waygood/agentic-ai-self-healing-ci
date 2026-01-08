import {
  FileText,
  Copyright,
  UserCheck,
  ShieldAlert,
  PenSquare,
  DollarSign,
  FileX,
  Receipt,
  Bot,
  Globe,
  BookUser,
  Scale,
  AlertTriangle,
  ShieldBan,
  Shield,
  Database,
  Mail,
  MapPin,
  MoreHorizontal,
  Flag,
  Power,
  WifiOff,
  MessageSquare,
  Lightbulb,
  Settings,
  Eraser,
  Gavel,
  Info, // Added for Overview
  Layers, // Added for Entire Agreement
  Scissors,
  RefreshCw, // Added for Severability
} from 'lucide-react';

export const termsData = {
  lastUpdated: 'January 8, 2026',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: FileText,
      iconBgColor: 'bg-blue-50',
      iconTextColor: 'text-blue-600',
      content: [
        {
          type: 'paragraph',
          text: 'These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and <b>Waygood EdTech Private Limited</b>, a private limited company incorporated under the laws of India, with its registered office and jurisdiction in <b>Delhi, India</b> (“we”, “us”, or “our”), concerning your access to and use of the zobsai.com website, Chrome extensions, applications, AI-powered tools, and any other media form, media channel, mobile website, or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).',
        },
        {
          type: 'paragraph',
          text: 'You agree that by accessing the Site, you have read, understood, and agreed to be bound by all of these Terms of Use. <b>IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF USE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.</b>',
        },
        {
          type: 'paragraph',
          text: 'Supplemental terms and conditions or documents that may be posted on the Site from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Terms of Use at any time and for any reason. We will alert you about any changes by updating the “Last Updated” date of these Terms of Use, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Terms of Use to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Terms of Use by your continued use of the Site after the date such revised Terms of Use are posted.',
        },
        {
          type: 'paragraph',
          text: 'The information provided on the Site is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Site from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.',
        },
        {
          type: 'paragraph',
          text: 'The Site is not tailored to comply with industry-specific regulations (such as HIPAA, FISMA, or GLBA). If your use of the Site would be subject to such laws, you may not use the Site.',
        },
        {
          type: 'paragraph',
          text: 'The Site is intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Site.',
        },
      ],
    },
    {
      id: 'overview',
      title: 'Overview',
      icon: Info,
      iconBgColor: 'bg-indigo-50',
      iconTextColor: 'text-indigo-600',
      content: [
        {
          type: 'paragraph',
          text: 'This Site is operated by Waygood EdTech Private Limited. Throughout the Site, the terms “we”, “us”, and “our” refer to Waygood EdTech Private Limited, operating the brand name zobsAI. Waygood EdTech Private Limited offers this Site, including all information, tools, AI-powered services, and features available from this Site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated herein.',
        },
        {
          type: 'paragraph',
          text: 'By visiting our Site and/or purchasing or subscribing to any service, you engage in our “Service” and agree to be bound by these Terms of Use, including additional terms and policies referenced herein or available by hyperlink.',
        },
        {
          type: 'paragraph',
          text: 'These Terms of Use apply to all users of the Site, including browsers, registered users, customers, subscribers, and contributors of content.',
        },
      ],
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property Rights',
      icon: Copyright,
      iconBgColor: 'bg-amber-50',
      iconTextColor: 'text-amber-600',
      content: [
        {
          type: 'paragraph',
          text: 'Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, graphics, AI algorithms, machine learning models, and other technological components (collectively, the “Content”) and the trademarks, service marks, and logos (the “Marks”) are owned or controlled by us or licensed to us, and are protected by applicable intellectual property laws.',
        },
        {
          type: 'paragraph',
          text: 'The Content and the Marks are provided on the Site “AS IS” for your information and personal use only. Except as expressly provided in these Terms of Use, no part of the Site and no Content or Marks may be copied, reproduced, republished, distributed, sold, licensed, or otherwise exploited for any commercial purpose without our express prior written permission.',
        },
        {
          type: 'paragraph',
          text: 'Provided that you are eligible to use the Site, you are granted a limited, non-exclusive, non-transferable license to access and use the Site solely for your personal, non-commercial use. This license does not extend to AI-generated outputs, which remain subject to the AI Usage Policy below.',
        },
      ],
    },
    {
      id: 'user-representations',
      title: 'User Representations',
      icon: UserCheck,
      iconBgColor: 'bg-green-50',
      iconTextColor: 'text-green-600',
      content: [
        {
          type: 'paragraph',
          text: 'By using the Site, you represent and warrant that:',
        },
        {
          type: 'list',
          items: [
            'You have the legal capacity to enter into these Terms of Use;',
            'You are not a minor in your jurisdiction;',
            'You will not access the Site through unauthorized automated means;',
            'You will not use the Site for any illegal or unauthorized purpose; and',
            'Your use of the Site will comply with all applicable laws and regulations.',
          ],
        },
        {
          type: 'paragraph',
          text: 'If any information you provide is untrue, inaccurate, not current, or incomplete, we reserve the right to suspend or terminate your account.',
        },
      ],
    },
    {
      id: 'online-service-terms',
      title: 'Online Service Terms',
      icon: Globe,
      iconBgColor: 'bg-cyan-50',
      iconTextColor: 'text-cyan-600',
      content: [
        {
          type: 'paragraph',
          text: 'You may not use the Site, Services, or AI features for any illegal or unauthorized purpose, nor may you violate any laws in your jurisdiction, including employment, consumer protection, or intellectual property laws.',
        },
        {
          type: 'paragraph',
          text: 'Transmission of malware, worms, viruses, or destructive code is strictly prohibited and may result in immediate termination.',
        },
      ],
    },
    {
      id: 'prohibited-activities',
      title: 'Prohibited Activities',
      icon: ShieldAlert,
      iconBgColor: 'bg-red-50',
      iconTextColor: 'text-red-600',
      content: [
        {
          type: 'paragraph',
          text: 'You may not access or use the Site for any purpose other than that for which we make it available. Prohibited activities include, but are not limited to:',
        },
        {
          type: 'list',
          items: [
            'Systematic data scraping or data mining;',
            'Circumventing security features;',
            'Harassing, abusing, or harming others;',
            'Uploading malicious software;',
            'Reverse engineering any AI models or software;',
            'Unauthorized commercial use of the Site;',
            'Misuse of AI features, including automated job applications that violate third-party terms or misrepresent qualifications.',
          ],
        },
      ],
    },
    {
      id: 'user-contributions',
      title: 'User Generated Contributions',
      icon: PenSquare,
      iconBgColor: 'bg-purple-50',
      iconTextColor: 'text-purple-600',
      content: [
        {
          type: 'paragraph',
          text: 'The Site may allow you to submit content including text, resumes, job data, comments, or other materials (“Contributions”). Contributions may be visible to other users and third parties.',
        },
        {
          type: 'paragraph',
          text: 'You represent and warrant that your Contributions are lawful, accurate, non-infringing, and do not violate the rights of others. Any violation may result in termination of access.',
        },
      ],
    },
    {
      id: 'payment-terms',
      title: 'Payment Terms',
      icon: DollarSign,
      iconBgColor: 'bg-lime-50',
      iconTextColor: 'text-lime-600',
      content: [
        {
          type: 'paragraph',
          text: 'Certain features require payment, including subscriptions and one-time fees. All fees are disclosed prior to purchase.',
        },
        {
          type: 'paragraph',
          text: 'Recurring subscriptions automatically renew unless canceled at least 24 hours before the billing cycle ends. Payments are processed by third-party providers such as Stripe.',
        },
      ],
    },
    {
      id: 'refund-policy',
      title: 'Refund Policy',
      icon: Receipt,
      iconBgColor: 'bg-teal-50',
      iconTextColor: 'text-teal-600',
      content: [
        {
          type: 'paragraph',
          text: 'All purchases are final and non-refundable except where required by law or explicitly stated otherwise. Refund requests must be submitted to support@zobsai.com within the applicable timeframe.',
        },
      ],
    },
    {
      id: 'ai-usage',
      title: 'AI Usage Policy',
      icon: Bot,
      iconBgColor: 'bg-pink-50',
      iconTextColor: 'text-pink-600',
      content: [
        {
          type: 'paragraph',
          text: 'AI features are provided subject to fair use and rate limits. “Unlimited” access refers to reasonable usage within system constraints.',
        },
        {
          type: 'paragraph',
          text: 'AI-generated content is provided “AS IS” and must be reviewed by you before use. We disclaim liability for outcomes resulting from AI-generated content.',
        },
      ],
    },
    {
      id: 'third-party',
      title: 'Third-Party Websites and Tools',
      icon: Globe,
      iconBgColor: 'bg-blue-50',
      iconTextColor: 'text-blue-500',
      content: [
        {
          type: 'paragraph',
          text: 'The Site may link to third-party websites or tools. We are not responsible for third-party content, services, or privacy practices. Use of third-party tools is at your own risk.',
        },
      ],
    },
    {
      id: 'site-management',
      title: 'Site Management',
      icon: Settings,
      iconBgColor: 'bg-gray-200',
      iconTextColor: 'text-gray-700',
      content: [
        {
          type: 'paragraph',
          text: 'We reserve the right to monitor the Site, restrict access, remove content, or take legal action against violations of these Terms.',
        },
      ],
    },
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      icon: BookUser,
      iconBgColor: 'bg-orange-50',
      iconTextColor: 'text-orange-600',
      content: [
        {
          type: 'paragraph',
          text: 'Your use of the Site is governed by our Privacy Policy, which is incorporated herein by reference. Data may be processed in the United States.',
        },
      ],
    },
    {
      id: 'term-termination',
      title: 'Term and Termination',
      icon: Power,
      iconBgColor: 'bg-red-100',
      iconTextColor: 'text-red-600',
      content: [
        {
          type: 'paragraph',
          text: 'These Terms remain in effect while you use the Site. We may terminate or suspend access at any time for violations or business reasons.',
        },
      ],
    },
    {
      id: 'governing-law',
      title: 'Governing Law',
      icon: Scale,
      iconBgColor: 'bg-stone-100',
      iconTextColor: 'text-stone-600',
      content: [
        {
          type: 'paragraph',
          text: 'These Terms are governed by and construed in accordance with the laws of <b>India</b>, with exclusive jurisdiction in the courts of <b>Delhi, India</b>, without regard to conflict of law principles.',
        },
      ],
    },
    {
      id: 'dispute-resolution',
      title: 'Dispute Resolution',
      icon: Gavel,
      iconBgColor: 'bg-slate-50',
      iconTextColor: 'text-slate-600',
      content: [
        {
          type: 'paragraph',
          text: 'Disputes will be resolved through binding arbitration administered by the American Arbitration Association, except where prohibited by law.',
        },
      ],
    },
    {
      id: 'disclaimer',
      title: 'Disclaimer of Warranties',
      icon: AlertTriangle,
      iconBgColor: 'bg-yellow-50',
      iconTextColor: 'text-yellow-600',
      content: [
        {
          type: 'paragraph',
          text: 'THE SITE IS PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS. WE DISCLAIM ALL WARRANTIES TO THE FULLEST EXTENT PERMITTED BY LAW.',
        },
      ],
    },
    {
      id: 'limitation-liability',
      title: 'Limitation of Liability',
      icon: ShieldBan,
      iconBgColor: 'bg-red-50',
      iconTextColor: 'text-red-700',
      content: [
        {
          type: 'paragraph',
          text: 'OUR LIABILITY SHALL BE LIMITED TO THE AMOUNT PAID BY YOU TO US IN THE SIX (6) MONTHS PRIOR TO THE CLAIM.',
        },
      ],
    },
    {
      id: 'indemnification',
      title: 'Indemnification',
      icon: Shield,
      iconBgColor: 'bg-emerald-50',
      iconTextColor: 'text-emerald-600',
      content: [
        {
          type: 'paragraph',
          text: 'You agree to indemnify and hold harmless Waygood EdTech Private Limited (operating under the brand name zobsAI) from claims arising from your use of the Site or violation of these Terms.',
        },
      ],
    },
    {
      id: 'severability',
      title: 'Severability',
      icon: Scissors,
      iconBgColor: 'bg-gray-100',
      iconTextColor: 'text-gray-600',
      content: [
        {
          type: 'paragraph',
          text: 'If any provision of these Terms is held unenforceable, the remaining provisions shall remain in full force and effect.',
        },
      ],
    },
    {
      id: 'entire-agreement',
      title: 'Entire Agreement',
      icon: Layers,
      iconBgColor: 'bg-blue-100',
      iconTextColor: 'text-blue-600',
      content: [
        {
          type: 'paragraph',
          text: 'These Terms, together with all incorporated policies, constitute the entire agreement between you and Waygood EdTech Private Limited (operating under the brand name zobsAI).',
        },
      ],
    },
    {
      id: 'changes-to-terms',
      title: 'Changes to Terms',
      icon: RefreshCw,
      iconBgColor: 'bg-orange-100',
      iconTextColor: 'text-orange-600',
      content: [
        {
          type: 'paragraph',
          text: 'We reserve the right to update these Terms at any time. Continued use of the Site constitutes acceptance of updated Terms.',
        },
      ],
    },
    // {
    //   id: 'contact-us',
    //   title: 'Contact Us',
    //   icon: Mail,
    //   iconBgColor: 'bg-blue-50',
    //   iconTextColor: 'text-blue-600',
    //   content: [
    //     {
    //       type: 'paragraph',
    //       text: 'For questions or complaints, contact us at <a href="mailto:info@zobsai.com" className="text-blue-600 underline">info@zobsai.com</a>.',
    //     },
    //   ],
    // },
  ],
};
