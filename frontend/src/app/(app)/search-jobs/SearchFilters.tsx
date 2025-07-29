'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter } from 'lucide-react';

// --- Types and Options ---

export const datePostedOptions = [
  { id: '1', label: 'Last 24 hours' },
  { id: '3', label: 'Last 3 days' },
  { id: '7', label: 'Last week' },
  { id: '30', label: 'Last month' },
];

interface FilterState {
  query: string;
  country: string;
  city: string;
  datePosted: string;
}

interface SearchFiltersProps {
  initialFilters: FilterState;
  onApply: (newFilters: FilterState) => void;
  onOpenFilterModal: () => void;
}

// --- Component ---

export const SearchFilters = ({
  initialFilters,
  onApply,
  onOpenFilterModal,
}: SearchFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(initialFilters);

  const handleInputChange = (name: keyof FilterState, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const handleApplyClick = () => {
    onApply(localFilters);
  };

  return (
    <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
      <div className="flex flex-1 items-center gap-2 min-w-[300px]">
        {/* Search Query Input */}
        <Input
          placeholder="Job title, keywords, or company"
          value={localFilters.query}
          onChange={(e) => handleInputChange('query', e.target.value)}
          className="outline-none bg-white"
        />

        {/* Country Input */}
        <Input
          placeholder="Country"
          value={localFilters.country}
          onChange={(e) => handleInputChange('country', e.target.value)}
          className="outline-none bg-white"
        />

        {/* City Input */}
        <Input
          placeholder="City"
          value={localFilters.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          className="outline-none bg-white"
        />

        {/* Date Posted Select */}
        <Select
          value={localFilters.datePosted}
          onValueChange={(value) => handleInputChange('datePosted', value)}
        >
          <SelectTrigger className="outline-none bg-white">
            <SelectValue placeholder="Date Posted" />
          </SelectTrigger>
          <SelectContent className="outline-none bg-white">
            {datePostedOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        {/* The button to apply all selected filters at once */}
        <Button onClick={handleApplyClick}>Search</Button>

        {/* Button to open the more advanced filter modal */}
        <Button
          variant="outline"
          onClick={onOpenFilterModal}
          className="flex items-center gap-2 bg-white"
        >
          <Filter className="h-4 w-4" />
          More Filters
        </Button>
      </div>
    </div>
  );
};
