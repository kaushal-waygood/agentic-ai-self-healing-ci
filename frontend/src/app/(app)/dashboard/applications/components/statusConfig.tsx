import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Building2,
  Calendar,
  Eye,
  ArrowRight,
  MoreHorizontal,
} from 'lucide-react';

// --- Status Configuration (Corrected 'visited' to 'Visited') ---
export const statusConfig = {
  Applied: {
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    textColor: 'text-blue-700 dark:text-blue-300',
    icon: '📧',
  },
  Saved: {
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/50',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    icon: '🔖',
  },
  Visited: {
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
    textColor: 'text-purple-700 dark:text-purple-300',
    icon: '👀',
  },
  Interviewing: {
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    icon: '🎯',
  },
  'Offer Extended': {
    bgColor: 'bg-green-100 dark:bg-green-900/50',
    textColor: 'text-green-700 dark:text-green-300',
    icon: '🎉',
  },
  Rejected: {
    bgColor: 'bg-red-100 dark:bg-red-900/50',
    textColor: 'text-red-700 dark:text-red-300',
    icon: '❌',
  },
  // Add other statuses as needed
  Error: {
    bgColor: 'bg-gray-100 dark:bg-gray-900/50',
    textColor: 'text-gray-700 dark:text-gray-300',
    icon: '⚠️',
  },
};

export const applicationStatuses = Object.keys(statusConfig);

// --- StatCard Component (Unchanged) ---
export const StatCard = ({ label, value, icon: Icon, onClick }) => (
  <div
    onClick={onClick}
    className={` group relative overflow-hidden rounded-lg border border-blue-200 dark:border-gray-700 p-2 md:p-4 transition-all duration-300 hover:shadow-xl hover:bg-tabPrimary cursor-pointer active:scale-[0.98]`}
  >
    <div className="relative z-10">
      {/* Optional icon */}
      {/* <div className="p-3 rounded-lg bg-white/20 mb-4 inline-block">
        <Icon className="h-6 w-6 text-white" />
      </div> */}
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-600 text-sm font-medium">{label}</div>
    </div>
  </div>
);

// --- NEW: ApplicationRow Component ---
// This replaces the bulky ApplicationCard with a compact, interactive list item.
export const ApplicationRow = ({ app, isSelected, onSelect, index }) => {
  const config = statusConfig[app.status] || statusConfig['Error'];

  return (
    <div
      className={`relative flex items-center gap-4  md:p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400'
          : 'bg-white dark:bg-gray-900 border-transparent dark:border-gray-800'
      }`}
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 50}ms forwards`,
        opacity: 0,
      }}
    >
      {/* Job Title & Company */}
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {app.job.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" />
          {app.job.company}
        </p>
      </div>

      {/* Status Pill */}
      <div
        className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${config.bgColor} ${config.textColor}`}
      >
        <span>{config.icon}</span>
        <span>{app.status}</span>
      </div>

      {/* Date */}
      <div className="flex-shrink-0 hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Calendar className="h-4 w-4" />
        <span>{new Date(app.appliedAt).toLocaleDateString()}</span>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0">
        <Link href={`/dashboard/search-jobs?job=${app.job.slug}`}>
          <button className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300">
            <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
      </div>
    </div>
  );
};
