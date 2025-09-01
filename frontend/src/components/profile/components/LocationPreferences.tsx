import React from 'react';
import { Globe, MapPin, Check } from 'lucide-react';
import TagInput from './TagInput';

// Assuming CustomCheckbox is defined elsewhere and imported
const CustomCheckbox = ({ checked, onChange, children, color = 'purple' }) => (
  <div
    className={`relative cursor-pointer group transition-all duration-300 transform hover:scale-105 ${
      checked
        ? `bg-gradient-to-r from-${color}-400 to-${color}-600 text-white shadow-lg shadow-${color}-400/30`
        : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
    } rounded-xl p-4 border-2 ${
      checked ? `border-${color}-400` : 'border-slate-200 dark:border-slate-600'
    }`}
    onClick={onChange}
  >
    <div className="flex items-center justify-between">
      {children}
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          checked ? 'border-white bg-white/20' : `border-${color}-300`
        }`}
      >
        {checked && <Check className="w-4 h-4 text-white" />}
      </div>
    </div>
  </div>
);

const LocationPreferences = ({ formData, handleInputChange, setFormData }) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <TagInput
          label="Preferred Countries"
          icon={Globe}
          tags={formData.preferredCountries}
          setTags={(newTags) =>
            setFormData((prev) => ({ ...prev, preferredCountries: newTags }))
          }
          placeholder="Type country and press Enter..."
        />
        <TagInput
          label="Preferred Cities"
          icon={MapPin}
          tags={formData.preferredCities}
          setTags={(newTags) =>
            setFormData((prev) => ({ ...prev, preferredCities: newTags }))
          }
          placeholder="Type city and press Enter..."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CustomCheckbox
          checked={formData.isRemote}
          onChange={() => handleInputChange('isRemote', !formData.isRemote)}
          color="purple"
        >
          <div>
            <div className="font-semibold">🌍 Remote Work Only</div>
            <div className="text-sm opacity-80">
              Only consider remote opportunities
            </div>
          </div>
        </CustomCheckbox>

        <div className="group">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Willingness to Relocate
          </label>
          <select
            className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all duration-300"
            value={formData.relocationWillingness}
            onChange={(e) =>
              handleInputChange('relocationWillingness', e.target.value)
            }
          >
            <option value="">Select willingness</option>
            <option value="not-willing">❌ Not willing to relocate</option>
            <option value="open">🤔 Open to relocation</option>
            <option value="very-willing">✅ Very willing to relocate</option>
            <option value="seeking">🎯 Actively seeking relocation</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default LocationPreferences;
