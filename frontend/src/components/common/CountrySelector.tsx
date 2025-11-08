import React from 'react';
import { countries } from 'countries-list';
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
