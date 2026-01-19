import { Input } from '@/components/ui/input';

const PersonalInfoStep = ({
  formData,
  handleInputChange,
  attemptedNext,
}: any) => {
  const showError = (value: string) => attemptedNext && !value;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <Input
          value={formData.fullName}
          disabled
          placeholder="Full Name"
          className={`h-11 text-base bg-white/50 border rounded-lg px-4 ${
            showError(formData.fullName) ? 'border-red-500 ' : ''
          }`}
        />

        {/* Email */}
        <Input
          type="email"
          value={formData.email}
          required
          disabled
          placeholder="Email Address"
          className={`h-11 text-base bg-white/50 border rounded-lg px-4 ${
            showError(formData.email) ? 'border-red-500 ' : ''
          }`}
        />

        {/* Phone */}
        <Input
          type="number"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="Phone Number"
          className={`h-11 text-base bg-white/50 border rounded-lg px-4 ${
            showError(formData.phone) ? 'border-red-500' : ''
          }`}
        />

        {/* Designation */}
        <Input
          type="text"
          value={formData.designation}
          onChange={(e) => handleInputChange('designation', e.target.value)}
          placeholder="Current Designation (e.g., Full Stack Developer)"
          className={`h-11 text-base bg-white/50 border rounded-lg px-4 ${
            showError(formData.designation) ? 'border-red-500' : ''
          }`}
        />

        {/* CURRENT LOCATION (FIXED) */}
        <Input
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder=" Location (e.g., New Delhi)"
          className={`h-11 text-base bg-white/50 border rounded-lg px-4 ${
            showError(formData.location) ? 'border-red-500 ' : ''
          }`}
        />

        {/* PREFERRED LOCATION */}
        {/* <Input
          value={formData.preferredLocation}
          onChange={(e) =>
            handleInputChange('preferredLocation', e.target.value)
          }
          placeholder="Preferred Job Location"
          className="h-11 text-base bg-white/50 border rounded-lg px-4"
        /> */}
        <div>
          {showError(formData.phone) && (
            <p className="text-sm text-red-500 mt-1">
              Phone number is required
            </p>
          )}
          {showError(formData.designation) && (
            <p className="text-sm text-red-500 mt-1">designation is required</p>
          )}
          {showError(formData.fullName) && (
            <p className="text-sm text-red-500 mt-1">Fullname is required</p>
          )}
          {showError(formData.email) && (
            <p className="text-sm text-red-500 mt-1">Email is required</p>
          )}
          {showError(formData.location) && (
            <p className="text-sm text-red-500 mt-1">Location is required</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
