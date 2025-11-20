import { Input } from '@/components/ui/input';

const JobPreferencesStep = ({
  formData,
  handleInputChange,
  selectedOptions,
  toggleOption,
}: any) => {
  console.log('toggleOption', selectedOptions);
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2 ml-1">
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
                className={`
                  p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105
                  ${
                    isSelected
                      ? 'border-purple-500 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white text-gray-800 border-gray-300'
                  }
                `}
              >
                <span className="font-semibold text-sm">{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Input
        value={formData.location}
        onChange={(e) => handleInputChange('location', e.target.value)}
        placeholder="Preferred Location"
        className="h-11 text-base border-2 focus:border-purple-500 transition-all duration-300 rounded-lg px-4 bg-white/50 backdrop-blur-sm"
      />

      <Input
        value={formData.expectedSalary}
        onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
        placeholder="Expected Salary (Optional)"
        className="h-11 text-base border-2 focus:border-purple-500 transition-all duration-300 rounded-lg px-4 bg-white/50 backdrop-blur-sm"
      />
    </div>
  );
};

export default JobPreferencesStep;
