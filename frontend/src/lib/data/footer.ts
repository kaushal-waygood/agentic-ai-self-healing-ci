
export interface FooterLink {
  text: string;
  href: string;
}

export interface FooterLinkColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  name: "Facebook" | "Twitter" | "Instagram" | "Linkedin" | "Youtube" | "Tiktok";
  href: string;
}

export interface FooterData {
  company: {
    name: string;
    tagline: string;
    address: string;
    email: string;
    phone: string;
    showAdminLogin: boolean;
  };
  linkColumns: FooterLinkColumn[];
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
  };
  socials: {
    title: string;
    description: string;
    links: SocialLink[];
  };
  copyright: string;
}

const initialFooterData: FooterData = {
  company: {
    name: "CareerPilot",
    tagline: "Your trusted partner in navigating the path to your dream career.",
    address: "123 Innovation Drive, Tech Park, Suite 456",
    email: "info@careerpilot.example.com",
    phone: "+1 (555) 123-4567",
    showAdminLogin: true,
  },
  linkColumns: [
    {
      id: "col1",
      title: "Company",
      links: [
        { text: "About Us", href: "#" },
        { text: "Blog", href: "#" },
        { text: "Careers", href: "#" },
        { text: "Sitemap", href: "#" },
      ],
    },
    {
      id: "col2",
      title: "Services",
      links: [
        { text: "AI Application Wizard", href: "/apply" },
        { text: "AI CV Generator", href: "/cv-generator" },
        { text: "Job Search", href: "/search-jobs" },
        { text: "AI Auto-Apply", href: "/ai-auto-apply" },
      ],
    },
    {
      id: "col3",
      title: "Policies",
      links: [
        { text: "Privacy Policy", href: "#" },
        { text: "Terms of Service", href: "#" },
        { text: "Refund Policy", href: "#" },
      ],
    },
    {
      id: "col4",
      title: "AI Tools",
      links: [
        { text: "AI CV Builder", href: "/cv-generator" },
        { text: "AI Cover Letter Studio", href: "/cover-letter-generator" },
        { text: "AI Job Matcher", href: "/search-jobs" },
        { text: "AI Assistant", href: "/ai-assistant" },
      ],
    },
  ],
  newsletter: {
    title: "Subscribe to Our Newsletter",
    description:
      "Get the latest news, articles, and resources sent to your inbox weekly.",
    placeholder: "Enter your email",
  },
  socials: {
    title: "Connect With Us",
    description:
      "Follow us on social media for the latest updates and tips.",
    links: [
      { name: "Facebook", href: "#" },
      { name: "Twitter", href: "#" },
      { name: "Instagram", href: "#" },
      { name: "Linkedin", href: "#" },
      { name: "Youtube", href: "#" },
      { name: "Tiktok", href: "#" },
    ],
  },
  copyright: `© ${new Date().getFullYear()} CareerPilot. All Rights Reserved.`,
};

declare global {
  // eslint-disable-next-line no-var
  var __mockFooterData: FooterData | undefined;
}

export let mockFooterData: FooterData;

if (process.env.NODE_ENV === "production") {
  mockFooterData = initialFooterData;
} else {
  if (!globalThis.__mockFooterData) {
    globalThis.__mockFooterData = initialFooterData;
  }
  mockFooterData = globalThis.__mockFooterData;
}
