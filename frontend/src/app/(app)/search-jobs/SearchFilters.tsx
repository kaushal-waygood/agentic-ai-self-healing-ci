'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

export const datePostedOptions = [
  { id: '1', label: 'Last 24 hours' },
  { id: '3', label: 'Last 3 days' },
  { id: '7', label: 'Last week' },
  { id: '30', label: 'Last month' },
];

interface SearchFiltersProps {
  filters: {
    query: string;
    country: string;
    city: string;
    datePosted: string;
  };
  onFilterChange: (name: string, value: string) => void;
  onSearchInput: (value: string) => void; // Changed to accept string directly
  onOpenFilterModal: () => void;
}

export const SearchFilters = ({
  filters,
  onFilterChange,
  onSearchInput,
  onOpenFilterModal,
}: SearchFiltersProps) => {
  const [localQuery, setLocalQuery] = useState(filters.query);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchInput(localQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [localQuery, onSearchInput]);

  return (
    <div className="flex justify-between items-center mb-6 gap-3">
      <div className="w-full flex gap-2">
        <div className="w-full">
          <Input
            placeholder="Search jobs..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="outline-none bg-white"
          />
        </div>

        <div className="w-full">
          <Input
            id="country"
            placeholder="Country"
            value={filters.country}
            onChange={(e) => onFilterChange('country', e.target.value)}
            className="outline-none bg-white"
          />
        </div>
        <div className="w-full">
          <Input
            id="city"
            placeholder="City"
            value={filters.city}
            onChange={(e) => onFilterChange('city', e.target.value)}
            className="outline-none bg-white"
          />
        </div>

        <div className="w-full">
          <Select
            value={filters.datePosted}
            onValueChange={(value) => onFilterChange('datePosted', value)}
          >
            <SelectTrigger className="outline-none bg-white">
              <SelectValue placeholder="Select date posted" />
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
      </div>

      <Button
        variant="outline"
        onClick={onOpenFilterModal}
        className="flex items-center gap-2 bg-white"
      >
        <Filter className="h-4 w-4" />
        Filters
      </Button>
    </div>
  );
};
