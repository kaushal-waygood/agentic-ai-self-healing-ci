export type NavItem = {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  description?: string;
  adminOnly?: boolean;
};

export type SidebarNavItem = NavItem & {
  items?: NavItem[];
};

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  sidebarNav: SidebarNavItem[];
};

import {
  LayoutDashboard,
  UserCircle,
  FileText,
  Briefcase,
  DollarSign,
  Gift,
  LifeBuoy,
  Settings,
  MessageSquare,
  FileCheck2,
  Search,
  Newspaper,
  Bot,
  Users,
  Wand2,
} from 'lucide-react';

export const siteConfig: SiteConfig = {
  name: 'CareerPilot',
  description:
    'AI-powered job application assistant to streamline and enhance your job search.',
  url: 'https://careerpilot.example.com',
  ogImage: 'https://careerpilot.example.com/og.jpg',
  sidebarNav: [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Organization',
      href: '/organization',
      icon: Users,
      adminOnly: true,
    },
    {
      title: 'Search Jobs',
      href: '/search-jobs',
      icon: Search,
    },
    {
      title: 'My Applications',
      href: '/applications',
      icon: FileCheck2,
    },
    {
      title: 'Application Wizard',
      href: '/apply',
      icon: Wand2,
    },
    {
      title: 'AI CV Generator',
      href: '/cv-generator',
      icon: FileText,
    },
    {
      title: 'Cover Letter Studio',
      href: '/cover-letter-generator',
      icon: Newspaper,
    },
    {
      title: 'AI Auto Apply',
      href: '/ai-auto-apply',
      icon: Bot,
    },
    {
      title: 'Subscriptions',
      href: '/subscriptions',
      icon: DollarSign,
    },
    {
      title: 'Refer & Earn',
      href: '/referrals',
      icon: Gift,
    },
    {
      title: 'AI Assistant',
      href: '/ai-assistant',
      icon: MessageSquare,
    },
    {
      title: 'Support',
      href: '/support',
      icon: LifeBuoy,
    },
    {
      title: 'My Profile',
      href: '/profile',
      icon: UserCircle,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ],
};
