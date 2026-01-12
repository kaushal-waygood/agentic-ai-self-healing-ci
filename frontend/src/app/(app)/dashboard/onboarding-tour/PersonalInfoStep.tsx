import { Input } from '@/components/ui/input';

const PersonalInfoStep = ({ formData, handleInputChange }: any) => {
  console.log('form data in personal info step', formData);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <Input
          value={formData.fullName}
          disabled
          placeholder="Full Name"
          className="h-11 text-base bg-white/50 border rounded-lg px-4"
        />

        {/* Email */}
        <Input
          type="email"
          value={formData.email}
          disabled
          placeholder="Email Address"
          className="h-11 text-base bg-white/50 border rounded-lg px-4"
        />

        {/* Phone */}
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="Phone Number"
          className="h-11 text-base bg-white/50 border rounded-lg px-4"
        />

        {/* Designation */}
        <Input
          value={formData.designation}
          onChange={(e) => handleInputChange('designation', e.target.value)}
          placeholder="Current Designation (e.g., Full Stack Developer)"
          className="h-11 text-base bg-white/50 border rounded-lg px-4"
        />

        {/* CURRENT LOCATION (FIXED) */}
        <Input
          value={formData.currentLocation}
          onChange={(e) => handleInputChange('currentLocation', e.target.value)}
          placeholder="Current Location (e.g., New Delhi)"
          className="h-11 text-base bg-white/50 border rounded-lg px-4"
        />

        {/* PREFERRED LOCATION */}
        <Input
          value={formData.preferredLocation}
          onChange={(e) =>
            handleInputChange('preferredLocation', e.target.value)
          }
          placeholder="Preferred Job Location"
          className="h-11 text-base bg-white/50 border rounded-lg px-4"
        />
      </div>
    </div>
  );
};

export default PersonalInfoStep;
