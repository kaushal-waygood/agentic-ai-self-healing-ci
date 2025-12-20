import { socialLinks } from '@/services/dummy/Footer';
import Link from 'next/link';
import React from 'react';

const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-gray-100 items-center  md:py-2 px-6">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-xs text-gray-500 font-medium">
          © {currentYear} ZobsAI
        </div>

        <div className="flex items-center gap-6">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              className="group relative bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-110"
            >
              <social.icon
                className={`w-5 h-5 text-${social.color}-400 group-hover:scale-110 transition-transform duration-300`}
              />
            </a>
          ))}
        </div>

        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="/dashboard/terms-of-service"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            Terms
          </Link>
          <Link
            href="/dashboard/privacy-policy"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            Privacy
          </Link>
          <Link
            href="/dashboard/support"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            Support
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default DashboardFooter;
