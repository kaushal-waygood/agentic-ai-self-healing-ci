// components/jobs/FilterModal.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Filter Jobs</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <Label>Employment Type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {employmentTypes.map((type, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Checkbox
                      id={`employment-${type}`}
                      checked={filters.employmentType.includes(type)}
                      onCheckedChange={(checked) => {
                        let newTypes = [...filters.employmentType];
                        if (checked) {
                          newTypes.push(type);
                        } else {
                          newTypes = newTypes.filter((t) => t !== type);
                        }
                        onFilterChange('employmentType', newTypes);
                      }}
                    />
                    <Label htmlFor={`employment-${type}`}>
                      {capitalise(type)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Experience Level</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {experienceLevels.map((level, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Checkbox
                      id={`experience-${level}`}
                      checked={filters.experience.includes(level)}
                      onCheckedChange={(checked) => {
                        let newLevels = [...filters.experience];
                        if (checked) {
                          newLevels.push(level);
                        } else {
                          newLevels = newLevels.filter((l) => l !== level);
                        }
                        onFilterChange('experience', newLevels);
                      }}
                    />
                    <Label htmlFor={`experience-${level}`}>{level}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button variant="outline" onClick={onReset}>
              Reset All
            </Button>
            <Button onClick={onApply}>Apply Filters</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
