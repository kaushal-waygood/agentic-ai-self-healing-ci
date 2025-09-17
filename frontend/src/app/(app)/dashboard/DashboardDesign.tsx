'use client';

import React from 'react';
import {
  Award,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Target,
  Bell,
  Play,
  Filter,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import useProfileCompletion from '@/hooks/useProfileCompletion';

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'purple',
  actionText,
  actionLink,
}: any) {
  const colorClasses = {
    purple:
      'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    cyan: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
    green:
      'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  };

  const actionContent = actionLink ? (
    <Link href={actionLink}>
      <button className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center group-hover:underline">
        {actionText}
        <ArrowRight className="w-4 h-4 ml-1" />
      </button>
    </Link>
  ) : (
    actionText && (
      <p className="text-sm font-medium text-gray-500">{actionText}</p>
    )
  );

  return (
    <div className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div
        className="absolute inset-0 bg-gradient-to-r opacity-5 group-hover:opacity-10 transition-opacity"
        style={{
          background: `linear-gradient(135deg, ${
            color === 'purple'
              ? '#8b5cf6'
              : color === 'blue'
              ? '#3b82f6'
              : color === 'cyan'
              ? '#06b6d4'
              : '#10b981'
          }, ${
            color === 'purple'
              ? '#7c3aed'
              : color === 'blue'
              ? '#2563eb'
              : color === 'cyan'
              ? '#0891b2'
              : '#059669'
          })`,
        }}
      ></div>

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg`}
          >
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <div
              className={`flex items-center text-sm font-medium ${
                trend > 0 ? 'text-green-600' : 'text-red-500'
              }`}
            >
              <TrendingUp
                className={`w-4 h-4 mr-1 ${
                  trend < 0 ? 'transform rotate-180' : ''
                }`}
              />
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
          {description && (
            <p className="text-sm text-gray-500 mb-3">{description}</p>
          )}
          {actionContent}
        </div>
      </div>
    </div>
  );
}

export function ToolkitButton({
  icon: Icon,
  title,
  description,
  href,
  color = 'purple',
}: any) {
  const colorClasses = {
    purple: 'hover:bg-purple-50 border-purple-200 text-purple-600',
    blue: 'hover:bg-blue-50 border-blue-200 text-blue-600',
    cyan: 'hover:bg-cyan-50 border-cyan-200 text-cyan-600',
    green: 'hover:bg-green-50 border-green-200 text-green-600',
  };

  return (
    <Link href={href} passHref>
      <button
        className={`w-full p-4 rounded-xl border-2 border-dashed ${colorClasses[color]} transition-all duration-200 hover:border-solid hover:shadow-md group`}
      >
        <div className="flex items-start space-x-3">
          <div
            className={`p-2 rounded-lg bg-gradient-to-r ${
              color === 'purple'
                ? 'from-purple-100 to-purple-200'
                : color === 'blue'
                ? 'from-blue-100 to-blue-200'
                : color === 'cyan'
                ? 'from-cyan-100 to-cyan-200'
                : 'from-green-100 to-green-200'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-gray-900 group-hover:text-purple-700">
              {title}
            </h4>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <Play className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
        </div>
      </button>
    </Link>
  );
}

export function ProfileReadinessCard() {
  const { data, isLoading, error } = useProfileCompletion();

  // Show a loading state while the data is being fetched
  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col items-center justify-center h-[200px] text-center text-gray-500 border-2 border-dashed rounded-lg">
          <p className="font-medium">Loading profile data...</p>
          <p className="text-sm">This may take a moment.</p>
        </div>
      </div>
    );
  }

  // Handle potential errors during the fetch
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col items-center justify-center h-[200px] text-center text-red-500 border-2 border-dashed border-red-200 rounded-lg">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm">Could not fetch profile readiness.</p>
        </div>
      </div>
    );
  }

  // MODIFIED: Create a mapping to select which 4 of the 8 categories to display.
  // This maps the API response keys (e.g., 'coreProfile') to the labels you want to show.
  const checklistItems = [
    { key: 'coreProfile', label: 'Basic Info & Preferences' },
    { key: 'workExperience', label: 'Work Experience' },
    { key: 'education', label: 'Education Details' },
    { key: 'skills', label: 'Skills (10+ recommended)' },
  ];

  // MODIFIED: Use the percentage from the API data
  const score = data.percentage;
  const checks = data.categories;

  const getScoreColor = (scoreValue) => {
    if (scoreValue >= 80) return 'text-green-600';
    if (scoreValue >= 60) return 'text-yellow-600';
    return 'text-red-500';
  };

  const getProgressColor = (scoreValue) => {
    if (scoreValue >= 80) return 'from-green-400 to-green-600';
    if (scoreValue >= 60) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Profile Readiness
          </h3>
          <p className="text-gray-600 text-sm">
            Complete your profile to attract more opportunities
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          <p className="text-sm text-gray-500">Complete</p>
        </div>
      </div>

      {/* Progress Bar - Now driven by API data */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getProgressColor(
            score,
          )} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Checklist - Now maps over our selected items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checklistItems.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
          >
            <CheckCircle2
              className={`w-5 h-5 transition-colors duration-300 ${
                checks?.[key] ? 'text-green-600' : 'text-gray-300'
              }`}
            />
            <span
              className={`text-sm transition-colors duration-300 ${
                checks?.[key] ? 'text-gray-900 font-medium' : 'text-gray-500'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActionItemCard({ item, onMarkAsRead }) {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'reward':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'recommendation':
        return <Target className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'reward':
        return 'border-l-yellow-400 bg-yellow-50';
      case 'recommendation':
        return 'border-l-blue-400 bg-blue-50';
      default:
        return 'border-l-gray-400 bg-gray-50';
    }
  };

  return (
    <Link href={item.href} passHref>
      <div
        className={cn(
          'p-4 rounded-r-xl border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md',
          item.isRead
            ? 'border-l-gray-200 bg-gray-50 opacity-60'
            : getTypeColor(item.type),
        )}
        onClick={() => onMarkAsRead(item.id)}
      >
        <div className="flex items-start space-x-3">
          {getTypeIcon(item.type)}
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                item.isRead ? 'text-gray-500' : 'text-gray-900'
              }`}
            >
              {item.summary}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(item.date).toLocaleDateString()}
            </p>
          </div>
          {!item.isRead && (
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          )}
        </div>
      </div>
    </Link>
  );
}
