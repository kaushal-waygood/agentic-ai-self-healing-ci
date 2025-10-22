// import {
//   Briefcase,
//   Calendar,
//   ChevronDown,
//   ChevronUp,
//   MapPin,
//   Pencil,
//   PlusCircle,
//   Trash2,
// } from 'lucide-react';
// import React from 'react';

// const Experience = ({
//   personalInfoForm,
//   handlePersonalInfoSubmit,
//   isNameEditable,
//   handlePersonalInfoEdit,
//   toggleNameEdit,
//   isEmailEditable,
//   isPhoneEditable,
//   toggleEmailEdit,
//   setHandleName,
//   handleCancelEdit,
//   togglePhoneEdit,

//   // careerDetailsForm,
//   fileInputRef,
//   file,
//   isDragging,
//   isUploading,
//   isJobPrefEditable,
//   careerDetailsForm,
//   expandedIndex,
//   defaultValues,
//   handleFileChange,
//   handleButtonClick,
//   handleDragEnter,
//   handleDragLeave,
//   handleDragOver,
//   handleDrop,
//   handleRemoveFile,
//   handleUpload,
//   handleCareerDetailsSubmit,
//   setIsJobPrefEditable,
//   toggleExpand,
//   setAddEdu,
//   setEditEdu,
//   setEditEduIndex,
//   setDeleteEdu,
//   setDeleteEduIndex,
//   setAddProj,
//   setEditProj,
//   setEditProjIndex,
//   setDeleteProj,
//   setDeleteProjIndex,
//   setAddExp,
//   setEditExp,
//   setEditExpIndex,
//   setDeleteExp,
//   setDeleteExpIndex,
//   setAddSkill,
//   setDeleteSkill,
//   setDeleteSkillIndex,
//   handleLevelChange,
// }: any) => {
//   return (
//     <div>
//       <div className="flex w-full items-center justify-between pb-4">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
//             <Briefcase className="h-6 w-6 text-white" />
//           </div>
//           <h3 className="text-xl font-bold text-gray-800">Experience</h3>
//         </div>
//         <div className="flex items-center gap-4">
//           <button
//             type="button"
//             onClick={(e) => {
//               e.stopPropagation();
//               setAddExp(true);
//             }}
//             className="w-full flex items-center justify-center py-2 px-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
//           >
//             <PlusCircle className="mr-2 h-5 w-5" />
//             Add Experience
//           </button>
//           {/* <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-180" /> */}
//         </div>
//       </div>

//       <div
//         id="experience"
//         className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200"
//       >
//         <div className="space-y-4">
//           {defaultValues.experience && defaultValues.experience.length > 0 ? (
//             defaultValues.experience?.map((exp, index) => {
//               const isExpanded = expandedIndex === index;
//               return (
//                 <div
//                   key={exp._id}
//                   className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100"
//                 >
//                   <div
//                     className="flex justify-between items-center cursor-pointer"
//                     onClick={() => toggleExpand(index)}
//                   >
//                     <div className="flex-1 pr-4">
//                       <h4 className="text-lg font-bold text-gray-800">
//                         {exp.company}
//                       </h4>
//                       {!isExpanded && (
//                         <p className="text-purple-600 font-medium line-clamp-1 mt-1">
//                           {exp.position}
//                         </p>
//                       )}
//                     </div>
//                     <div className="flex gap-2 items-center">
//                       <button
//                         variant="outline"
//                         size="icon"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setEditExp(true);
//                           setEditExpIndex(index);
//                         }}
//                         className="text-purple-600 border-purple-300 hover:bg-purple-50 h-9 w-9"
//                       >
//                         <Pencil className="h-4 w-4" />
//                       </button>
//                       <button
//                         variant="outline"
//                         size="icon"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setDeleteExp(true);
//                           setDeleteExpIndex(exp._id);
//                         }}
//                         className="text-red-600 border-red-300 hover:bg-red-50 h-9 w-9"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                       <button variant="ghost" size="icon" className="h-9 w-9">
//                         {isExpanded ? (
//                           <ChevronUp className="h-5 w-5" />
//                         ) : (
//                           <ChevronDown className="h-5 w-5" />
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                   {isExpanded && (
//                     <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top duration-300">
//                       <p className="text-purple-600 font-medium">
//                         {exp.position}
//                       </p>
//                       <p className="text-gray-600 leading-relaxed">
//                         {exp.description}
//                       </p>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                         <div className="flex items-center gap-2 text-gray-600">
//                           <Calendar className="h-4 w-4 text-gray-400" />
//                           <span>
//                             {exp.startDate} - {exp.endDate || 'Present'}
//                           </span>
//                         </div>
//                         {exp.location && (
//                           <div className="flex items-center gap-2 text-gray-600">
//                             <MapPin className="h-4 w-4 text-gray-400" />
//                             <span>{exp.location}</span>
//                           </div>
//                         )}
//                       </div>
//                       {exp.technologies?.length > 0 && (
//                         <div>
//                           <p className="text-sm font-medium text-gray-700 mb-2">
//                             Technologies:
//                           </p>
//                           <div className="flex flex-wrap gap-2">
//                             {exp.technologies.map((tech) => (
//                               <span
//                                 key={tech}
//                                 className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
//                               >
//                                 {tech}
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               );
//             })
//           ) : (
//             <div className=" text-gray-500  italic">No data</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Experience;

import {
  Briefcase,
  Calendar,
  MapPin,
  Pencil,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import React from 'react';

const Experience = ({
  defaultValues,
  setAddExp,
  setEditExp,
  setEditExpIndex,
  setDeleteExp,
  setDeleteExpIndex,
}: any) => {
  return (
    <div>
      {/* --- Header --- */}
      <div className="flex w-full items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Experience</h3>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAddExp(true);
            }}
            className="w-full flex items-center justify-center py-2 px-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Experience
          </button>
        </div>
      </div>

      {/* --- Experience List --- */}
      <div
        id="experience"
        className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200"
      >
        <div className="space-y-4">
          {defaultValues.experience && defaultValues.experience.length > 0 ? (
            defaultValues.experience.map((exp, index) => (
              <div
                key={exp._id}
                className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100"
              >
                {/* Header Row */}
                <div className="flex justify-between items-center">
                  <div className="flex-1 pr-4">
                    <h4 className="text-lg font-bold text-gray-800">
                      {exp.company}
                    </h4>
                    <p className="text-purple-600 font-medium mt-1">
                      {exp.position}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditExp(true);
                        setEditExpIndex(index);
                      }}
                      className="text-purple-600 border-purple-300 hover:bg-purple-50 h-9 w-9"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteExp(true);
                        setDeleteExpIndex(exp._id);
                      }}
                      className="text-red-600 border-red-300 hover:bg-red-50 h-9 w-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Always Visible Details */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  {exp.description && (
                    <p className="text-gray-600 leading-relaxed">
                      {exp.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </span>
                    </div>
                    {exp.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{exp.location}</span>
                      </div>
                    )}
                  </div>

                  {exp.technologies?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Technologies:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech: string) => (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 italic">No data</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Experience;
