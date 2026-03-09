import React, { useState, useMemo } from 'react';
import { Globe, MapPin, Check, Code } from 'lucide-react';
import TagInput from './TagInput';
import CountrySelector, {
  countryOptions,
} from '@/components/common/CountrySelector';
import CitySelector from '@/components/common/CitySelector';
import type { JobPreferencesFormData } from './JobPreference';

// Assuming CustomCheckbox is defined elsewhere and imported
// const CustomCheckbox = ({ checked, onChange, children, color = 'purple' }) => (
const CustomCheckbox: React.FC<{
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
  color?: string;
}> = ({ checked, onChange, children, color = 'purple' }) => (
  <div
    className={`relative cursor-pointer group transition-all duration-300 transform hover:scale-105 ${
      checked
        ? ``
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
          checked ? 'border-blue-400' : `border-${color}-300`
        }`}
      >
        {checked && <Check className="w-4 h-4 text-blue-400 " />}
      </div>
    </div>
  </div>
);

// const LocationPreferences = ({ formData, handleInputChange, setFormData }) => {
interface LocationPreferencesProps {
  formData: JobPreferencesFormData;
  handleInputChange: (field: keyof JobPreferencesFormData, value: any) => void;
  setFormData: React.Dispatch<React.SetStateAction<JobPreferencesFormData>>;
}

