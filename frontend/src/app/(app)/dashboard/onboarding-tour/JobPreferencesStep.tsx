// // import { Input } from '@/components/ui/input';

// // const JobPreferencesStep = ({
// //   formData,
// //   handleInputChange,
// //   selectedOptions,
// //   toggleOption,
// // }: any) => {
// //   return (
// //     <div className="space-y-5">
// //       <div>
// //         <label className="block text-md font-semibold text-gray-700 mb-2 ml-1">
// //           Job Type (Select all that apply)
// //         </label>

// //         <div className="grid grid-cols-2 gap-2.5">
// //           {[
// //             'Full-time',
// //             'Part-time',
// //             'Internship',
// //             'Freelance',
// //             'Remote',
// //             'Contract',
// //           ].map((type) => {
// //             const isSelected = selectedOptions.jobType?.includes(type);

// //             return (
// //               <button
// //                 key={type}
// //                 onClick={() => toggleOption('jobType', type)}
// //                 className={`
// //                   p-3 rounded-lg border-2 transition-all hover:scale-105
// //                   ${
// //                     isSelected
// //                       ? 'border-blue-500'
// //                       : 'bg-white text-gray-800 border-gray-300'
// //                   }
// //                 `}
// //               >
// //                 <span className="font-semibold text-sm">{type}</span>
// //               </button>
// //             );
// //           })}
// //         </div>
// //       </div>

// //       <Input
// //         value={formData.location}
// //         onChange={(e) => handleInputChange('location', e.target.value)}
// //         placeholder="Preferred Location"
// //         className="h-11 text-base border-2 rounded-lg px-4 bg-white/50"
// //       />

// //       <Input
// //         value={formData.country}
// //         onChange={(e) => handleInputChange('country', e.target.value)}
// //         placeholder="Preferred Country"
// //         className="h-11 text-base border-2 rounded-lg px-4 bg-white/50"
// //       />
// //       {/* <Input
// //         value={formData.expectedSalary}
// //         onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
// //         placeholder="Expected Salary (Optional)"
// //         className="h-11 text-base border-2 rounded-lg px-4 bg-white/50"
// //       /> */}
// //     </div>
// //   );
// // };

// // export default JobPreferencesStep;

// import { Input } from '@/components/ui/input';
// import { useState } from 'react';

// const EDUCATION_LEVELS = [
//   'High School',
//   'Associate Degree',
//   "Bachelor's Degree",
//   "Master's Degree",
//   'PhD',
//   'No Formal Education Required',
// ];

// const JobPreferencesStep = ({
//   formData,
//   handleInputChange,
//   selectedOptions,
//   toggleOption,
//   attemptedNext,
// }: any) => {
//   const safeTrim = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

//   const showError = (value: unknown) => attemptedNext && !safeTrim(value);
//   const [skillInput, setSkillInput] = useState('');

//   const addSkill = () => {
//     const value = skillInput.trim();
//     if (!value || skills.includes(value)) return;

//     handleInputChange('mustHaveSkills', [...skills, value]);
//     setSkillInput('');
//   };

//   const removeSkill = (skill: string) => {
//     handleInputChange(
//       'mustHaveSkills',
//       skills.filter((s: string) => s !== skill),
//     );
//   };

//   const skills = formData.mustHaveSkills || [];
//   const skillsError = attemptedNext && skills.length === 0;

//   return (
//     <div className="space-y-6">
//       {/* Job Type */}
//       {/* <div>
//         <label className="block text-md font-semibold text-gray-700 mb-2 ml-1">
//           Job Type (Select all that apply)
//         </label>

//         <div className="grid grid-cols-2 gap-2.5">
//           {[
//             'Full-time',
//             'Part-time',
//             'Internship',
//             'Freelance',
//             'Remote',
//             'Contract',
//           ].map((type) => {
//             const isSelected = selectedOptions.jobType?.includes(type);

//             return (
//               <button
//                 key={type}
//                 onClick={() => toggleOption('jobType', type)}
//                 className={`p-3 rounded-lg border-2 transition-all hover:scale-105
//                   ${
//                     isSelected
//                       ? 'border-blue-500 bg-blue-50'
//                       : 'bg-white text-gray-800 border-gray-300'
//                   }
//                 `}
//               >
//                 <span className="font-semibold text-sm">{type}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div> */}

