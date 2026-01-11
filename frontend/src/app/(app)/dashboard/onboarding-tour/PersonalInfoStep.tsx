import { Input } from '@/components/ui/input';

const PersonalInfoStep = ({
  formData,
  handleInputChange,
  handleFileUpload,
}: any) => {
  console.log(formData);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          value={formData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          placeholder="Full Name"
          className="h-11 text-base bg-white/50  border rounded-lg px-4 "
        />
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Email Address"
          className="h-11 text-base bg-white/50  border rounded-lg px-4 "
        />
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="Phone Number"
          className="h-11 text-base bg-white/50  border rounded-lg px-4 "
        />
        <Input
          value={formData.designation}
          onChange={(e) => handleInputChange('designation', e.target.value)}
          placeholder="Current Designation (e.g., Software Engineer)"
          className="h-11 text-base bg-white/50  border rounded-lg px-4 "
        />

        <Input
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder="Location (e.g., City, Country)"
          className="h-11 text-base bg-white/50  border rounded-lg px-4 "
        />
        <Input
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
          placeholder="Website (e.g., https://www.example.com)"
          className="h-11 text-base bg-white/50  border rounded-lg px-4 "
        />
      </div>
    </div>
  );
};

export default PersonalInfoStep;
