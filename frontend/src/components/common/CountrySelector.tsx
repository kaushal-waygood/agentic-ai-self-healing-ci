// /components/common/CountrySelector.tsx

import React from 'react';
import { countries } from 'countries-list';

// The data from 'countries-list' is an object like:
// { "US": { name: "United States", ... }, "IN": { name: "India", ... } }
// We should convert it into an array for easier mapping in a select dropdown.
const countryOptions = Object.entries(countries).map(([code, country]) => ({
  value: code, // e.g., 'US'
  label: country.name, // e.g., 'United States'
}));

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CountrySelector = ({
  value,
  onChange,
  className,
}: CountrySelectorProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      <option value="">Select a country</option>
      {countryOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default CountrySelector;
