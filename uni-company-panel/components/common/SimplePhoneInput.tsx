'use client';

import React from 'react';
import PhoneInput from 'react-phone-number-input';
import { Input } from '@/components/ui/input';
import 'react-phone-number-input/style.css';

export const SimplePhoneInput = ({ value, onChange }: any) => {
  return (
    <div className="flex items-center gap-2">
      <PhoneInput
        international
        defaultCountry="IN"
        value={value}
        onChange={onChange}
        inputComponent={Input}
        className="flex w-full"
        countrySelectProps={{
          className:
            'h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer hover:bg-accent hover:text-accent-foreground',
        }}
      />
    </div>
  );
};