'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { debounce } from 'lodash';

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
  onSearchChange: (newFilters: FilterState) => void;
  onOpenFilterModal: () => void;
}

export const SearchFilters = ({
  initialFilters,
  onSearchChange,
  onOpenFilterModal,
}: SearchFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(initialFilters);

  // Debounced search change handler
  const debouncedSearch = useCallback(
    debounce((filters: FilterState) => {
      onSearchChange(filters);
    }, 500),
    [],
  );

  const handleInputChange = (name: keyof FilterState, value: string) => {
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);
    debouncedSearch(newFilters);
  };

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  return (
    <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
      <div className="flex flex-1 items-center gap-2 min-w-[300px]">
        <Input
          placeholder="Job title, keywords, or company"
          value={localFilters.query}
          onChange={(e) => handleInputChange('query', e.target.value)}
          className="outline-none bg-white"
        />

        <Input
          placeholder="Country"
          value={localFilters.country}
          onChange={(e) => handleInputChange('country', e.target.value)}
          className="outline-none bg-white"
        />

        <Input
          placeholder="City"
          value={localFilters.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          className="outline-none bg-white"
        />

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
        {/* Only show the "More Filters" button now */}
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
