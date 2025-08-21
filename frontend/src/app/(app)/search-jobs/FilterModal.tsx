// components/jobs/FilterModal.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Briefcase, TrendingUp, X } from 'lucide-react';
import { capitalise } from '@/utils/capitalise';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  employmentTypes: string[];
  experienceLevels: string[];
  filters: {
    employmentType: string[];
    experience: string[];
  };
  onFilterChange: (name: string, value: string | string[]) => void;
  onReset: () => void;
  onApply: () => void;
}

export const FilterModal = ({
  isOpen,
  onClose,
  employmentTypes,
  experienceLevels,
  filters,
  onFilterChange,
  onReset,
  onApply,
}: FilterModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Advanced Filters</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-8 overflow-y-auto">
          {/* Employment Type - WIRED TO YOUR LOGIC */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-500" /> Employment Type
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {employmentTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.employmentType.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...filters.employmentType, type]
                        : filters.employmentType.filter(
                            (t: string) => t !== type,
                          );
                      onFilterChange('employmentType', newTypes);
                    }}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-400"
                  />
                  <span className="text-gray-700 font-medium">
                    {capitalise(type)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience Level - WIRED TO YOUR LOGIC */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Experience Level
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {experienceLevels.map((level) => (
                <label
                  key={level}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.experience.includes(level)}
                    onChange={(e) => {
                      const newLevels = e.target.checked
                        ? [...filters.experience, level]
                        : filters.experience.filter((l: string) => l !== level);
                      onFilterChange('experience', newLevels);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-400"
                  />
                  <span className="text-gray-700 font-medium">{level}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-3xl border-t border-gray-200 mt-auto">
          <div className="flex gap-3">
            <button
              onClick={onReset}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Reset All
            </button>
            <button
              onClick={onApply}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