//       {/* Preferred Location */}
//       <Input
//         value={formData.City}
//         onChange={(e) => handleInputChange('city', e.target.value)}
//         placeholder="Preferred cities"
//         className={`h-11 text-base border-2 rounded-lg px-4 bg-white/50 ${
//           showError(formData.city) ? 'border-red-500' : ''
//         }`}
//       />
//       {showError(formData.city) && (
//         <p className="text-xs text-red-500 ">Preferred cities is required</p>
//       )}

//       {/* Preferred Country */}
//       <Input
//         value={formData.country}
//         onChange={(e) => handleInputChange('country', e.target.value)}
//         placeholder="Preferred Country"
//         className={`h-11 text-base border-2 rounded-lg px-4 bg-white/50 ${
//           showError(formData.country)
//             ? 'border-red-500 focus-visible:ring-red-500'
//             : ''
//         }`}
//       />
//       {showError(formData.country) && (
//         <p className="text-xs text-red-500 mt-1">
//           Preferred country is required
//         </p>
//       )}

//       {/* Must-have Skills */}
//       <div>
//         <label className="block text-md font-semibold text-gray-700 mb-2 ml-1">
//           Must-have Skills
//         </label>

//         <div className="flex gap-2">
//           <Input
//             value={skillInput}
//             onChange={(e) => setSkillInput(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && addSkill()}
//             placeholder="Type a skill and press Enter"
//             className={`h-11 text-base border-2 rounded-lg px-4 ${
//               skillsError ? 'border-red-500' : ''
//             }`}
//           />
//           {skillsError && (
//             <p className="text-xs text-red-500 mt-1">
//               Add at least one must-have skill
//             </p>
//           )}

//           <button
//             type="button"
//             onClick={addSkill}
//             className="px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
//           >
//             Add
//           </button>
//         </div>

//         <div className="flex flex-wrap gap-2 mt-3">
//           {skills.map((skill: string) => (
//             <span
//               key={skill}
//               className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold"
//             >
//               {skill}
//               <button
//                 onClick={() => removeSkill(skill)}
//                 className="text-blue-500 hover:text-red-600"
//               >
//                 ✕
//               </button>
//             </span>
//           ))}
//         </div>
//       </div>

//       {/* Education Level */}
//       <div>
//         <label className="block text-md font-semibold text-gray-700 mb-2 ml-1">
//           Education Level
//         </label>

//         <select
//           value={formData.educationLevel || ''}
//           onChange={(e) => handleInputChange('educationLevel', e.target.value)}
//           className={`w-full h-11 border-2 rounded-lg px-4 bg-white text-gray-700 ${
//             showError(formData.educationLevel) ? 'border-red-500' : ''
//           }`}
//         >
//           <option value="">Select education level</option>
//           {EDUCATION_LEVELS.map((level) => (
//             <option key={level} value={level}>
//               {level}
//             </option>
//           ))}
//         </select>
//         {showError(formData.educationLevel) && (
//           <p className="text-xs text-red-500 mt-1">
//             Education level is required
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default JobPreferencesStep;

import { Input } from '@/components/ui/input';
import { useState } from 'react';
import CountrySelector from '@/components/common/CountrySelector';
import CitySelector from '@/components/common/CitySelector';

