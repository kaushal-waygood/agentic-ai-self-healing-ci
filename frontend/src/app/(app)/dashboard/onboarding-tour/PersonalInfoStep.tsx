import { Camera, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Adjust path as needed

const PersonalInfoStep = ({
  formData,
  handleInputChange,
  handleFileUpload,
}) => {
  return (
    <div className="space-y-5">
      {/* Profile Photo Upload */}
      {/* <div className="flex justify-center mb-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden border-2 border-white shadow-lg">
            {formData.profilePhoto ? (
              <img
                src={URL.createObjectURL(formData.profilePhoto)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-8 h-8 text-white" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform duration-300">
            <Upload className="w-3.5 h-3.5 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileUpload('profilePhoto', e.target.files[0])
              }
              className="hidden"
            />
          </label>
        </div>
      </div> */}
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
      </div>
    </div>
  );
};

export default PersonalInfoStep;
