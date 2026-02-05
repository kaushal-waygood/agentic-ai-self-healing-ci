'use client';

import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import CountrySelector from '@/components/common/CountrySelector';
import StateSelector from '@/components/common/StateSelector';
import CitySelector from '@/components/common/CitySelector';

interface LocationSelectorProps {
    value: {
        country: string;
        state: string;
        city: string;
    };
    onChange: (location: { country: string; state: string; city: string }) => void;
    className?: string;
}

const LocationSelector = ({ value, onChange, className }: LocationSelectorProps) => {
    const [internalValue, setInternalValue] = useState(value || { country: '', state: '', city: '' });

    useEffect(() => {
        if (value) {
            setInternalValue(value);
        }
    }, [value]);

    const handleChange = (field: keyof typeof internalValue, newValue: string) => {
        const updated = { ...internalValue, [field]: newValue };

        if (field === 'country') {
            updated.state = '';
            updated.city = '';
        } else if (field === 'state') {
            updated.city = '';
        }

        setInternalValue(updated);
        onChange(updated);
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Country */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500">Country</label>
                <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white">
                    <MapPin size={16} className="text-gray-400" />
                    <CountrySelector
                        value={internalValue.country}
                        onChange={(countryCode) => handleChange('country', countryCode)}
                        className="w-full border-none focus:ring-0"
                    />
                </div>
            </div>

            {/* State */}
            {internalValue.country && (
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">State/Province</label>
                    <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white">
                        <MapPin size={16} className="text-gray-400" />
                        <StateSelector
                            countryCode={internalValue.country}
                            value={internalValue.state}
                            onChange={(stateName) => handleChange('state', stateName)}
                            className="w-full border-none focus:ring-0"
                        />
                    </div>
                </div>
            )}

            {/* City */}
            {internalValue.state && (
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">City</label>
                    <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-white">
                        <MapPin size={16} className="text-gray-400" />
                        <CitySelector
                            countryCode={internalValue.country}
                            stateName={internalValue.state}
                            value={internalValue.city}
                            onChange={(cityName) => handleChange('city', cityName)}
                            className="w-full border-none focus:ring-0"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationSelector; 