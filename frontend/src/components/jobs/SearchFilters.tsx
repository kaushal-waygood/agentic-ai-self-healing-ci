'use client';

import { useState, useEffect, useCallback } from 'react';
import { Filter, Search, SearchIcon, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { State } from 'country-state-city';

interface FilterState {
  query: string;
  country: string;
  state: string; // stores code in UI, converted to name on search
  city: string;
  datePosted: string;
  employmentType: string[];
}

interface SearchFiltersProps {
  initialFilters: Partial<FilterState>;
  onSearchChange: (newFilters: Partial<FilterState>) => Promise<void> | void;
  onOpenFilterModal: () => void;
}

const defaultFilters: FilterState = {
  query: '',
  country: '',
  state: '',
  city: '',
  datePosted: '',
  employmentType: [],
};

export const SearchFilters = ({
  initialFilters,
  onSearchChange,
  onOpenFilterModal,
}: SearchFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [localFilters, setLocalFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  });
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchParams) return;

    const query = searchParams.get('q') || '';
    const country = searchParams.get('country') || '';
    const countryCode = searchParams.get('countryCode') || '';
    const stateCode = searchParams.get('stateCode') || '';
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
      query: query || prev.query,
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
  }, [searchParams]);

  // Keep prop -> state sync predictable
  useEffect(() => {
    if (!initialFilters) return;
    setLocalFilters((prev) => ({
      ...defaultFilters,
      ...prev, // preserve user edits if parent trickles partial updates
      ...initialFilters, // but let incoming props win
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

  const handleCountryChange = useCallback(
    (countryCode: string, countryName: string) => {
      setLocalFilters((prev: any) => ({
        ...prev,
        country: countryName, // what you will "send" / show
        countryCode, // what StateSelector needs
        state: '', // reset state when country changes
      }));
    },
    [],
  );

  const handleStateChange = useCallback((stateCode: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      state: stateCode,
    }));
  }, []);

  const getStateName = (countryCode: string, stateCode: string): string => {
    if (!countryCode || !stateCode) return '';
    const st = State.getStateByCodeAndCountry(stateCode, countryCode);
    return st?.name || stateCode;
  };

  const pushFiltersToUrl = (filters: FilterState) => {
    console.log(filters);
    const params = new URLSearchParams();

    const stateName = getStateName(filters.countryCode, filters.state);

    if (filters.query) params.set('q', filters.query);

    if (filters.country) params.set('country', filters.country);
    if (filters.countryCode) params.set('countryCode', filters.countryCode);

    if (stateName) {
      params.set('state', stateName); // readable in URL
      params.set('stateCode', filters.state); // keeps code in URL too
    }

    if (filters.city) params.set('city', filters.city);
    if (filters.datePosted) params.set('datePosted', filters.datePosted);

    if (filters.employmentType.length > 0) {
      params.set('employmentType', filters.employmentType.join(','));
    }

    if (filters.experience.length > 0) {
      params.set('experience', filters.experience.join(','));
    }

    if (filters.education.length > 0) {
      params.set('education', filters.education.join(','));
    }

    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : '?';

    router.push(url, { scroll: false });
  };

  const handleSearchClick = useCallback(async () => {
    const stateName = getStateName(
      localFilters.countryCode,
      localFilters.state,
    );

    const searchFilters: Partial<FilterState> = {
      query: localFilters.query,
      country: localFilters.country,
      countryCode: localFilters.countryCode,
      state: stateName, // backend gets name
      city: localFilters.city,
      datePosted: localFilters.datePosted,
      employmentType: [...localFilters.employmentType],
      experience: [...localFilters.experience],
      education: [...localFilters.education],
    };

    setIsSearching(true);
    try {
      pushFiltersToUrl({
        ...localFilters,
        state: localFilters.state, // still code here
        country: localFilters.country,
        countryCode: localFilters.countryCode,
      });

      await Promise.resolve(onSearchChange(searchFilters));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [localFilters, onSearchChange]);

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
    <div className="p-2 md:p-1 mb-2">
      {/* <div className="flex items-center justify-between gap-2 "> */}
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="input-search-box-div w-full">
          <Search className="input-search-icon  " />
          <input
            id="search-bar"
            type="text"
            placeholder="economist in New York, NY | system design in San Francisco, CA"
            value={localFilters.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-none outline-none w-full"
            aria-label="Search jobs"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
          <button
            onClick={handleSearchClick}
            disabled={isSearching}
            aria-busy={isSearching}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform ${
              isSearching
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-buttonPrimary hover:to-blue-600 text-white hover:scale-105 shadow-lg hover:shadow-purple-200/50'
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
            className="flex items-center justify-center gap-2 bg-buttonPrimary hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200/50"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
