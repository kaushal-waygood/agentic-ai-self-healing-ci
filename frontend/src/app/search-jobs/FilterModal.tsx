'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { datePostedOptions } from './SearchFilters';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  employmentTypes: string[];
  experienceLevels: string[];
  filters: any;
  onFilterChange: (newFilters: any) => void;
  onReset: () => void;
}

export const FilterModal = ({
  isOpen,
  onClose,
  employmentTypes,
  experienceLevels,
  filters,
  onFilterChange,
  onReset,
}: FilterModalProps) => {
  const handleCheckboxChange = (
    filterKey: 'employmentType' | 'experience',
    value: string,
    checked: boolean,
  ) => {
    const currentValues: string[] = filters[filterKey] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((item) => item !== value);

    // Instantly call the debounced update function from the hook
    onFilterChange({ [filterKey]: newValues });
  };

  const handleDatePostedChange = (value: string) => {
    onFilterChange({ datePosted: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            More Filters
          </DialogTitle>
          <DialogDescription>
            Refine your job search to find the perfect fit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
          <div>
            <h4 className="font-semibold mb-3">Employment Type</h4>
            <div className="space-y-3">
              {/* FIX: Filter for strings to prevent errors from null or non-string values in the array */}
              {employmentTypes
                .filter((type) => typeof type === 'string')
                .map((type) => (
                  <div key={type} className="flex items-center space-x-3">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.employmentType?.includes(type)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('employmentType', type, !!checked)
                      }
                    />
                    {/* FIX: Re-enabled the label */}
                    <Label
                      htmlFor={`type-${type}`}
                      className="font-normal capitalize cursor-pointer"
                    >
                      {type.toLowerCase().replace(/_/g, ' ')}
                    </Label>
                  </div>
                ))}
            </div>
          </div>
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-3">Experience Level</h4>
            <div className="space-y-3">
              {/* FIX: Filter for strings to prevent errors from null or non-string values in the array */}
              {experienceLevels
                .filter((level) => typeof level === 'string')
                .map((level) => (
                  <div key={level} className="flex items-center space-x-3">
                    <Checkbox
                      id={`exp-${level}`}
                      checked={filters.experience?.includes(level)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange('experience', level, !!checked)
                      }
                    />
                    <Label
                      htmlFor={`exp-${level}`}
                      className="font-normal capitalize cursor-pointer"
                    >
                      {level.toLowerCase().replace(/_/g, ' ')}
                    </Label>
                  </div>
                ))}
            </div>
          </div>
          <div className="border-t pt-6">
            <h4 className="font-semibold mb-3">Date Posted</h4>
            <div className="space-y-3">
              {datePostedOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`date-${option.id}`}
                    checked={filters.datePosted === option.id}
                    onCheckedChange={(checked) =>
                      handleDatePostedChange(checked ? option.id : '')
                    }
                  />
                  <Label
                    htmlFor={`date-${option.id}`}
                    className="font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="pt-4 border-t">
          <Button variant="ghost" onClick={onReset}>
            Reset
          </Button>
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
