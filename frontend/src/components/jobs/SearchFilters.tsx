'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Filter, Search, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Input } from '../ui/input';

interface FilterState {
  query: string;
  country: string;
  countryCode: string;
  state: string;
  city: string;
  datePosted: string;
  employmentType: string[];
  experience: string[];
  education: string[];
}

interface SearchFiltersProps {
  initialFilters: Partial<FilterState>;
  onSearchChange: (newFilters: Partial<FilterState>) => Promise<void> | void;
  onOpenFilterModal: () => void;
}

const defaultFilters: FilterState = {
  query: '',
  country: '',
  countryCode: '',
  state: '',
  city: '',
  datePosted: '',
  employmentType: [],
  experience: [],
  education: [],
};

export const SearchFilters = ({
  initialFilters,
  onSearchChange,
  onOpenFilterModal,
}: SearchFiltersProps) => {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!searchParams) return;
  }, []);

  const [localFilters, setLocalFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchParams || isSearching) return;

    const query = searchParams.get('q') || '';
    const country = searchParams.get('country') || '';
    const countryCode = searchParams.get('countryCode') || '';
    const stateCode = searchParams.get('state') || '';
    const city = searchParams.get('city') || '';
    const datePosted = searchParams.get('datePosted') || '';

    const employmentTypeParam = searchParams.get('employmentType') || '';
    const experienceParam = searchParams.get('experience') || '';
    const educationParam = searchParams.get('education') || '';

    const employmentType = employmentTypeParam
      ? employmentTypeParam.split(',').filter(Boolean)
      : [];

    const experience = experienceParam
      ? experienceParam.split(',').filter(Boolean)
      : [];

    const education = educationParam
      ? educationParam.split(',').filter(Boolean)
      : [];

    setLocalFilters((prev) => ({
      ...prev,
      // query: query || prev.query,
      query: query,
      country: country || prev.country,
      countryCode: countryCode || prev.countryCode,
      state: stateCode || prev.state,

      city: city || prev.city,
      datePosted: datePosted || prev.datePosted,
      employmentType: employmentType.length
        ? employmentType
        : prev.employmentType,
      experience: experience.length ? experience : prev.experience,
      education: education.length ? education : prev.education,
    }));
  }, [searchParams, isSearching]);

  const prevInitialFiltersRef = useRef<string>('');
  useEffect(() => {
    if (!initialFilters) return;
    const serialized = JSON.stringify(initialFilters);
    if (prevInitialFiltersRef.current === serialized) return;
    prevInitialFiltersRef.current = serialized;
    setLocalFilters((prev) => ({
      ...defaultFilters,
      ...prev,
      ...initialFilters,
    }));
  }, [initialFilters]);

  const handleInputChange = useCallback(
    (name: keyof FilterState, value: string) => {
      setLocalFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [],
  );

  const handleSearchClick = useCallback(async () => {
    const searchFilters: Partial<FilterState> = {
      query: localFilters.query,
      country: localFilters.country,
      countryCode: localFilters.countryCode,
      state: localFilters.state,
      city: localFilters.city,
      datePosted: localFilters.datePosted,
      employmentType: [...localFilters.employmentType],
      experience: [...localFilters.experience],
      education: [...localFilters.education],
    };

    setIsSearching(true);
    try {
      await Promise.resolve(onSearchChange(searchFilters));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [localFilters, onSearchChange]);

  const onSearchChangeRef = useRef(onSearchChange);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!isSearching) handleSearchClick();
      }
    },
    [isSearching, handleSearchClick],
  );

  return (
    <div className="p-2 md:p-1 mb-2 transition-all duration-300 animate-in fade-in slide-in-from-top-5 duration-500">
      <div className="flex flex-col lg:flex-row gap-2 ">
        <div className="relative w-full bg-white">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 group-focus-within:text-blue-500 transition-colors" />
          <Input
            id="search-bar"
            type="text"
            placeholder="economist in New York, NY | system design in San Francisco, CA"
            value={localFilters.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            autoFocus
            onKeyDown={handleKeyDown}
            className="!pl-10 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all border-2"
            aria-label="Search jobs"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 w-full md:w-auto">
          <button
            onClick={handleSearchClick}
            disabled={isSearching}
            className={`flex items-center justify-center gap-2 bg-buttonPrimary text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md ${
              isSearching
                ? 'cursor-not-allowed opacity-75'
                : 'hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95'
            }`}
          >
            {isSearching ? (
              <Loader2 className="size-4 shrink-0 text-white animate-spin" />
            ) : (
              <Search className="size-4 shrink-0 text-white" />
            )}
            <span>{isSearching ? 'Searching...' : 'Search'}</span>
          </button>

          <button
            onClick={onOpenFilterModal}
            className="flex items-center justify-center gap-2 bg-buttonPrimary text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:scale-105 hover:shadow-lg hover:brightness-110 active:scale-95"
          >
            <Filter className="size-4 shrink-0 text-white" />
            <span>Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
