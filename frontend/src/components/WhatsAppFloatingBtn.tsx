'use client';

import React from 'react';
import Image from 'next/image';
import WhatsAppIcon from 'icons/whatsapp.png'; // Ensure path is correct
import { usePathname } from 'next/navigation';

const WhatsAppFloatingBtn = () => {
  const communityLink = 'https://chat.whatsapp.com/DuXUurlksDoJ0jLG04zsm0';

  const pathname = usePathname();

  if (pathname.includes('/dashboard')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-1">
      {/* Interactive Text Bubble */}
      <a
        href={communityLink}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative mb-1 ml-1 cursor-pointer rounded-xl bg-white px-4 py-2 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800"
      >
        <p className="whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-100">
          Join ZobsAI Community 👋
        </p>

        {/* Little triangle pointer for the bubble */}
        <div className="absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 bg-white dark:bg-gray-800"></div>
      </a>

      {/* Main WhatsApp Button */}
      <a
        href={communityLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join WhatsApp Community"
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_4px_12px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_6px_16px_rgba(37,211,102,0.6)]"
      >
        <Image
          src="/icons/whatsapp.png"
          alt="WhatsApp"
          width={32}
          height={32}
          className="transition-transform duration-300 group-hover:rotate-12"
        />
      </a>
    </div>
  );
};

export default WhatsAppFloatingBtn;
