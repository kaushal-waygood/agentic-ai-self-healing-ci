'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Globe, MapPin, X } from 'lucide-react';
import CountrySelector from '../common/CountrySelector';
import StateSelector from '../common/StateSelector';
import { useJobs } from '@/hooks/jobs/useJobs';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const datePostedOptions = [
  { id: 'day', label: 'Past 24 hours' },
  { id: 'week', label: 'Past week' },
  { id: 'month', label: 'Past month' },
];

const parseYearsFromLabel = (label: string): string | null => {
  let match = label.match(/(\d+)\s*-\s*(\d+)\s*Years?/i);
  if (match) return `${match[1]}-${match[2]} Years`;
  match = label.match(/(\d+)\+\s*Year/i);
  if (match) return `${match[1]}+ Years`;
  match = label.match(/(\d+)\s*Year/i);
  if (match) {
    const years = parseInt(match[1], 10);
    return `${years} ${years > 1 ? 'Years' : 'Year'}`;
  }
  return null;
};

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

const EducationTag = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium px-2.5 py-1 rounded-md">
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      aria-label={`Remove ${label}`}
    >
      <X size={14} />
    </button>
  </div>
);

export const FilterModal = ({ isOpen, onClose }: FilterModalProps) => {
  const { employmentTypes, experienceLevels, filters, handleFilterChange } =
    useJobs();

  const [localFilters, setLocalFilters] = useState<any>({
    ...filters,
    education: filters.education || [],
  });

  const [educationInput, setEducationInput] = useState('');

  const groupedExperienceLevels = useMemo(() => {
    const groups = new Map<string, string[]>();
    if (experienceLevels) {
      experienceLevels
        .filter((level) => typeof level === 'string')
        .forEach((originalLevel) => {
          const simplified = parseYearsFromLabel(originalLevel);
          if (simplified !== null) {
            if (!groups.has(simplified)) {
              groups.set(simplified, []);
            }
            groups.get(simplified)!.push(originalLevel);
          }
        });
    }
    return groups;
  }, [experienceLevels]);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters({
        ...filters,
        education: filters.education || [],
      });
    }
  }, [isOpen, filters]);

  const handleSelectionChange = (
    filterKey: 'employmentType' | 'experience',
    value: string,
  ) => {
    const currentValues: string[] = localFilters[filterKey] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];
    setLocalFilters((prev: any) => ({ ...prev, [filterKey]: newValues }));
  };

  const handleDatePostedChange = (value: string) => {
    setLocalFilters((prev: any) => ({
      ...prev,
      datePosted: prev.datePosted === value ? '' : value,
    }));
  };

  const handleEducationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = educationInput.trim();
      if (newTag && !localFilters.education?.includes(newTag)) {
        setLocalFilters((prev: any) => ({
          ...prev,
          education: [...(prev.education || []), newTag],
        }));
      }
      setEducationInput('');
    }
  };

  const handleRemoveEducationTag = (tagToRemove: string) => {
    setLocalFilters((prev: any) => ({
      ...prev,
      education: prev.education.filter((tag: string) => tag !== tagToRemove),
    }));
  };

  const handleApply = () => {
    handleFilterChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetState = {
      query: filters.query || '',
      country: '',
      countryCode: '',
      city: '',
      state: '',
      datePosted: '',
      employmentType: [],
      experience: [],
      education: [],
    };
    setLocalFilters(resetState);
    handleFilterChange(resetState);
  };

  console.log('locat filters', localFilters);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-headingTextPrimary ">
            More Filters
          </DialogTitle>
          <DialogDescription>
            Refine your job search to find the perfect fit.
          </DialogDescription>
        </DialogHeader>

        {/* <div className="grid grid-cols-1 gap-4"> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className=" input-search-box-div">
            <Globe className="input-search-icon" />
            <CountrySelector
              value={localFilters.country || ''}
              onChange={(countryCode: string) =>
                setLocalFilters((prev: any) => ({
                  ...prev,
                  country: countryCode,
                  state: '',
                }))
              }
              className="input-search"
            />
          </div>

          <div className=" input-search-box-div">
            <MapPin className="input-search-icon" />
            <StateSelector
              countryCode={localFilters.country}
              value={localFilters.state}
              onChange={(stateCode: string) =>
                setLocalFilters((prev: any) => ({
                  ...prev,
                  state: stateCode,
                }))
              }
              disabled={!localFilters.country}
              className="input-search"
            />
          </div>
        </div>

        <div className="py-4 max-h-[60vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Experience Level</h4>
              <div className="flex flex-wrap gap-2">
                {experienceLevels
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

            <div className="space-y-3 md:col-span-2">
              <h4 className="font-semibold text-gray-800">Education</h4>
              <div className="flex flex-wrap items-center gap-2 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                {localFilters.education?.map((tag: string) => (
                  <EducationTag
                    key={tag}
                    label={tag}
                    onRemove={() => handleRemoveEducationTag(tag)}
                  />
                ))}
                <Input
                  type="text"
                  value={educationInput}
                  onChange={(e) => setEducationInput(e.target.value)}
                  onKeyDown={handleEducationKeyDown}
                  placeholder="e.g., Bachelors, PhD..."
                  className="flex-1 border-none bg-transparent focus:ring-0 focus:outline-none min-w-[120px]"
                />
              </div>
            </div>

            <div className="space-y-3 md:col-span-2">
              <h4 className="font-semibold text-gray-800">Date Posted</h4>
              <div className="flex flex-wrap gap-2">
                {datePostedOptions.map((option) => (
                  <FilterTag
                    key={option.id}
                    label={option.label}
                    isSelected={localFilters.datePosted === option.id}
                    onClick={() => handleDatePostedChange(option.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          <Button onClick={handleApply} className=" ">
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
