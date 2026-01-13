import {
  Sparkles,
  Shield,
  Users,
  Star,
  MessageSquare,
  Github,
  Linkedin,
  Twitter,
  Rocket,
  Instagram,
  Youtube,
  Facebook,
} from 'lucide-react';

export const footerLinks = {
  product: [
    { name: 'Features', badge: null, link: '/#platforms' },
    { name: 'Pricing', badge: 'Popular', link: '/#pricing' },
    { name: 'Resume Builder', badge: 'New', link: '/signup' },
    { name: 'ATS Scanner', badge: null, link: '/signup' },
    { name: 'Cover Letter AI', badge: null, link: '/signup' },
    { name: 'Job Matching', badge: null, link: '/signup' },
  ],
  company: [
    // { name: 'About Us', badge: null },
    { name: 'Careers', badge: 'Hiring Soon' },
    {
      name: 'Blogs',
      badge: null,
      link: 'https://blog.zobsai.com/',
      blank: true,
    },
    { name: 'Contact', badge: null, link: '/contact-us' },
  ],
  support: [
    { name: 'Help Center', badge: null },
    { name: 'Getting Started', badge: null, link: '/signup' },
    {
      name: 'Community',
      badge: null,
      link: 'https://wa.link/h30hgg',
      blank: true,
    },
    { name: 'Report Bug', badge: null, link: '/bug-report' },
  ],
  legal: [
    {
      name: 'Privacy Policy',
      badge: null,
      link: '/privacy-policy',
    },
    {
      name: 'Terms of Service',
      badge: null,
      link: '/terms-of-service',
    },
    {
      name: 'Cancellation & Refund Policy',
      badge: null,
      link: '/cancellation-refundpolicy',
    },
    { name: 'Cookie Policy', badge: null, link: '/cookie-policy' },
  ],
};

export const socialLinks = [
  {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'blue',
    followers: '25.8K',
    url: 'https://www.linkedin.com/company/zobsai-com/',
  },
  {
    name: 'Instagram',
    icon: Instagram,
    color: 'purple',
    followers: '8.9K',
    url: 'https://www.instagram.com/zobsai.co/',
  },
  {
    name: 'Youtube',
    icon: Youtube,
    color: 'red',
    followers: '8.9K',
    url: 'https://www.youtube.com/@ZobsAI/',
  },
  {
    name: 'Facebook',
    icon: Facebook,
    color: 'blue',
    followers: '8.9K',
    url: 'https://www.facebook.com/zobsai.co/',
  },

  
];
