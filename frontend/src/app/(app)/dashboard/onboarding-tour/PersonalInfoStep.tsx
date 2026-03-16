import { Input } from '@/components/ui/input';
import { SimplePhoneInput } from '@/components/common/SimplePhoneInput';
import { isValidPhoneNumber } from 'react-phone-number-input';
import {
  ArrowRight,
  CheckCircle2,
  Edit,
  Loader,
  Loader2,
  Upload,
} from 'lucide-react';

const PersonalInfoStep = ({
  formData,
  handleInputChange,
  attemptedNext,
  handleResumeExtract,
  isLoading,
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
      {/* <div className="space-y-4">
        {!isLoading ? (
          <label className="block text-left w-full cursor-pointer rounded-lg border-2 bg-white p-6 transition-all duration-300 hover:border-blue-400 hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg mr-4">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Auto-fill with Resume
                </h3>
                <p className="text-sm text-gray-500">
                  Upload your resume and we’ll do the heavy lifting.
                </p>
              </div>
              <ArrowRight className="ml-auto w-5 h-5 text-gray-400" />
            </div>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleResumeExtract(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        ) : (
          <div className="w-full rounded-lg border-2 border-blue-100 bg-blue-50/50 p-6 flex flex-col items-center justify-center space-y-3 animate-pulse">
            <div className="relative">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full animate-ping"></div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-blue-900">
                Extracting information...
              </h3>
              <p className="text-sm text-blue-600/80">
                Processing your resume in the background
              </p>
            </div>
          </div>
        )}
      </div> */}

      <div className="space-y-4">
        {!isLoading ? (
          /* Step 1: Initial Upload State */
          <label className="block text-left w-full cursor-pointer rounded-lg border-2 bg-white  sm:p-6 p-2 transition-all duration-300 hover:border-blue-400 hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg mr-4">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Auto-fill with Resume
                </h3>
                <p className="text-sm text-gray-500">
                  Upload your resume and we’ll do the heavy lifting.
                </p>
              </div>
              <ArrowRight className="hidden sm:block ml-auto w-5 h-5 text-gray-400" />
            </div>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleResumeExtract(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        ) : (
          /* Step 2: Processing / Success State */
          <div className="w-full   p-6 flex items-center animate-in fade-in zoom-in duration-300">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-green-900">
                Resume Uploaded
              </h3>
              <p className="text-sm text-green-700">
                Your information is being extracted in the background...
              </p>
            </div>
            {/* Subtle pulse to show it's still "thinking" even without a spinner */}
            <div className="flex space-x-1 ml-auto">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 bg-green-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 bg-green-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
      </div>
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
