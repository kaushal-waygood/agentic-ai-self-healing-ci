// // /components/jobs/SearchFilters.tsx (Final Version)

// 'use client';

// import { useState, useEffect } from 'react';
// import {
//   Filter,
//   Search,
//   Globe,
//   MapPin,
//   SearchCheckIcon,
//   SearchIcon,
// } from 'lucide-react';
// import CountrySelector from '../common/CountrySelector';
// import StateSelector from '../common/StateSelector.tsx'; // <-- Import new component
// import CitySelector from '../common/CitySelector';

// // Update state to include 'state'
// interface FilterState {
//   query: string;
//   country: string;
//   state: string; // <-- Add state
//   city: string;
// }

// interface SearchFiltersProps {
//   initialFilters: FilterState;
//   onSearchChange: (newFilters: Partial<FilterState>) => void;
//   onOpenFilterModal: () => void;
// }

// export const SearchFilters = ({
//   initialFilters,
//   onSearchChange,
//   onOpenFilterModal,
// }: SearchFiltersProps) => {
//   const [localFilters, setLocalFilters] = useState(initialFilters);

//   useEffect(() => {
//     setLocalFilters(initialFilters);
//   }, [initialFilters]);

//   const handleInputChange = (name: string, value: string) => {
//     const newFilters = { ...localFilters, [name]: value };
//     setLocalFilters(newFilters);
//     onSearchChange({ [name]: value });
//   };

//   // When country changes, reset both state AND city
//   const handleCountryChange = (countryCode: string) => {
//     const newFilters = {
//       ...localFilters,
//       country: countryCode,
//       state: '',
//       city: '',
//     };
//     setLocalFilters(newFilters);
//     onSearchChange({ country: countryCode, state: '', city: '' });
//   };

//   // NEW: When state changes, reset the city
//   const handleStateChange = (stateCode: string) => {
//     const newFilters = { ...localFilters, state: stateCode, city: '' };
//     setLocalFilters(newFilters);
//     onSearchChange({ state: stateCode, city: '' });
//   };

//   return (
//     <div className="p-4 md:p-1 mb-2">
//       <div className="flex flex-wrap items-center gap-4">
//         <div className="flex-1 min-w-[250px] relative ">
//           <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Job title, keywords, or company..."
//             value={localFilters.query}
//             onChange={(e) => handleInputChange('query', e.target.value)}
//             className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50"
//           />
//         </div>
//         {/* Country Selector */}
//         <div className="flex-1 min-w-[150px] relative">
//           <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
//           <CountrySelector
//             value={localFilters.country || ''}
//             onChange={handleCountryChange}
//             className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50 appearance-none"
//           />
//         </div>

//         {/* State Selector */}
//         <div className="flex-1 min-w-[150px] relative">
//           <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
//           <StateSelector
//             countryCode={localFilters.country}
//             value={localFilters.state}
//             onChange={handleStateChange}
//             className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50 appearance-none disabled:bg-gray-200 disabled:cursor-not-allowed"
//           />
//         </div>
//         {/* Search button  */}
//         <button
//           // onClick={}
//           className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200/50"
//         >
//           <SearchIcon className="w-4 h-4" />
//           Search
//         </button>

//         {/* City Selector */}
//         {/* <div className="flex-1 min-w-[150px] relative">
//           <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
//           <CitySelector
//             countryCode={localFilters.country}
//             stateCode={localFilters.state}
//             value={localFilters.city}
//             onChange={(city) => handleInputChange('city', city)}
//             className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50 appearance-none disabled:bg-gray-200 disabled:cursor-not-allowed"
//           />
//         </div> */}

//         {/* More Filters Button */}
//         <button
//           onClick={onOpenFilterModal}
//           className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200/50"
//         >
//           <Filter className="w-4 h-4" />
//           Filters
//         </button>
//       </div>
//     </div>
//   );
// };

// 'use client';

// import { useState, useEffect } from 'react';
// import { Filter, Search, Globe, MapPin, SearchIcon } from 'lucide-react';
// import CountrySelector from '../common/CountrySelector';
// import StateSelector from '../common/StateSelector.tsx';
// import CitySelector from '../common/CitySelector';

// interface FilterState {
//   query: string;
//   country: string;
//   state: string;
//   city: string;
// }

// interface SearchFiltersProps {
//   initialFilters: FilterState;
//   onSearchChange: (newFilters: Partial<FilterState>) => void;
//   onOpenFilterModal: () => void;
// }

// export const SearchFilters = ({
//   initialFilters,
//   onSearchChange,
//   onOpenFilterModal,
// }: SearchFiltersProps) => {
//   const [localFilters, setLocalFilters] = useState(initialFilters);

//   useEffect(() => {
//     setLocalFilters(initialFilters);
//   }, [initialFilters]);

