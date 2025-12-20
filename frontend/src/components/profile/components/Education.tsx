import {
  Award,
  Calendar,
  ChevronDown,
  GraduationCap,
  MapPin,
  Pencil,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import React from 'react';

const Education = ({
  defaultValues,
  setAddEdu,
  setEditEdu,
  setEditEduIndex,
  setDeleteEdu,
  setDeleteEduIndex,
}: any) => {
  // Optional: define this helper if it exists elsewhere
  const formatDateForMonthInput = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.toLocaleString('default', {
      month: 'short',
    })} ${d.getFullYear()}`;
  };

  return (
    <div className=" ">
      {/* button  */}
      <div className="flex w-full items-center justify-between mb-4 ">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            Education ({defaultValues.education.length})
          </h3>
        </div>
        <div className="flex  items-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAddEdu(true);
            }}
            className="w-full  flex items-center justify-center py-2 px-4 bg-buttonPrimary hover:bg-blue-700  text-white rounded-lg  transition-all duration-300"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Education
          </button>
          {/* <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-180" /> */}
        </div>
      </div>

      <div
        id="education"
        // className="bg-gradient-to-r  from-blue-50 to-cyan-50 rounded-2xl p-6 border max-h-[70vh] overflow-y-auto  border-blue-200"
        className=" rounded-xl p-2 max-h-[70vh] overflow-y-auto  border-blue-200"
      >
        <div className="space-y-4  ">
          {defaultValues.education && defaultValues.education.length > 0 ? (
            defaultValues.education.map((edu, index) => (
              <div
                key={edu._id}
                className="bg-white rounded-lg p-5  transition-all duration-300 border border-blue-100 "
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-800 mb-1">
                      {edu.degree}
                    </h4>
                    <p className="text-blue-600 font-medium">
                      {edu.institution}
                    </p>
                    {edu.fieldOfStudy && (
                      <p className="text-sm text-gray-500 mt-1">
                        Field: {edu.fieldOfStudy}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      size="icon"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditEdu(true);

                        setEditEduIndex(index);
                      }}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50 h-9 w-9"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        console.log(edu._id);
                        setDeleteEdu(true);
                        setDeleteEduIndex(edu._id);
                      }}
                      className="text-red-600 border-red-300 hover:bg-red-50 h-9 w-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {formatDateForMonthInput(edu.startDate)} to{' '}
                      {formatDateForMonthInput(edu.endDate) || 'Present'}
                      {/* {edu.startDate} - {edu.endDate || 'Present'} */}
                    </span>
                  </div>
                  {edu.gpa && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Award className="h-4 w-4 text-gray-400" />
                      <span>GPA: {edu.gpa}</span>
                    </div>
                  )}
                  {edu.country && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{edu.country}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className=" text-gray-500  italic">No data</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Education;
