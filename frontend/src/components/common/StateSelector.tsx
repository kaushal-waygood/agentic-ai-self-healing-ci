// /components/common/StateSelector.tsx

import React, { useMemo } from 'react';
import { State } from 'country-state-city';

interface StateSelectorProps {
  countryCode: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const StateSelector = ({
  countryCode,
  value,
  onChange,
  className,
}: StateSelectorProps) => {
  const stateOptions = useMemo(() => {
    if (!countryCode) return [];
    // Get all states for the selected country
    return State.getStatesOfCountry(countryCode)?.map((state) => ({
      value: state.isoCode, // Use the unique ISO code for the state
      label: state.name,
    }));
  }, [countryCode]); // Only recalculate when countryCode changes

  const hasStates = stateOptions && stateOptions.length > 0;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={!hasStates}
      className={className}
    >
      <option value="">
        {countryCode
          ? hasStates
            ? 'Select state'
            : 'No states found'
          : 'Select country first'}
      </option>
      {stateOptions?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default StateSelector;
