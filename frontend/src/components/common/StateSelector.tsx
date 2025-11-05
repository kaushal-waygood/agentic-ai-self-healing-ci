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
    const states = State.getStatesOfCountry(countryCode);
    return states?.map((state) => ({
      value: state.isoCode,
      label: state.name,
    }));
  }, [countryCode]);

  const hasStates = stateOptions && stateOptions.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={!hasStates}
      className={className}
    >
      <option value="">
        {countryCode
          ? hasStates
            ? 'Select State'
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
