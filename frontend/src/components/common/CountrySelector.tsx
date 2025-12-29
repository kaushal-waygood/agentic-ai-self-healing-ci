// import React from 'react';
// import { countries } from 'countries-list';
// const countryOptions = Object.entries(countries).map(([code, country]) => ({
//   value: code, // e.g., 'US'
//   label: country.name, // e.g., 'United States'
// }));

// interface CountrySelectorProps {
//   value: string;
//   onChange: (value: string) => void;
//   className?: string;
// }

// const CountrySelector = ({
//   value,
//   onChange,
//   className,
// }: CountrySelectorProps) => {
//   return (
//     <select
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       className={className}
//     >
//       <option value="">Select a country</option>
//       {countryOptions.map((option) => (
//         <option key={option.value} value={option.value}>
//           {option.label}
//         </option>
//       ))}
//     </select>
//   );
// };

// export default CountrySelector;
'use client';

import * as React from 'react';
import { countries } from 'countries-list';
import { ChevronDown, Check } from 'lucide-react';

const countryOptions = Object.entries(countries).map(([code, country]) => ({
  value: code,
  label: country.name,
}));

interface CountrySelectorProps {
  value: string; // country code (e.g. "IN")
  onChange: (value: string) => void;
  className?: string;
}

export function CountrySelector({
  value,
  onChange,
  className,
}: CountrySelectorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const itemRefs = React.useRef<(HTMLLIElement | null)[]>([]);

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);

  const selectedCountry = countryOptions.find((c) => c.value === value);

  const filteredCountries = countryOptions.filter((country) =>
    country.label.toLowerCase().includes(search.toLowerCase()),
  );

  /* ---------------- Click outside ---------------- */
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ---------------- Keyboard navigation ---------------- */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, filteredCountries.length - 1));
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredCountries[highlightedIndex];
      if (selected) {
        onChange(selected.value); // ✅ send country code
        setOpen(false);
        setSearch('');
      }
    }

    if (e.key === 'Escape') {
      setOpen(false);
      setSearch('');
    }
  };

  /* ---------------- Auto scroll highlighted item ---------------- */
  React.useEffect(() => {
    const el = itemRefs.current[highlightedIndex];
    if (el) {
      el.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex]);

  /* Reset highlight when search changes */
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="w-full flex items-center justify-between rounded-lg
        border bg-white px-3 py-2 text-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className={selectedCountry ? '' : 'text-gray-400'}>
          {selectedCountry ? selectedCountry.label : 'Select a country'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg"
          onKeyDown={handleKeyDown}
        >
          {/* Search */}
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type country name..."
            className="w-full border-b px-3 py-2 text-sm focus:outline-none"
          />

          {/* Options */}
          <ul className="max-h-60 overflow-auto">
            {filteredCountries.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">
                No country found
              </li>
            )}

            {filteredCountries.map((country, index) => (
              <li
                key={country.value}
                ref={(el) => (itemRefs.current[index] = el)}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => {
                  onChange(country.value); // ✅ send code
                  setOpen(false);
                  setSearch('');
                }}
                className={`cursor-pointer px-3 py-2 text-sm
                flex items-center justify-between
                ${
                  index === highlightedIndex
                    ? 'bg-blue-100'
                    : 'hover:bg-blue-50'
                }`}
              >
                {country.label}
                {country.value === value && (
                  <Check className="h-4 w-4 text-purple-600" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CountrySelector;
