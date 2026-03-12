'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  getCountries,
  getCountryCallingCode,
  type CountryCode,
  isValidPhoneNumber,
} from 'react-phone-number-input';
import { Input } from '@/components/ui/input';
import flags from 'react-phone-number-input/flags';
import { Search, ChevronDown } from 'lucide-react';

interface SimplePhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SimplePhoneInput = ({
  value,
  onChange,
  placeholder,
}: SimplePhoneInputProps) => {
  const countries = getCountries();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('IN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      for (const country of countries) {
        const code = getCountryCallingCode(country);
        if (value.startsWith(`+${code}`)) {
          setSelectedCountry(country);
          setPhoneNumber(value.replace(`+${code}`, '').trim());
          return;
        }
      }
    }
  }, [value, countries]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;

    return countries.filter((country) => {
      const countryName = country.toLowerCase();
      const code = getCountryCallingCode(country).toString();
      return (
        countryName.includes(searchQuery.toLowerCase()) ||
        code.includes(searchQuery) ||
        `+${code}`.includes(searchQuery)
      );
    });
  }, [countries, searchQuery]);

  const handleCountryChange = (countryCode: CountryCode) => {
    setSelectedCountry(countryCode);
    setIsDropdownOpen(false);
    setSearchQuery('');

    if (phoneNumber) {
      onChange(`+${getCountryCallingCode(countryCode)}${phoneNumber}`);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = e.target.value;
    setPhoneNumber(number);

    if (selectedCountry && number) {
      onChange(`+${getCountryCallingCode(selectedCountry)}${number}`);
    } else {
      onChange('');
    }
  };

  const FlagComponent =
    selectedCountry && flags[selectedCountry]
      ? flags[selectedCountry]
      : () => <span className="w-5 h-5 bg-gray-200 rounded"></span>;

  return (
    <div className="flex gap-2">
      <div className="w-[140px] flex-shrink-0 relative" ref={dropdownRef}>
        <div className="relative">
          <button
            type="button"
            className="flex items-center justify-between w-full px-3 py-2 h-10 border border-input bg-background rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              setTimeout(() => {
                searchInputRef.current?.focus();
              }, 100);
            }}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {mounted && <FlagComponent />}
              </div>
              <span className="text-sm font-medium ml-1">
                +{getCountryCallingCode(selectedCountry)}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>

          {isDropdownOpen && (
            <div className="absolute bottom-full left-0 mb-1 w-[300px] max-h-[300px] bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
              <div className="p-2 border-b bg-white sticky top-0 z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search country or code..."
                    className="pl-9 h-9 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-[240px] overflow-y-auto">
                {filteredCountries.map((code) => {
                  const CountryFlag =
                    flags[code] || (() => <div className="w-5 h-5"></div>);
                  return (
                    <button
                      key={code}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none cursor-pointer flex items-center gap-3"
                      onClick={() => handleCountryChange(code)}
                    >
                      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                        {mounted && <CountryFlag />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium truncate">
                            {code}
                          </span>
                          <span className="text-sm text-muted-foreground ml-2">
                            +{getCountryCallingCode(code)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredCountries.length === 0 && (
                  <div className="py-3 text-center text-sm text-gray-500">
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        <Input
          type="tel"
          placeholder={placeholder || 'Phone number'}
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          className="h-10"
        />
      </div>
    </div>
  );
};
