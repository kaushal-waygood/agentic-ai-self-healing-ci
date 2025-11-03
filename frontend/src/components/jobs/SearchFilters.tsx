'use client';

import { useState, useEffect } from 'react';
import {
  Filter,
  Search,
  Globe,
  MapPin,
  SearchIcon,
  Loader2,
} from 'lucide-react';
import CountrySelector from '../common/CountrySelector';
import StateSelector from '../common/StateSelector';
import { State } from 'country-state-city';

// Update the interface to match your actual data structure
interface FilterState {
  query: string;
  country: string;
  state: string;
  city: string;
  datePosted: string;
  employmentType: string[];
}

interface SearchFiltersProps {
  initialFilters: Partial<FilterState>;
  onSearchChange: (newFilters: Partial<FilterState>) => Promise<void> | void;
  onOpenFilterModal: () => void;
}

export const SearchFilters = ({
  initialFilters,
  onSearchChange,
  onOpenFilterModal,
}: SearchFiltersProps) => {
  const defaultFilters: FilterState = {
    query: '',
    country: '',
    state: '',
    city: '',
    datePosted: '',
    employmentType: [],
  };

  const [localFilters, setLocalFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  });

  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (initialFilters) {
      setLocalFilters((prev) => ({
        ...defaultFilters,
        ...prev,
        ...initialFilters,
      }));
    }
  }, [initialFilters]);

  const handleInputChange = (name: keyof FilterState, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryChange = (countryCode: string) => {
    console.log('Country changed to:', countryCode);
    setLocalFilters((prev) => ({
      ...prev,
      country: countryCode,
      state: '', // Reset state when country changes
    }));
  };

  const handleStateChange = (stateCode: string) => {
    console.log('State changed to:', stateCode);
    setLocalFilters((prev) => ({
      ...prev,
      state: stateCode,
    }));
  };

  // Helper function to get state name from state code
  const getStateName = (countryCode: string, stateCode: string): string => {
    if (!countryCode || !stateCode) return '';
    const state = State.getStateByCodeAndCountry(stateCode, countryCode);
    return state?.name || stateCode; // Return state name or fallback to code
  };

  const handleSearchClick = () => {
    console.log('Current localFilters before search:', localFilters);

    // Convert state code to full state name for API call
    const stateName = getStateName(localFilters.country, localFilters.state);

    const searchFilters = {
      query: localFilters.query,
      country: localFilters.country,
      state: stateName, // Send full state name instead of code
      city: localFilters.city,
      datePosted: localFilters.datePosted,
      employmentType: [...localFilters.employmentType],
    };

    console.log('searchFilters being sent:', searchFilters);

    setIsSearching(true);

    requestAnimationFrame(async () => {
      try {
        await Promise.resolve(onSearchChange(searchFilters));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isSearching) handleSearchClick();
    }
  };

  return (
    <div className="p-2 md:p-1 mb-2">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[250px] relative ">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Job title, keywords, or company..."
            value={localFilters.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50"
          />
        </div>

        <div className="flex-1 min-w-[150px] relative">
          <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <CountrySelector
            value={localFilters.country || ''}
            onChange={handleCountryChange}
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50 appearance-none"
          />
        </div>

        <div className="flex-1 min-w-[150px] relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <StateSelector
            countryCode={localFilters.country}
            value={localFilters.state}
            onChange={handleStateChange}
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50 appearance-none disabled:bg-gray-200 disabled:cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleSearchClick}
          disabled={isSearching}
          aria-busy={isSearching}
          className={`flex items-center gap-2 px-6 py-2  rounded-xl font-semibold transition-all duration-300 transform ${
            isSearching
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white hover:scale-105 shadow-lg hover:shadow-purple-200/50'
          }`}
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Searching...
            </>
          ) : (
            <>
              <SearchIcon className="w-4 h-4" />
              Search
            </>
          )}
        </button>

        <button
          onClick={onOpenFilterModal}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200/50"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;
