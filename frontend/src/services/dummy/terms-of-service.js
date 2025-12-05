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
  RefreshCw,
} from 'lucide-react';

export const termsData = {
  lastUpdated: 'September 22, 2025',
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
          text: 'These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and ZobsAI. (brand owned by Waygood Edtech Private Limited) (“we”, “us”, or “our”), concerning your access to and use of the <a href="https://zobsai.com" style="color: blue; text-decoration: underline">zobsai.com</a> website, chrome extensions, applications, AI-powered tools, and any other media form, media channel, mobile website, or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”). You agree that by accessing the Site, you have read, understood, and agreed to be bound by all of these Terms of Use. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF USE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.',
        },
        {
          type: 'paragraph',
          text: 'The Site is intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Site.',
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
          text: 'Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, graphics, AI algorithms, machine learning models, and any other technological components on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.',
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
          text: 'By using the Site, you represent and warrant that: you have the legal capacity and you agree to comply with these Terms of Use; you are not a minor in the jurisdiction in which you reside; you will not access the Site through automated or non-human means, whether through a bot, script, or otherwise, except as explicitly permitted for integration with authorized third-party services like Gmail; you will not use the Site for any illegal or unauthorized purpose; and your use of the Site will not violate any applicable law or regulation.',
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
          text: 'You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us. As a user of the Site, you agree not to:',
        },
        {
          type: 'list',
          items: [
            'Systematically retrieve data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.',
            'Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.',
            'Circumvent, disable, or otherwise interfere with security-related features of the Site.',
            'Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Site.',
            'Use any information obtained from the Site in order to harass, abuse, or harm another person.',
            'Engage in unauthorized framing of or linking to the Site.',
            'Upload or transmit viruses, Trojan horses, or other malicious material.',
            'Attempt to impersonate another user or person or use the username of another user.',
            "Use the Site's AI features to generate or submit job applications in a manner that violates any job board's terms, spams employers, or misrepresents your qualifications.",
          ],
        },
      ],
    },
    {
      id: 'contributions',
      title: 'User Generated Contributions',
      icon: PenSquare,
      iconBgColor: 'bg-indigo-50',
      iconTextColor: 'text-indigo-600',
      content: [
        {
          type: 'paragraph',
          text: 'The Site may invite you to chat, contribute to, or participate in blogs, message boards, and other functionality, and may provide you with the opportunity to create, submit, post, display, or broadcast content and materials to us or on the Site ("Contributions"). Contributions may be viewable by other users. When you create Contributions, you represent and warrant that they do not infringe on any third-party rights and are not false, inaccurate, misleading, or otherwise objectionable.',
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
          text: 'Access to the Site, or certain features, may require you to pay fees. Before you incur any fees, you will have the opportunity to review them. Recurring subscriptions will automatically renew unless canceled at least 24 hours before the end of the current period. Payment processing is managed by third-party services like Stripe Inc.',
        },
      ],
    },
    {
      id: 'cancellation-policy',
      title: 'Cancellation Policy',
      icon: FileX,
      iconBgColor: 'bg-gray-100',
      iconTextColor: 'text-gray-600',
      content: [
        {
          type: 'paragraph',
          text: 'You have the flexibility to cancel your recurring subscription at any time. The cancellation will take effect at the end of your current billing period. You must cancel your subscription yourself by going to the integrated Stripe portal on your Account page. Canceling your account does not automatically entitle you to a refund.',
        },
      ],
    },
    {
      id: 'refund-policy',
      title: 'Refund Policy',
      icon: Receipt,
      iconBgColor: 'bg-cyan-50',
      iconTextColor: 'text-cyan-600',
      content: [
        {
          type: 'paragraph',
          text: 'All purchases made through the Site are final and non-refundable, except as specified or required by applicable law. To request a refund in exceptional cases, please contact us at support@zobsai.com within 7 days of the original purchase date. Refunds for forgetting to cancel a subscription are not guaranteed and are at our sole discretion. Weekly or short-term subscriptions are non-refundable.',
        },
      ],
    },
    {
      id: 'ai-usage',
      title: 'AI Usage Policy',
      icon: Bot,
      iconBgColor: 'bg-purple-50',
      iconTextColor: 'text-purple-600',
      content: [
        {
          type: 'paragraph',
          text: 'We employ advanced Artificial Intelligence (AI) technologies. We reserve the right to implement rate limiting or access restrictions to ensure fair use for all users. By enabling features like auto-application submission, you grant us permission to access your Gmail account with read/write privileges solely for job-application purposes. Any content generated by our AI tools is provided "AS IS" and should be reviewed by you before use.',
        },
      ],
    },
    {
      id: 'third-party',
      title: 'Third-Party Website and Content',
      icon: Globe,
      iconBgColor: 'bg-teal-50',
      iconTextColor: 'text-teal-600',
      content: [
        {
          type: 'paragraph',
          text: 'The Site may contain links to other websites ("Third-Party Websites") and content. We are not responsible for any Third-Party Websites accessed through the Site. If you decide to leave the Site and access Third-Party Websites, you do so at your own risk.',
        },
      ],
    },
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      icon: BookUser,
      iconBgColor: 'bg-pink-50',
      iconTextColor: 'text-pink-600',
      content: [
        {
          type: 'paragraph',
          text: 'We care about data privacy and security. By using the Site, you agree to be bound by our Privacy Policy posted on the Site, which is incorporated into these Terms of Use.',
        },
      ],
    },
    {
      id: 'governing-law',
      title: 'Governing Law & Dispute Resolution',
      icon: Scale,
      iconBgColor: 'bg-stone-100',
      iconTextColor: 'text-stone-600',
      content: [
        {
          type: 'paragraph',
          text: 'These Terms of Use are governed by the laws of the State of Delaware. To expedite resolution, the Parties agree to first attempt to negotiate any Dispute informally for at least thirty (30) days. If informal negotiations fail, the Dispute will be resolved through binding arbitration.',
        },
      ],
    },
    {
      id: 'disclaimer',
      title: 'Disclaimer',
      icon: AlertTriangle,
      iconBgColor: 'bg-yellow-50',
      iconTextColor: 'text-yellow-600',
      content: [
        {
          type: 'paragraph',
          text: 'THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SITE AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SITE AND YOUR USE THEREOF.',
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes to Terms',
      icon: RefreshCw,
      iconBgColor: 'bg-gray-100',
      iconTextColor: 'text-gray-600',
      content: [
        {
          type: 'paragraph',
          text: 'We reserve the right, in our sole discretion, to make changes or modifications to these Terms of Use at any time and for any reason. We will alert you about any changes by updating the “Last updated” date of these Terms of Use.',
        },
      ],
    },
  ],
};
