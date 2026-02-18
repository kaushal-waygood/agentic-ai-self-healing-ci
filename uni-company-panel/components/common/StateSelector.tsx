// // /components/common/StateSelector.tsx
// import React, { useMemo } from 'react';
// import { State } from 'country-state-city';

// interface StateSelectorProps {
//   countryCode: string;
//   value: string;
//   onChange: (value: string) => void;
//   className?: string;
// }

// const StateSelector = ({
//   countryCode,
//   value,
//   onChange,
//   className,
// }: StateSelectorProps) => {
//   const stateOptions = useMemo(() => {
//     if (!countryCode) return [];
//     const states = State.getStatesOfCountry(countryCode);
//     return states?.map((state) => ({
//       value: state.isoCode,
//       label: state.name,
//     }));
//   }, [countryCode]);

//   const hasStates = stateOptions && stateOptions.length > 0;

//   const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     onChange(e.target.value);
//   };

//   return (
//     <select
//       value={value}
//       onChange={handleChange}
//       disabled={!hasStates}
//       className={className}
//     >
//       <option value="">
//         {countryCode
//           ? hasStates
//             ? 'Select State'
//             : 'No states found'
//           : 'Select country first'}
//       </option>
//       {stateOptions?.map((option) => (
//         <option key={option.value} value={option.label}>
//           {option.label}
//         </option>
//       ))}
//     </select>
//   );
// };

// export default StateSelector;

'use client';

// /components/common/StateSelector.tsx
import * as React from 'react';
import { State } from 'country-state-city';
import { ChevronDown, Check } from 'lucide-react';

interface StateSelectorProps {
  countryCode: string; // e.g. "IN"
  value: string; // state NAME, e.g. "Uttar Pradesh"
  onChange: (value: string) => void;
  className?: string;
}

const StateSelector = ({
  countryCode,
  value,
  onChange,
  className,
}: StateSelectorProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);

  const stateOptions = React.useMemo(() => {
    if (!countryCode) return [];
    return State.getStatesOfCountry(countryCode).map((state) => ({
      value: state.isoCode, // kept for internal use only
      label: state.name, // 👈 THIS is sent to backend
    }));
  }, [countryCode]);

  // 🔑 value is state NAME now
  const selectedState = stateOptions.find((s) => s.label === value);

  const filteredStates = stateOptions.filter((state) =>
    state.label.toLowerCase().includes(search.toLowerCase()),
  );

  const disabled = !countryCode || stateOptions.length === 0;

  /* ---------------- Click outside ---------------- */
  React.useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

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
      setHighlightedIndex((i) => Math.min(i + 1, filteredStates.length - 1));
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredStates[highlightedIndex];
      if (selected) {
        onChange(selected.label);
        setOpen(false);
        setSearch('');
      }
    }

    if (e.key === 'Escape') {
      setOpen(false);
      setSearch('');
    }
  };

  /* Reset highlight when search changes */
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);
  const itemRefs = React.useRef<(HTMLLIElement | null)[]>([]);
  React.useEffect(() => {
    const el = itemRefs.current[highlightedIndex];
    if (el) {
      el.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={`w-full flex items-center justify-between rounded-lg
        border px-3 py-2 text-sm bg-white
        ${
          disabled
            ? 'cursor-not-allowed bg-gray-100 text-gray-400'
            : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
        }`}
      >
        <span className={selectedState ? '' : 'text-gray-400'}>
          {selectedState
            ? selectedState.label
            : countryCode
              ? 'Select state'
              : 'Select country first'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {/* Dropdown */}
      {open && !disabled && (
        <div
          className="absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-lg"
          onKeyDown={handleKeyDown}
        >
          {/* Search */}
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type state name..."
            className="w-full border-b px-3 py-2 text-sm focus:outline-none"
          />

          {/* List */}
          <ul className="max-h-60 overflow-auto">
            {filteredStates.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500">
                No state found
              </li>
            )}

            {filteredStates.map((state, index) => (
              <li
                key={state.value}
                ref={(el) => (itemRefs.current[index] = el)}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => {
                  onChange(state.label);
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
                {state.label}
                {state.label === value && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StateSelector;