const EDUCATION_LEVELS = [
  'High School',
  'Associate',
  'Bachelor',
  'Master',
  'Phd',
  'None',
];
// --- Reusable Input Component ---
const MultiInput = ({
  label,
  list,
  value,
  setValue,
  field,
  placeholder,
  attemptedNext,
  addItem,
  removeItem,
  errorMsg,
}: any) => {
  const hasError = attemptedNext && list.length === 0;

  return (
    <div>
      <label className="block text-md font-semibold text-gray-700 mb-2 ml-1">
        {label}
      </label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) =>
            e.key === 'Enter' && addItem(field, list, value, setValue)
          }
          placeholder={placeholder}
          className={`h-11 text-base border-2 rounded-lg px-4 ${
            hasError ? 'border-red-500' : 'bg-white/50'
          }`}
        />
        <button
          type="button"
          onClick={() => addItem(field, list, value, setValue)}
          className="px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {/* Error Message */}
      {hasError && <p className="text-xs text-red-500 mt-1">{errorMsg}</p>}

      {/* Tags List */}
      <div className="flex flex-wrap gap-2 mt-3">
        {list.map((item: string) => (
          <span
            key={item}
            className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold"
          >
            {item}
            <button
              type="button"
              onClick={() => removeItem(field, list, item)}
              className="text-blue-500 hover:text-red-600"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

const JobPreferencesStep = ({
  formData,
  handleInputChange,
  attemptedNext,
}: any) => {
  // --- Local State for Inputs ---
  const [skillInput, setSkillInput] = useState('');
  // const [cityInput, setCityInput] = useState('');
  // const [countryInput, setCountryInput] = useState('');

  // --- Helpers to ensure we always have arrays ---
  // Now looking for 'preferredCities' and 'preferredCountries' in formData
  const skills = Array.isArray(formData.mustHaveSkills)
    ? formData.mustHaveSkills
    : [];
  const cities = Array.isArray(formData.preferredCities)
    ? formData.preferredCities
    : [];
  const countries = Array.isArray(formData.preferredCountries)
    ? formData.preferredCountries
    : [];

  // --- Generic Handler to Add Item ---
  const addItem = (
    field: string,
    list: string[],
    value: string,
    setFn: any,
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    // Check for duplicates (case-insensitive optional)
    if (list.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setFn(''); // Clear input even if duplicate
      return;
    }

    handleInputChange(field, [...list, trimmed]);
    setFn('');
  };

  // --- Generic Handler to Remove Item ---
  const removeItem = (field: string, list: string[], item: string) => {
    handleInputChange(
      field,
      list.filter((i) => i !== item),
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Preferred Cities */}
      {/* <MultiInput
       label="Preferred Cities"
       field="preferredCities" // Matches backend key
       list={cities}
       value={cityInput}
       setValue={setCityInput}
       placeholder="Type a city and press Enter (e.g. New Delhi)"
       attemptedNext={attemptedNext}
       errorMsg="Add at least one preferred city"
       addItem={addItem}
       removeItem={removeItem}
     /> */}
      <div>
        <label className="block text-md font-semibold text-gray-700 mb-2 ml-1">
          Preferred City
        </label>
        <CitySelector
          countryCode={formData.preferredCountry || ''}
          value={formData.preferredCity || ''}
          onChange={(value) => handleInputChange('preferredCity', value)}
          className="w-full"
        />
        {attemptedNext &&
          !formData.preferredCity &&
          formData.preferredCountry && (
            <p className="text-xs text-red-500 mt-1">
              Preferred city is required
            </p>
          )}
      </div>
      {/* 2. Preferred Countries */}
      {/* <MultiInput
       label="Preferred Countries"
       field="preferredCountries" // Matches backend key
       list={countries}
       value={countryInput}
       attemptedNext={attemptedNext}
       errorMsg="At least one country is required"
       setValue={setCountryInput}
       placeholder="Type a country and press Enter (e.g. India)"
       addItem={addItem}
       removeItem={removeItem}
     /> */}
      <div>
        <label className="block text-md font-semibold text-gray-700 mb-2 ml-1">
          Preferred Country
        </label>
        <CountrySelector
          value={formData.preferredCountry || ''}
          onChange={(value) => handleInputChange('preferredCountry', value)}
          className="w-full"
        />
        {attemptedNext && !formData.preferredCountry && (
          <p className="text-xs text-red-500 mt-1">
            Preferred country is required
          </p>
        )}
      </div>
      {/* 3. Must-have Skills */}
      <MultiInput
        label="Must-have Skills"
        field="mustHaveSkills" // Matches backend key
        list={skills}
        value={skillInput}
        setValue={setSkillInput}
        placeholder="Type a skill and press Enter"
        attemptedNext={attemptedNext}
        errorMsg="Add at least one must-have skill"
        addItem={addItem}
        removeItem={removeItem}
      />{' '}
      {/* 4. Education Level */}
      <div>
        <label className="block text-md font-semibold text-gray-700 mb-2 ml-1">
          Education Level
        </label>
        <select
          value={formData.educationLevel || ''}
          onChange={(e) => handleInputChange('educationLevel', e.target.value)}
          className={`w-full h-11 border-2 rounded-lg px-4 bg-white text-gray-700 ${
            attemptedNext && !formData.educationLevel ? 'border-red-500' : ''
          }`}
        >
          <option value="">Select education level</option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        {attemptedNext && !formData.educationLevel && (
          <p className="text-xs text-red-500 mt-1">
            Education level is required
          </p>
        )}
      </div>
    </div>
  );
};

export default JobPreferencesStep;
