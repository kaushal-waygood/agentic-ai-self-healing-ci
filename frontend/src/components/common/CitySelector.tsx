'use client';

import React, { useMemo } from 'react';
import { City } from 'country-state-city';
import { ChevronDown, Check } from 'lucide-react';

interface CitySelectorProps {
  countryCode: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CitySelector = ({
  countryCode,
  value,
  onChange,
  className,
}: CitySelectorProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const itemRefs = React.useRef<(HTMLLIElement | null)[]>([]);

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);

  const cityOptions = useMemo(() => {
    if (!countryCode) return [];

    return (
      City.getCitiesOfCountry(countryCode)?.map((city) => ({
        value: city.name,
        label: city.name,
      })) || []
    );
  }, [countryCode]);

  const filteredCities = useMemo(() => {
    if (!search) return cityOptions;
    return cityOptions.filter((c) =>
      c.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [cityOptions, search]);

  const hasCities = cityOptions.length > 0;
  const isDisabled = !countryCode || !hasCities;

  // click outside
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

  // keyboard nav
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, filteredCities.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const sel = filteredCities[highlightedIndex];
      if (sel) {
        onChange(sel.value);
        setOpen(false);
        setSearch('');
      }
    }
    if (e.key === 'Escape') {
      setOpen(false);
      setSearch('');
    }
  };

  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  React.useEffect(() => {
    const el = itemRefs.current[highlightedIndex];
    if (el) {
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [highlightedIndex]);

  const selectedCity = cityOptions.find((c) => c.value === value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="w-full flex items-center justify-between rounded-lg
       border bg-white px-3 py-2 text-sm
       focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isDisabled}
      >
        <span className={selectedCity ? '' : 'text-gray-400'}>
          {isDisabled
            ? !countryCode
              ? 'Select country first'
              : 'No cities found'
            : selectedCity
              ? selectedCity.label
              : 'Select a city'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {open && !isDisabled && (
        <div
          className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg"
          onKeyDown={handleKeyDown}
        >
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type city name..."
            className="w-full border-b px-3 py-2 text-sm focus:outline-none"
          />
          <ul className="max-h-60 overflow-auto">
            {filteredCities.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">No city found</li>
            )}
            {filteredCities.map((city, index) => (
              <li
                key={city.value + '-' + index}
                ref={(el) => (itemRefs.current[index] = el)}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => {
                  onChange(city.value);
                  setOpen(false);
                  setSearch('');
                }}
                className={`cursor-pointer px-3 py-2 text-sm flex items-center justify-between
               ${
                 index === highlightedIndex ? 'bg-blue-100' : 'hover:bg-blue-50'
               }`}
              >
                {city.label}
                {city.value === value && (
                  <Check className="h-4 w-4 text-purple-600" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CitySelector;
