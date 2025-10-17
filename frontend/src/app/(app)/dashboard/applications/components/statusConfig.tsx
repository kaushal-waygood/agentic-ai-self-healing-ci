import React, { useState, useEffect, useMemo, FC } from 'react';
import Link from 'next/link';

// --- Icon Imports ---
import {
  FileCheck2,
  Search,
  Loader2,
  Trash2,
  MailOpen,
  RefreshCw,
  TrendingUp,
  Award,
  MoreHorizontal,
  Building2,
  Calendar,
  Filter,
  Eye,
  Target,
  ArrowRight,
  Sparkles,
  ChevronDown,
  X,
} from 'lucide-react';

// --- UI & Utility Imports ---
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { getAllSavedJobs } from '@/services/api/student';

// --- Type Definitions ---
interface Job {
  title: string;
  company: string;
}

interface Application {
  id: string;
  job: Job;
  status:
    | 'Applied'
    | 'AI-Drafted'
    | 'Sent'
    | 'Viewed'
    | 'Interviewing'
    | 'Offer Extended'
    | 'Rejected'
    | 'Draft'
    | 'Error';
  appliedAt: string;
  notes?: string[];
}

// --- Status Configuration for Styling ---
export const statusConfig = {
  Applied: {
    bgColor:
      'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: '📧',
    accentColor: 'bg-blue-500',
  },
  'AI-Drafted': {
    bgColor:
      'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    icon: '🤖',
    accentColor: 'bg-indigo-500',
  },
  Sent: {
    bgColor:
      'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: '✈️',
    accentColor: 'bg-emerald-500',
  },
  Viewed: {
    bgColor:
      'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-200 dark:border-purple-800',
    icon: '👀',
    accentColor: 'bg-purple-500',
  },
  Interviewing: {
    bgColor:
      'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    icon: '🎯',
    accentColor: 'bg-yellow-500',
  },
  'Offer Extended': {
    bgColor:
      'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: '🎉',
    accentColor: 'bg-green-500',
  },
  Rejected: {
    bgColor:
      'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: '❌',
    accentColor: 'bg-red-500',
  },
  Draft: {
    bgColor:
      'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30',
    textColor: 'text-gray-700 dark:text-gray-300',
    borderColor: 'border-gray-200 dark:border-gray-800',
    icon: '📝',
    accentColor: 'bg-gray-500',
  },
  Error: {
    bgColor:
      'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: '⚠️',
    accentColor: 'bg-red-500',
  },
};

export const applicationStatuses = Object.keys(statusConfig);

export const StatCard: FC<{
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend: number;
}> = ({ label, value, icon: Icon, color, trend }) => (
  <div
    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-1`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-white/80 text-sm">
            <TrendingUp className="h-4 w-4" />
            <span>+{trend}%</span>
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">
          {value}
        </div>
        <div className="text-white/80 text-sm font-medium">{label}</div>
      </div>
    </div>
    <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-xl" />
  </div>
);

export const ApplicationCard: FC<{
  app: Application;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  index: number;
}> = ({ app, isSelected, onSelect, index }) => {
  const [showNotes, setShowNotes] = useState(false);
  const config = statusConfig[app.status] || statusConfig['Error'];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1.5 hover:shadow-2xl ${
        isSelected
          ? 'border-blue-500 shadow-lg shadow-blue-500/20 bg-blue-50/50'
          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
      }`}
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'fadeInUp 0.5s ease-out forwards',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${config.accentColor} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
      />
      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`relative w-5 h-5 rounded border-2 cursor-pointer transition-all duration-300 ${
              isSelected
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-300 hover:border-blue-400'
            }`}
            onClick={() => onSelect(app.id, !isSelected)}
          >
            {isSelected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm animate-pulse" />
              </div>
            )}
          </div>
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${config.bgColor} ${config.textColor} ${config.borderColor} border`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{config.icon}</span>
              <span>{app.status}</span>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Building2 className="h-4 w-4" />
            <span>{app.job.company}</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-300">
            {app.job.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <Calendar className="h-4 w-4" />
          <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
        </div>

        {app.notes && app.notes.length > 0 && (
          <div className="mb-4">
            <div
              className="flex items-center gap-2 cursor-pointer group/notes"
              onClick={() => setShowNotes(!showNotes)}
            >
              <MailOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/notes:text-blue-600">
                Latest Update
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${
                  showNotes ? 'rotate-180' : ''
                }`}
              />
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                showNotes ? 'max-h-40 mt-2' : 'max-h-0'
              }`}
            >
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {app.notes[app.notes.length - 1]}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Link href={`/applications/${app.id}`} className="flex-1">
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 transform hover:scale-105">
              <div className="flex items-center justify-center gap-2">
                <Eye className="h-4 w-4" />
                <span>View Details</span>
                <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          </Link>
          <button className="p-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 hover:scale-110">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        className={`absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}
      />
    </div>
  );
};
