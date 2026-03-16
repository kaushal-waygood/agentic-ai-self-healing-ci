import { Input } from '@/components/ui/input';
import { SimplePhoneInput } from '@/components/common/SimplePhoneInput';
import { isValidPhoneNumber } from 'react-phone-number-input';

const PersonalInfoStep = ({
  formData,
  handleInputChange,
  attemptedNext,
}: any) => {
  const LOCATION_REGEX = /^[a-zA-Z\s,.'-]+$/;
  const DESIGNATION_REGEX = /^[a-zA-Z\s]+$/;

  const getDesignationError = (value: string) => {
    if (!attemptedNext) return '';
    const v = (value || '').trim();
    if (v.length < 2) return 'Designation is required';
    if (v.length > 30) return 'Designation must not exceed 30 characters.';
    if (!DESIGNATION_REGEX.test(v)) return 'Only letters and spaces allowed';
    return '';
  };

  const getLocationError = (value: string) => {
    if (!attemptedNext) return '';
    const v = (value || '').trim();
    if (!v) return 'Location is required (e.g., City, Country).';
    if (v.length < 2) return 'Location must be at least 2 characters.';
    if (v.length > 50) return 'Location must not exceed 50 characters.';
    if (!LOCATION_REGEX.test(v)) {
      return 'Please enter a valid city or region (letters, spaces, commas, periods, apostrophes, and hyphens only).';
    }
    return '';
  };

  const showError = (value: string, validator?: (val: string) => boolean) =>
    attemptedNext && (!value || (validator && !validator(value)));

  const designationError = getDesignationError(formData.designation);
  const locationError = getLocationError(formData.location);

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
        <div>
          <div
            className={`${
              showError(formData.phone, isValidPhoneNumber)
                ? 'border-red-500'
                : ''
            } rounded-lg`}
          >
            <SimplePhoneInput
              value={formData.phone}
              onChange={(value) => handleInputChange('phone', value)}
              placeholder="Phone Number"
            />
          </div>
          {showError(formData.phone, isValidPhoneNumber) && (
            <p className="text-xs text-red-500 mt-1">
              Please enter a valid phone number
            </p>
          )}
        </div>

        <div>
          {/* Designation */}
          <Input
            type="text"
            value={formData.designation}
            onChange={(e) => handleInputChange('designation', e.target.value)}
            placeholder="Current Designation (e.g., Full Stack Developer)"
            className={`h-11 text-base bg-white/50 border rounded-lg px-4 ${
              designationError ? 'border-red-500' : ''
            }`}
          />
          {designationError && (
            <p className="text-xs text-red-500 mt-1">{designationError}</p>
          )}
        </div>

        <div>
          {/* CURRENT LOCATION (FIXED) */}
          <Input
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder=" Location (e.g., New Delhi)"
            className={`h-11 text-base bg-white/50 border rounded-lg px-4 ${
              locationError ? 'border-red-500 ' : ''
            }`}
          />
          {locationError && (
            <p className="text-xs text-red-500 mt-1">{locationError}</p>
          )}
        </div>

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
          {showError(formData.fullName) && (
            <p className="text-xs text-red-500 mt-1">Fullname is required</p>
          )}
          {showError(formData.email) && (
            <p className="text-xs text-red-500 mt-1">Email is required</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
