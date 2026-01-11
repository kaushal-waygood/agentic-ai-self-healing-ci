// import { Input } from '@/components/ui/input';

// const JobPreferencesStep = ({
//   formData,
//   handleInputChange,
//   selectedOptions,
//   toggleOption,
// }: any) => {
//   return (
//     <div className="space-y-5">
//       <div>
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
//                 className={`
//                   p-3 rounded-lg border-2 transition-all hover:scale-105
//                   ${
//                     isSelected
//                       ? 'border-blue-500'
//                       : 'bg-white text-gray-800 border-gray-300'
//                   }
//                 `}
//               >
//                 <span className="font-semibold text-sm">{type}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       <Input
//         value={formData.location}
//         onChange={(e) => handleInputChange('location', e.target.value)}
//         placeholder="Preferred Location"
//         className="h-11 text-base border-2 rounded-lg px-4 bg-white/50"
//       />

//       <Input
//         value={formData.country}
//         onChange={(e) => handleInputChange('country', e.target.value)}
//         placeholder="Preferred Country"
//         className="h-11 text-base border-2 rounded-lg px-4 bg-white/50"
//       />
//       {/* <Input
//         value={formData.expectedSalary}
//         onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
//         placeholder="Expected Salary (Optional)"
//         className="h-11 text-base border-2 rounded-lg px-4 bg-white/50"
//       /> */}
//     </div>
//   );
// };

// export default JobPreferencesStep;

import { Input } from '@/components/ui/input';
import { useState } from 'react';

const EDUCATION_LEVELS = [
  'High School',
  'Associate Degree',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD',
  'No Formal Education Required',
];

const JobPreferencesStep = ({
  formData,
  handleInputChange,
  selectedOptions,
  toggleOption,
}: any) => {
  const [skillInput, setSkillInput] = useState('');

  const skills = formData.mustHaveSkills || [];

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value || skills.includes(value)) return;

    handleInputChange('mustHaveSkills', [...skills, value]);
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    handleInputChange(
      'mustHaveSkills',
      skills.filter((s: string) => s !== skill),
    );
  };

  return (
    <div className="space-y-6">
      {/* Job Type */}
      {/* <div>
        <label className="block text-md font-semibold text-gray-700 mb-2 ml-1">
          Job Type (Select all that apply)
        </label>

        <div className="grid grid-cols-2 gap-2.5">
          {[
            'Full-time',
            'Part-time',
            'Internship',
            'Freelance',
            'Remote',
            'Contract',
          ].map((type) => {
            const isSelected = selectedOptions.jobType?.includes(type);

            return (
              <button
                key={type}
                onClick={() => toggleOption('jobType', type)}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-105
                  ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'bg-white text-gray-800 border-gray-300'
                  }
                `}
              >
                <span className="font-semibold text-sm">{type}</span>
              </button>
            );
          })}
        </div>
      </div> */}

      {/* Preferred Location */}
      <Input
        value={formData.location}
        onChange={(e) => handleInputChange('location', e.target.value)}
        placeholder="Preferred Location"
        className="h-11 text-base border-2 rounded-lg px-4 bg-white/50"
      />

      {/* Preferred Country */}
      <Input
        value={formData.country}
        onChange={(e) => handleInputChange('country', e.target.value)}
        placeholder="Preferred Country"
        className="h-11 text-base border-2 rounded-lg px-4 bg-white/50"
      />

      {/* Must-have Skills */}
      <div>
        <label className="block text-md font-semibold text-gray-700 mb-2 ml-1">
          Must-have Skills
        </label>

        <div className="flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            placeholder="Type a skill and press Enter"
            className="h-11 text-base border-2 rounded-lg px-4"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {skills.map((skill: string) => (
            <span
              key={skill}
              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="text-blue-500 hover:text-red-600"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Education Level */}
      <div>
        <label className="block text-md font-semibold text-gray-700 mb-2 ml-1">
          Education Level
        </label>

        <select
          value={formData.educationLevel || ''}
          onChange={(e) => handleInputChange('educationLevel', e.target.value)}
          className="w-full h-11 border-2 rounded-lg px-4 bg-white text-gray-700"
        >
          <option value="">Select education level</option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default JobPreferencesStep;
