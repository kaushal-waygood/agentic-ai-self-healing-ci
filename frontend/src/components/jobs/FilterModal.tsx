// /components/jobs/FilterModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// NOTE: We are no longer using Checkbox or Label from shadcn/ui

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  employmentTypes: string[];
  experienceLevels: string[];
  filters: any;
  onFilterChange: (newFilters: any) => void;
  onReset: () => void;
}

// HELPER: New helper function to make long experience labels readable
const simplifyExperienceLabel = (label: string): string => {
  const matches = label.match(/Gs-(\d+)/g);
  if (matches && matches.length >= 2) {
    const targetLevel = matches[1]; // e.g., Gs-12
    const sourceLevel = matches[0]; // e.g., Gs-11
    return `${targetLevel.replace(
      '-',
      '',
    )} Equivalent (from ${sourceLevel.replace('-', '')})`;
  }
  // Fallback for any labels that don't match the expected format
  return label.length > 30 ? label.substring(0, 27) + '...' : label;
};

// HELPER: A new reusable component for our interactive tags
const FilterTag = ({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    role="checkbox"
    aria-checked={isSelected}
    className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 capitalize ${
      isSelected
        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
    }`}
  >
    {label}
  </button>
);

export const FilterModal = ({
  isOpen,
  onClose,
  employmentTypes,
  experienceLevels,
  filters,
  onFilterChange,
  onReset,
}: FilterModalProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  const handleSelectionChange = (
    filterKey: 'employmentType' | 'experience',
    value: string,
  ) => {
    const currentValues: string[] = localFilters[filterKey] || [];
    const isSelected = currentValues.includes(value);
    const newValues = isSelected
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    setLocalFilters((prev: any) => ({ ...prev, [filterKey]: newValues }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    // We keep existing text query and location from the main search bar
    const resetState = {
      query: filters.query,
      country: filters.country,
      city: filters.city,
      datePosted: '',
      employmentType: [],
      experience: [],
    };
    setLocalFilters(resetState);
    // We call the parent onReset which will trigger handleFilterChange with the reset state
    onReset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">More Filters</DialogTitle>
          <DialogDescription>
            Refine your job search to find the perfect fit.
          </DialogDescription>
        </DialogHeader>

        {/* The main content area for filters */}
        <div className="py-4 max-h-[60vh] overflow-y-auto pr-4">
          {/* NEW: Using a 2-column grid for better layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Employment Type Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Employment Type</h4>
              <div className="flex flex-wrap gap-2">
                {employmentTypes
                  .filter((type) => typeof type === 'string')
                  .map((type) => (
                    <FilterTag
                      key={type}
                      label={type.toLowerCase().replace(/_/g, ' ')}
                      isSelected={localFilters.employmentType?.includes(type)}
                      onClick={() =>
                        handleSelectionChange('employmentType', type)
                      }
                    />
                  ))}
              </div>
            </div>

            {/* Experience Level Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Experience Level</h4>
              <div className="flex flex-wrap gap-2">
                {experienceLevels
                  .filter((level) => typeof level === 'string')
                  .map((level) => (
                    <FilterTag
                      key={level}
                      label={simplifyExperienceLabel(level)}
                      isSelected={localFilters.experience?.includes(level)}
                      onClick={() => handleSelectionChange('experience', level)}
                    />
                  ))}
              </div>
            </div>

            {/* You can add more filter sections here and they will flow into the grid */}
            {/* e.g., Date Posted Section */}
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="ghost" onClick={handleReset}>
            Reset Filters
          </Button>
          <Button
            onClick={handleApply}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
