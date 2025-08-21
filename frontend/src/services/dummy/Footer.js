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
    { name: 'Features', icon: Sparkles, badge: null },
    { name: 'Pricing', icon: null, badge: 'Popular' },
    { name: 'AI Resume Builder', icon: null, badge: 'New' },
    { name: 'ATS Scanner', icon: null, badge: null },
    { name: 'Cover Letter AI', icon: null, badge: null },
    { name: 'Job Matching', icon: null, badge: null },
  ],
  company: [
    { name: 'About Us', icon: Users, badge: null },
    { name: 'Careers', icon: null, badge: 'Hiring' },
    { name: 'Press', icon: null, badge: null },
    { name: 'Blog', icon: null, badge: null },
    { name: 'Success Stories', icon: Star, badge: null },
    { name: 'Contact', icon: MessageSquare, badge: null },
  ],
  support: [
    { name: 'Help Center', icon: null, badge: null },
    { name: 'Getting Started', icon: Rocket, badge: null },
    { name: 'API Documentation', icon: null, badge: null },
    { name: 'Community', icon: Users, badge: null },
    { name: 'Status Page', icon: null, badge: 'Live' },
    { name: 'Report Bug', icon: null, badge: null },
  ],
  legal: [
    { name: 'Privacy Policy', icon: Shield, badge: null },
    { name: 'Terms of Service', icon: null, badge: null },
    { name: 'Cookie Policy', icon: null, badge: null },
    { name: 'GDPR Compliance', icon: null, badge: null },
    { name: 'Security', icon: Shield, badge: null },
    { name: 'Data Protection', icon: null, badge: null },
  ],
};

export const socialLinks = [
  { name: 'Twitter', icon: Twitter, color: 'blue', followers: '12.5K' },
  { name: 'LinkedIn', icon: Linkedin, color: 'blue', followers: '25.8K' },
  { name: 'GitHub', icon: Github, color: 'gray', followers: '5.2K' },
  { name: 'Discord', icon: MessageSquare, color: 'purple', followers: '8.9K' },
];
