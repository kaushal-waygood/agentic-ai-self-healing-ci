import React, { useMemo } from 'react';
import { City } from 'country-state-city';

interface CitySelectorProps {
  countryCode: string;
  stateCode: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CitySelector = ({
  countryCode,
  stateCode,
  value,
  onChange,
  className,
}: CitySelectorProps) => {
  const cityOptions = useMemo(() => {
    if (!countryCode || !stateCode) return [];
    return City.getCitiesOfState(countryCode, stateCode)?.map((city) => ({
      value: city.name,
      label: city.name,
    }));
  }, [countryCode, stateCode]);

  const hasCities = cityOptions && cityOptions.length > 0;
  const isDisabled = !countryCode || !stateCode || !hasCities;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={isDisabled}
      className={className}
    >
      <option value="">
        {!countryCode
          ? 'Select country first'
          : !stateCode
          ? 'Select state first'
          : hasCities
          ? 'Select city'
          : 'No cities found'}
      </option>
      {/* ✅ THE FIX IS HERE 👇 */}
      {cityOptions?.map((option, index) => (
        <option key={`${option.value}-${index}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default CitySelector;
