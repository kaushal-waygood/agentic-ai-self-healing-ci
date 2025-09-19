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
} from 'lucide-react';

export const footerLinks = {
  product: [
    { name: 'Features', badge: null, link: '#features' },
    { name: 'Pricing', badge: 'Popular', link: '#pricing' },
    { name: 'Resume Builder', badge: 'New', link: '/signup' },
    { name: 'ATS Scanner', badge: null, link: '/signup' },
    { name: 'Cover Letter AI', badge: null, link: '/signup' },
    { name: 'Job Matching', badge: null, link: '/signup' },
  ],
  company: [
    // { name: 'About Us', badge: null },
    { name: 'Careers', badge: 'Hiring' },
    // { name: 'Press', badge: null },
    { name: 'Contact', badge: null, link: '/contact-us' },
  ],
  support: [
    { name: 'Help Center', badge: null },
    { name: 'Getting Started', badge: null, link: '/signup' },
    { name: 'Community', badge: null, link: 'https://wa.link/h30hgg' },
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
    { name: 'Cookie Policy', badge: null, link: '/cookie-policy' },
  ],
};

export const socialLinks = [
  { name: 'Twitter', icon: Twitter, color: 'blue', followers: '12.5K' },
  { name: 'LinkedIn', icon: Linkedin, color: 'blue', followers: '25.8K' },
  { name: 'GitHub', icon: Github, color: 'gray', followers: '5.2K' },
  { name: 'Discord', icon: MessageSquare, color: 'purple', followers: '8.9K' },
];
