'use client';

import React, { useMemo } from 'react';
import { City, State } from 'country-state-city';

interface CitySelectorProps {
  countryCode: string;
  stateName: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CitySelector = ({
  countryCode,
  stateName,
  value,
  onChange,
  className,
}: CitySelectorProps) => {
  const cityOptions = useMemo(() => {
    if (!countryCode || !stateName) return [];

    const states = State.getStatesOfCountry(countryCode);
    const stateObj = states.find(s => s.name === stateName);

    if (!stateObj) return [];

    return City.getCitiesOfState(countryCode, stateObj.isoCode)?.map((city) => ({
      value: city.name,
      label: city.name,
    })) || [];
  }, [countryCode, stateName]);

  const hasCities = cityOptions && cityOptions.length > 0;
  const isDisabled = !countryCode || !stateName || !hasCities;

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
          : !stateName
            ? 'Select state first'
            : hasCities
              ? 'Select city'
              : 'No cities found'}
      </option>
      {cityOptions.map((option, index) => (
        <option key={`${option.value}-${index}`} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default CitySelector;