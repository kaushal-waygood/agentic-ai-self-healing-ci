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
import { Filter, Search, Briefcase, TrendingUp, X, Globe, MapPin } from 'lucide-react';
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
  const [localFilters, setLocalFilters] = useState(initialFilters);

  // Your debounced logic is preserved
  const debouncedSearch = useCallback(
    debounce((filters) => {
      onSearchChange(filters);
    }, 500),
    [onSearchChange],
  );

  const handleInputChange = (name: string, value: string) => {
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);
    debouncedSearch(newFilters);
  };

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Job title, keywords, or company..."
            // value={localFilters.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
          />
        </div>
        <div className="flex-1 min-w-[150px] relative">
          <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Country"
            value={localFilters.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
          />
        </div>
        <div className="flex-1 min-w-[150px] relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="City"
            value={localFilters.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
          />
        </div>
        <button
          onClick={onOpenFilterModal}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200"
        >
          <Filter className="w-4 h-4" />
          More Filters
        </button>
      </div>
    </div>
  );
};