//   const handleInputChange = (name: string, value: string) => {
//     setLocalFilters((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCountryChange = (countryCode: string) => {
//     setLocalFilters({
//       ...localFilters,
//       country: countryCode,
//       state: '',
//       city: '',
//     });
//   };

//   const handleStateChange = (stateCode: string) => {
//     setLocalFilters({
//       ...localFilters,
//       state: stateCode,
//       city: '',
//     });
//   };

//   // 🔍 Trigger actual search when button clicked
//   const handleSearchClick = () => {
//     onSearchChange(localFilters);
//   };

//   return (
//     <div className="p-4 md:p-1 mb-2">
//       <div className="flex flex-wrap items-center gap-4">
//         {/* Search box */}
//         <div className="flex-1 min-w-[250px] relative ">
//           <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Job title, keywords, or company..."
//             value={localFilters.query}
//             onChange={(e) => handleInputChange('query', e.target.value)}
//             className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50"
//           />
//         </div>

//         {/* Country Selector */}
//         <div className="flex-1 min-w-[150px] relative">
//           <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
//           <CountrySelector
//             value={localFilters.country || ''}
//             onChange={handleCountryChange}
//             className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50 appearance-none"
//           />
//         </div>

//         {/* State Selector */}
//         <div className="flex-1 min-w-[150px] relative">
//           <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
//           <StateSelector
//             countryCode={localFilters.country}
//             value={localFilters.state}
//             onChange={handleStateChange}
//             className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50 appearance-none disabled:bg-gray-200 disabled:cursor-not-allowed"
//           />
//         </div>

//         {/* 🔍 Search Button */}
//         <button
//           onClick={handleSearchClick}
//           className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200/50"
//         >
//           <SearchIcon className="w-4 h-4" />
//           Search
//         </button>

//         {/* Filter Modal Button */}
//         <button
//           onClick={onOpenFilterModal}
//           className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200/50"
//         >
//           <Filter className="w-4 h-4" />
//           Filters
//         </button>
//       </div>
//     </div>
//   );
// };

'use client';

import { useState, useEffect } from 'react';
import {
  Filter,
  Search,
  Globe,
  MapPin,
  SearchIcon,
  Loader2,
  Loader2Icon,
} from 'lucide-react';
import CountrySelector from '../common/CountrySelector';
import StateSelector from '../common/StateSelector.tsx';
import CitySelector from '../common/CitySelector';

interface FilterState {
  query: string;
  country: string;
  state: string;
  city: string;
}

interface SearchFiltersProps {
  initialFilters: FilterState;
  // parent may return void or a Promise; we handle both
  onSearchChange: (newFilters: Partial<FilterState>) => Promise<void> | void;
  onOpenFilterModal: () => void;
}

export const SearchFilters = ({
  initialFilters,
  onSearchChange,
  onOpenFilterModal,
}: SearchFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(
    initialFilters ?? { query: '', country: '', state: '', city: '' },
  );
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setLocalFilters(initialFilters);
  }, [initialFilters]);

  const handleInputChange = (name: keyof FilterState, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (countryCode: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      country: countryCode,
      state: '',
      city: '',
    }));
  };

  const handleStateChange = (stateCode: string) => {
    setLocalFilters((prev) => ({ ...prev, state: stateCode, city: '' }));
  };

  // Handles sync or async parent handlers
  const handleSearchClick = () => {
    setIsSearching(true);

    // delay actual search so React can render the "Searching..." state
    setTimeout(async () => {
      try {
        await Promise.resolve(onSearchChange(localFilters));
      } finally {
        setIsSearching(false);
      }
    }, 2000);
  };

  // Support pressing Enter in the text box
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isSearching) handleSearchClick();
    }
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
            onKeyDown={handleKeyDown}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50"
          />
        </div>

        <div className="flex-1 min-w-[150px] relative">
          <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <CountrySelector
            value={localFilters.country || ''}
            onChange={handleCountryChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50 appearance-none"
          />
        </div>

        <div className="flex-1 min-w-[150px] relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <StateSelector
            countryCode={localFilters.country}
            value={localFilters.state}
            onChange={handleStateChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-gray-50 appearance-none disabled:bg-gray-200 disabled:cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleSearchClick}
          disabled={isSearching}
          aria-busy={isSearching}
          className={`flex items-center gap-2 px-6 py-3  rounded-xl font-semibold transition-all duration-300 transform ${
            isSearching
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white hover:scale-105 shadow-lg hover:shadow-purple-200/50'
          }`}
        >
          {isSearching ? (
            <>
              {/* ✅ Use Loader2, not Loader2Icon */}
              <Loader2 className="w-4 h-4 animate-spin" /> Search
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
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-200/50"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>
    </div>
  );
};
