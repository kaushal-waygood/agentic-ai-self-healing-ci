'use client';

import { useState, useRef } from 'react';
import { LogOut, Sparkles } from 'lucide-react';
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

          <div className="flex gap-2 justify-center  items-center">
            <span className="font-semibold animate-in fade-in slide-in-from-right-4 duration-600">
              {' '}
              {user.fullName}
            </span>
            <button
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="text-xl font-bold bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center focus:outline-none cursor-pointer"
            >
              {dpProfile}
            </button>
          </div>

          {/* dropdown  */}
          {isDropdownOpen && (
            <div
              tabIndex={-1}
              className="absolute right-0 mt-3 w-72 bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200"
            >
              {/* Profile Header */}
              <div className="p-5 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  {/* User Avatar Initials */}
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2 space-y-1">
                {/* Role Information */}
                <div className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Type:{' '}
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-auto lowercase font-bold">
                    {user.role}
                  </span>
                </div>

                {/* Credits Display */}
                <div className="flex items-center justify-between px-3 py-3 rounded-lg bg-yellow-50/50 border border-yellow-100/50 mx-1">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <Sparkles size={16} className="text-yellow-500" />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      AI Credits
                    </span>
                  </div>
                  <span className="text-sm font-black text-yellow-900">
                    {user.credits}
                  </span>
                </div>

                <div className="h-px bg-gray-100 my-2 mx-2" />

                {/* Logout Action */}
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 flex items-center gap-3 hover:bg-red-50 transition-colors group"
                >
                  <div className="p-1.5 bg-red-100/50 rounded-lg group-hover:bg-red-100">
                    <LogOut size={16} />
                  </div>
                  Logout Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
