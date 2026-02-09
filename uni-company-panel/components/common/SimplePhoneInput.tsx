'use client';

import React from 'react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface SimplePhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SimplePhoneInput = ({ value, onChange, placeholder = 'Phone number' }: SimplePhoneInputProps) => {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
      <PhoneInput
        international
        defaultCountry="IN"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="!flex !items-center !p-0 !border-0"
        countrySelectProps={{
          className: "!border-r !border-gray-300 !pr-3 !mr-2 !w-[100px]",
          style: {
            borderRight: '2px solid #d1d5db',
            paddingRight: '12px',
            marginRight: '8px',
            minWidth: '100px'
          }
        }}
        inputProps={{
          className: "!border-0 !focus:ring-0 !pl-2 !text-base !w-full",
          style: {
            borderLeft: 'none',
            paddingLeft: '8px',
            width: '100%'
          }
        }}
        style={{
          '--PhoneInputCountryFlag-height': '1.5em',
          '--PhoneInputCountryFlag-width': '2em',
          '--PhoneInputCountrySelectArrow-color': '#6b7280',
        }}
      />
    </div>
  );
};

export default SimplePhoneInput;