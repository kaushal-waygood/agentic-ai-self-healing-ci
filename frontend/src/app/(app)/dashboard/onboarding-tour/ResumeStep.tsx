import { Upload, CheckCircle2 } from 'lucide-react';

const ResumeStep = ({ formData, handleFileUpload }) => {
  return (
    <div className="space-y-6">
      <label className="block">
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center  transition-all duration-300 cursor-pointer bg-white/50 backdrop-blur-sm hover:bg-white/70">
          <Upload className="w-10 h-10 mx-auto mb-3 text-purple-500" />
          <p className="text-base font-semibold text-gray-700 mb-1">
            {formData.resume ? formData.resume.name : 'Click to upload resume'}
          </p>
          <p className="text-xs text-gray-500">PDF, DOC, DOCX (Max 5MB)</p>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleFileUpload('resume', e.target.files[0])}
            className="hidden"
          />
        </div>
      </label>
      {formData.resume && (
        <div className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-semibold text-sm">
            Resume uploaded successfully!
          </span>
        </div>
      )}
    </div>
  );
};

export default ResumeStep;
