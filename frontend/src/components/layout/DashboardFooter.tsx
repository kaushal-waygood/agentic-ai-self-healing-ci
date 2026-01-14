import { socialLinks } from '@/services/dummy/Footer';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import WhatsAppIcon from '@/assets/whatsapp.png';

const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();
  const communityLink = 'https://chat.whatsapp.com/DuXUurlksDoJ0jLG04zsm0';

  return (
    <footer className="w-full bg-white/80 backdrop-blur-md border-t border-gray-100 py-2 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Branding & Copyright */}
          <div className="flex  items-center md:items-start gap-1">
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ZobsAI
            </span>
            <p className="text-xs text-gray-500 font-medium">
              © {currentYear} All rights reserved.
            </p>
          </div>

          {/* Center: Social Links - Fixed dynamic color issue */}
          <div className="hidden md:flex items-center gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow us on ${social.platform || 'Social Media'}`}
                className="p-2 rounded-full border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 group"
              >
                <social.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </a>
            ))}
          </div>

          {/* Right: Navigation & WhatsApp */}
          <div className="hidden md:flex flex-col md:flex-row items-center gap-6">
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[
                { name: 'Terms', href: '/dashboard/terms-of-service' },
                { name: 'Privacy', href: '/dashboard/privacy-policy' },
                {
                  name: 'Cancellation-Refund',
                  href: '/dashboard/cancellation-refundpolicy',
                },
                { name: 'Support', href: '/dashboard/support' },
              ].map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="h-8 w-[1px] bg-gray-200 hidden md:block" />

            {/* Compact WhatsApp Community Button */}
            <a
              href={communityLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-full text-xs font-bold hover:bg-[#20ba5a] transition-all hover:shadow-lg active:scale-95"
            >
              <Image
                src={WhatsAppIcon}
                alt=""
                width={18}
                height={18}
                className="brightness-0 invert"
              />
              Join Community
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
