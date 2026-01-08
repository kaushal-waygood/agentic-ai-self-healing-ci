import {
  Info,
  FileX,
  AlertTriangle,
  ClipboardList,
  Receipt,
  Ban,
  CreditCard,
  Scale,
  RefreshCw,
  Mail,
} from 'lucide-react';

export const cancellationRefundData = {
  lastUpdated: 'January 8, 2026',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: Info,
      iconBgColor: 'bg-blue-50',
      iconTextColor: 'text-blue-600',
      content: [
        {
          type: 'paragraph',
          text: 'Zobsai ("we", "us", or "our") is committed to delivering high-quality digital and AI-powered services that support users in their job search, career advancement, and application automation needs. To ensure transparency and a clear understanding of our practices, this Cancellation & Refund Policy outlines the terms governing service cancellations, refunds, and related processes.',
        },
        {
          type: 'paragraph',
          text: 'Please read this policy carefully before purchasing or using our Services, as it defines your rights and obligations with respect to cancellations, refunds, and dispute resolution.',
        },
      ],
    },
    {
      id: 'general-terms',
      title: '1. General Terms of Cancellation',
      icon: FileX,
      iconBgColor: 'bg-red-50',
      iconTextColor: 'text-red-600',
      content: [
        {
          type: 'paragraph',
          text: 'Once a service has been purchased and payment has been successfully processed, cancellations are generally not permitted. zobsAI operates a primarily non-cancellable service model due to the nature of our offerings, which may involve immediate access provisioning, AI processing, system resource allocation, and personalization.',
        },
        {
          type: 'paragraph',
          text: '<b>Non-cancellable services include, but are not limited to:</b>',
        },
        {
          type: 'list',
          items: [
            'AI-powered job matching and recommendations',
            'Resume analysis, optimization, and AI resume builder services',
            'Auto-application and job submission services',
            'Subscription-based access to premium features',
            'Career insights, analytics, and personalized recommendations',
          ],
        },
        {
          type: 'paragraph',
          text: 'These services often begin immediately upon purchase and therefore cannot be paused, reversed, or cancelled once initiated. However, limited exceptions may apply under specific circumstances, as outlined below.',
        },
      ],
    },
    {
      id: 'exceptional-circumstances',
      title: '2. Exceptional Circumstances for Cancellations',
      icon: AlertTriangle,
      iconBgColor: 'bg-amber-50',
      iconTextColor: 'text-amber-600',
      content: [
        {
          type: 'paragraph',
          text: 'zobsAI recognizes that exceptional and unforeseen circumstances may arise. Cancellation requests may be considered only under the following conditions:',
        },
        {
          type: 'list',
          items: [
            '<b>Service Unavailability:</b> If a purchased service is materially unavailable due to a verified technical failure attributable to zobsAI.',
            '<b>Duplicate Transactions:</b> If you are charged more than once for the same service due to a system or payment processing error.',
          ],
        },
        {
          type: 'paragraph',
          text: 'All cancellation requests are reviewed on a case-by-case basis. zobsAI reserves the sole discretion to approve or deny any cancellation request that does not fall within the exceptions listed above.',
        },
      ],
    },
    {
      id: 'cancellation-procedure',
      title: '3. Cancellation Request Procedure',
      icon: ClipboardList,
      iconBgColor: 'bg-indigo-50',
      iconTextColor: 'text-indigo-600',
      content: [
        {
          type: 'paragraph',
          text: 'If you believe your situation qualifies under the exceptional circumstances described above, you must follow the process below:',
        },
        {
          type: 'list',
          items: [
            '<b>Written Request:</b> Submit a cancellation request via email to info@zobsai.com.',
            '<b>Required Details:</b> Your request must include your full name, registered email address, transaction ID, service purchased, and a detailed explanation of the reason for cancellation.',
            '<b>Supporting Evidence:</b> Provide any relevant supporting documentation or screenshots, where applicable.',
            '<b>Review Period:</b> zobsAI will review the request after receipt of all required information. The review process may take up to 10 business days.',
            '<b>Final Decision:</b> You will be notified in writing of the outcome. zobsAI’s decision shall be final and binding.',
          ],
        },
      ],
    },
    {
      id: 'refund-policy',
      title: '4. Refund Policy',
      icon: Receipt,
      iconBgColor: 'bg-emerald-50',
      iconTextColor: 'text-emerald-600',
      content: [
        {
          type: 'paragraph',
          text: 'Refunds are only considered if and when a cancellation request is approved under Section 2.',
        },
        {
          type: 'paragraph',
          text: '<b>a. Non-Refundable Fees</b><br/>The following are non-refundable under all circumstances:',
        },
        {
          type: 'list',
          items: [
            'Fees for services already rendered or substantially performed',
            'Subscription fees for billing periods that have already started',
            'Third-party fees (e.g., payment gateway charges, platform integration costs)',
            'Administrative, onboarding, or setup fees',
          ],
        },
        {
          type: 'paragraph',
          text: '<b>b. Refundable Fees</b>',
        },
        {
          type: 'list',
          items: [
            'Refunds may apply only to the unused portion of eligible services that have not yet been delivered or activated at the time of the approved cancellation.',
            'Any approved refund shall not exceed 95% of the total amount paid.',
            'A deduction of up to 5% may be applied to cover administrative and payment processing charges.',
          ],
        },
        {
          type: 'paragraph',
          text: '<b>c. Refund Process</b>',
        },
        {
          type: 'list',
          items: [
            '<b>Refund Request Submission:</b> Once cancellation approval is granted, you must submit a written refund request.',
            '<b>Processing Timeline:</b> Approved refunds will be processed within 14 business days from confirmation.',
            '<b>Bank Processing Time:</b> The time taken for funds to reflect may vary depending on your bank or payment provider. If the refund is not received within 21 days, please contact support@zobsai.com.',
            '<b>Currency:</b> Refunds will be issued in the original payment currency. Any bank fees or currency conversion charges will be deducted from the refundable amount.',
          ],
        },
      ],
    },
    {
      id: 'non-refundable-services',
      title: '5. Non-Refundable Services',
      icon: Ban,
      iconBgColor: 'bg-gray-100',
      iconTextColor: 'text-gray-600',
      content: [
        {
          type: 'paragraph',
          text: 'Certain zobsAI services are inherently non-refundable due to their digital, automated, or personalized nature, including:',
        },
        {
          type: 'list',
          items: [
            'Services already fully delivered or completed',
            'AI-generated or personalized outputs once provided',
            'Career recommendations or insights generated based on user data',
            'Subscription usage during an active billing period',
          ],
        },
        {
          type: 'paragraph',
          text: 'Refunds will not be issued for dissatisfaction with outcomes that are outside zobsAI’s control, including job rejections, employer decisions, or hiring outcomes.',
        },
      ],
    },
    {
      id: 'chargebacks',
      title: '6. Chargebacks and Payment Disputes',
      icon: CreditCard,
      iconBgColor: 'bg-orange-50',
      iconTextColor: 'text-orange-600',
      content: [
        {
          type: 'paragraph',
          text: 'By using zobsAI Services, you agree not to initiate chargebacks or payment disputes with your bank or payment provider unless:',
        },
        {
          type: 'list',
          items: [
            'You have first contacted zobsAI and attempted to resolve the issue in good faith, and',
            'zobsAI has failed to respond or resolve the issue within a reasonable timeframe.',
          ],
        },
        {
          type: 'paragraph',
          text: 'Unauthorized chargebacks may be disputed. You may be held responsible for any costs incurred by zobsAI in connection with reversing or contesting such chargebacks, including legal and administrative fees.',
        },
      ],
    },
    {
      id: 'legal-framework',
      title: '7. Legal Framework and Dispute Resolution',
      icon: Scale,
      iconBgColor: 'bg-stone-100',
      iconTextColor: 'text-stone-600',
      content: [
        {
          type: 'paragraph',
          text: 'This Cancellation & Refund Policy shall be governed by and construed in accordance with the laws of <b>India</b>.',
        },
        {
          type: 'paragraph',
          text: 'Any disputes arising out of or relating to this policy or zobsAI Services shall be subject to the exclusive jurisdiction of the courts of <b>Delhi, India</b>.',
        },
        {
          type: 'paragraph',
          text: 'zobsAI encourages amicable resolution through negotiation or mediation before pursuing formal legal remedies.',
        },
      ],
    },
    {
      id: 'amendments',
      title: '8. Amendments to This Policy',
      icon: RefreshCw,
      iconBgColor: 'bg-teal-50',
      iconTextColor: 'text-teal-600',
      content: [
        {
          type: 'paragraph',
          text: 'zobsAI reserves the right to amend, modify, or update this Cancellation & Refund Policy at any time. Any changes will be effective immediately upon posting on our Website.',
        },
        {
          type: 'paragraph',
          text: 'It is your responsibility to review this policy periodically to stay informed of updates.',
        },
      ],
    },
    // {
    //   id: 'contact',
    //   title: '9. Contact Information',
    //   icon: Mail,
    //   iconBgColor: 'bg-blue-50',
    //   iconTextColor: 'text-blue-600',
    //   content: [
    //     {
    //       type: 'paragraph',
    //       text: 'For questions, clarification, or to initiate a cancellation or refund request, please contact us at:',
    //     },
    //     {
    //       type: 'paragraph',
    //       text: 'Email: <a href="mailto:support@zobsai.com" class="text-blue-600 underline">support@zobsai.com</a>',
    //     },
    //   ],
    // },
  ],
};