const LocationPreferences: React.FC<LocationPreferencesProps> = ({
  formData,
  handleInputChange,
  setFormData,
}) => {
  const [countryInput, setCountryInput] = useState('');
  const [cityCountry, setCityCountry] = useState('');
  const [cityInput, setCityInput] = useState('');

  React.useEffect(() => {
    setCityInput('');
  }, [cityCountry]);

  const addCountry = (val?: string) => {
    const country = val ?? countryInput;
    if (!country) return;
    setFormData((prev: any) => {
      const existing: string[] = prev.preferredCountries || [];
      if (existing.includes(country)) return prev;
      return { ...prev, preferredCountries: [...existing, country] };
    });
    setCountryInput('');
  };

  const removeCountry = (c: string) => {
    setFormData((prev: any) => ({
      ...prev,
      preferredCountries: (prev.preferredCountries || []).filter(
        (x: string) => x !== c,
      ),
    }));

    setCityCountry((prev) => (prev === c ? '' : prev));
  };

  const addCity = (val?: string) => {
    const city = val ?? cityInput;
    if (!city) return;
    setFormData((prev: any) => {
      const existing: string[] = prev.preferredCities || [];
      if (existing.includes(city)) return prev;
      return { ...prev, preferredCities: [...existing, city] };
    });
    if (val === undefined) {
      setCityInput('');
    }
  };

  const removeCity = (c: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredCities: (prev.preferredCities || []).filter(
        (x: string) => x !== c,
      ),
    }));
  };

  const isObjectData =
    Array.isArray(formData.mustHaveSkills) &&
    formData.mustHaveSkills.length > 0 &&
    typeof formData.mustHaveSkills[0] === 'object';

  //  const displayTags = isObjectData
  // ? formData.mustHaveSkills.map((item) => item.skill)
  const displayTags: string[] = isObjectData
    ? formData.mustHaveSkills.map((item: any) => item.skill)
    : formData.mustHaveSkills || [];

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-6">
        {/* <TagInput
          label="Preferred Countries"
          icon={Globe}
          tags={formData.preferredCountries}
          setTags={(newTags) =>
            setFormData((prev) => ({ ...prev, preferredCountries: newTags }))
          }
          placeholder="Type and press Enter..."
        />
        <TagInput
          label="Preferred Cities"
          icon={MapPin}
          tags={formData.preferredCities}
          setTags={(newTags) =>
            setFormData((prev) => ({ ...prev, preferredCities: newTags }))
          }
          placeholder="Type and press Enter..."
        /> */}

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <Globe className="inline w-4 h-4 mr-2" />
            Preferred Countries
          </label>
          <div className="w-full p-2 flex flex-wrap items-center gap-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus-within:border-blue-400 transition-all duration-300">
            {formData.preferredCountries.map((c: string) => (
              <span
                key={c}
                className="flex items-center gap-2 bg-blue-100 dark:bg-purple-900/50 text-blue-700 dark:text-purple-300 rounded-md px-3 py-1 text-sm font-medium"
              >
                {countryOptions.find(
                  (o: { value: string; label: string }) => o.value === c,
                )?.label || c}
                <button
                  type="button"
                  onClick={() => removeCountry(c)}
                  className="text-blue-500 hover:text-purple-700 dark:hover:text-purple-200"
                >
                  ✕
                </button>
              </span>
            ))}

            <CountrySelector
              value={countryInput}
              onChange={(v) => {
                setCountryInput(v);
                // selecting a country should also make it available for city selector
                setCityCountry(v);
                // immediately add to list (enter key select, mouse click, etc.)
                if (v) addCountry(v);
              }}
              className="flex-grow min-w-[150px]"
            />
            <button
              type="button"
              onClick={() => addCountry()}
              disabled={!countryInput}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>

        {/* Preferred cities with dependent dropdowns */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <MapPin className="inline w-4 h-4 mr-2" />
            Preferred Cities
          </label>
          <div className="w-full p-2 flex flex-wrap items-center gap-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus-within:border-blue-400 transition-all duration-300">
            {formData.preferredCities.map((city: string) => (
              <span
                key={city}
                className="flex items-center gap-2 bg-blue-100 dark:bg-purple-900/50 text-blue-700 dark:text-purple-300 rounded-md px-3 py-1 text-sm font-medium"
              >
                {city}
                <button
                  type="button"
                  onClick={() => removeCity(city)}
                  className="text-blue-500 hover:text-purple-700 dark:hover:text-purple-200"
                >
                  ✕
                </button>
              </span>
            ))}

            {/* only show dropdown if there is a country selected */}
            <CitySelector
              countryCode={cityCountry}
              value={cityInput}
              // onChange={(v) => {
              //   setCityInput(v);
              //   // if (v) addCity(v);
              // }}
              onChange={(v) => setCityInput(v)}
              className="flex-grow min-w-[150px]"
            />
            <button
              type="button"
              onClick={() => addCity()}
              disabled={!cityInput}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>

        {/* for array  */}
        {/* this is our corrent input tag which was used for array */}
        {/* <TagInput
          label="Must-have Skills"
          icon={MapPin}
          tags={formData.mustHaveSkills || []}
          setTags={(newTags) =>
            setFormData((prev) => ({ ...prev, mustHaveSkills: newTags }))
          }
          placeholder="Type skill (e.g. React, Java) and press Enter..."
        /> */}

        {/* for object  */}
        {/* <div className="group">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            <Code className="inline w-4 h-4 mr-2" />
            Must-have Skills
          </label>
          <textarea
            className="w-full p-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-blue-400 transition-all resize-none"
            rows={4}
            placeholder="JavaScript, Python, React..."
            value={formData.mustHaveSkills}
            onChange={(e) =>
              handleInputChange('mustHaveSkills', e.target.value)
            }
          />
        </div> */}

        {/* {!isObjectData ? (
          <TagInput
            label="Must-have Skills"
            icon={Code}
            tags={formData.mustHaveSkills || []}
            setTags={(newTags) =>
              setFormData((prev) => ({ ...prev, mustHaveSkills: newTags }))
            }
            placeholder="Type skill (e.g. React, Java) and press Enter..."
          />
        ) : (
          <div className="group">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Code className="inline w-4 h-4 mr-2" />
              Must-have Skills
            </label>
            <textarea
              className="w-full p-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-blue-400 transition-all resize-none"
              rows={4}
              placeholder="JavaScript, Python, React..."
              value={formData.mustHaveSkills
                .map((item) => item.skill)
                .join(', ')}
              disabled
              readOnly
            />
          </div>
        )} */}

        <TagInput
          label="Must-have Skills"
          icon={Code}
          tags={displayTags} // Pass the normalized string array
          setTags={(newTags) => {
            // 4. When saving, you have to decide:
            // Do you want to save as simple strings?
            // Or do you need to convert back to objects?

            // Option A: Just save as simple strings (Easiest if backend allows)
            setFormData((prev) => ({ ...prev, mustHaveSkills: newTags }));
          }}
          placeholder="Type skill and press Enter..."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* <CustomCheckbox
          checked={formData.isRemote}
          onChange={() => handleInputChange('isRemote', !formData.isRemote)}
          color="blue"
        >
          <div>
            <div className="font-semibold">🌍 Remote Work Only</div>
            <div className="text-sm opacity-80">
              Only consider remote opportunities
            </div>
          </div>
        </CustomCheckbox> */}

        {/* <div className="group">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Willingness to Relocate
          </label>
          <select
            className="w-full p-4 rounded-xl border-2  dark:border-slate-600 bg-white dark:bg-slate-800 focus:border-blue-400 transition-all duration-300"
            value={formData.relocationWillingness}
            onChange={(e) =>
              handleInputChange('relocationWillingness', e.target.value)
            }
          >
            <option value="">Select willingness</option>
            <option value="not-willing"> Not willing to relocate</option>
            <option value="open">Open to relocation</option>
            <option value="very-willing"> Very willing to relocate</option>
            <option value="seeking"> Actively seeking relocation</option>
          </select>
        </div> */}
      </div>
    </div>
  );
};

export default LocationPreferences;
