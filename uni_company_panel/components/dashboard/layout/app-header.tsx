'use client';

import { useState, useRef } from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { FRONTEND_BASE_URL } from '@/services/api';

interface AppHeaderProps {
  onMenuClick: () => void;
}

export const AppHeader = ({ onMenuClick }: AppHeaderProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  if (!user) return null;

  const dpProfile = user.fullName?.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    router.push(FRONTEND_BASE_URL);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md">
      <div className="flex items-center justify-end px-4 py-2">
        {/* WRAPPER handles focus / blur */}
        <div
          ref={wrapperRef}
          tabIndex={0}
          onBlur={(e) => {
            // close only if focus moves outside this wrapper
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setIsDropdownOpen(false);
            }
          }}
          className="relative outline-none"
        >
          {/* PROFILE BUTTON */}
          <button
            onClick={() => setIsDropdownOpen((v) => !v)}
            className="text-xl font-bold bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center focus:outline-none"
          >
            {dpProfile}
          </button>

          {/* DROPDOWN */}
          {isDropdownOpen && (
            <div
              tabIndex={-1}
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border"
            >
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
