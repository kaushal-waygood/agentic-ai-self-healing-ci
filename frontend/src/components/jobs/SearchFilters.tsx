// /components/jobs/SearchFilters.tsx (Final Version)

'use client';

import { useState, useEffect } from 'react';
import { Filter, Search, Globe, MapPin } from 'lucide-react';
import CountrySelector from '../common/CountrySelector';
import StateSelector from '../common/StateSelector.tsx'; // <-- Import new component
import CitySelector from '../common/CitySelector';

// Update state to include 'state'
interface FilterState {
  query: string;
  country: string;
  state: string; // <-- Add state
  city: string;
}

interface SearchFiltersProps {
  initialFilters: FilterState;
  onSearchChange: (newFilters: Partial<FilterState>) => void;
  onOpenFilterModal: () => void;
}

export const SearchFilters = ({
  initialFilters,
  onSearchChange,
  onOpenFilterModal,
}: SearchFiltersProps) => {
  const [localFilters, setLocalFilters] = useState(initialFilters);

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const handleInputChange = (name: string, value: string) => {
    const newFilters = { ...localFilters, [name]: value };
    setLocalFilters(newFilters);
    onSearchChange({ [name]: value });
  };

  // When country changes, reset both state AND city
  const handleCountryChange = (countryCode: string) => {
    const newFilters = {
      ...localFilters,
      country: countryCode,
      state: '',
      city: '',
    };
    setLocalFilters(newFilters);
    onSearchChange({ country: countryCode, state: '', city: '' });
  };

  // NEW: When state changes, reset the city
  const handleStateChange = (stateCode: string) => {
    const newFilters = { ...localFilters, state: stateCode, city: '' };
    setLocalFilters(newFilters);
    onSearchChange({ state: stateCode, city: '' });
  };

  return (
    <div className="p-4 md:p-1 mb-2">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[250px] relative ">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Job title, keywords, or company..."
            value={localFilters.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50"
          />
        </div>
        {/* Country Selector */}
        <div className="flex-1 min-w-[150px] relative">
          <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <CountrySelector
            value={localFilters.country || ''}
            onChange={handleCountryChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50 appearance-none"
          />
        </div>

        {/* State Selector */}
        <div className="flex-1 min-w-[150px] relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <StateSelector
            countryCode={localFilters.country}
            value={localFilters.state}
            onChange={handleStateChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50 appearance-none disabled:bg-gray-200 disabled:cursor-not-allowed"
          />
        </div>

        {/* More Filters Button */}
        <button
          onClick={onOpenFilterModal}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200/50"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>
    </div>
  );
};
