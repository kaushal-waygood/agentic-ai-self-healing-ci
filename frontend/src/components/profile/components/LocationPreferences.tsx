import React from 'react';
import { Globe, MapPin, Check, Code } from 'lucide-react';
import TagInput from './TagInput';

// Assuming CustomCheckbox is defined elsewhere and imported
const CustomCheckbox = ({ checked, onChange, children, color = 'purple' }) => (
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

const LocationPreferences = ({ formData, handleInputChange, setFormData }) => {
  const isObjectData =
    Array.isArray(formData.mustHaveSkills) &&
    formData.mustHaveSkills.length > 0 &&
    typeof formData.mustHaveSkills[0] === 'object';

  const displayTags = isObjectData
    ? formData.mustHaveSkills.map((item) => item.skill)
    : formData.mustHaveSkills || [];

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-6">
        <TagInput
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
        />

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
