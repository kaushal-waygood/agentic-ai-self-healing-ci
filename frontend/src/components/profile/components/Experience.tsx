'use client';

import React, { useState } from 'react';
import {
  Briefcase,
  BriefcaseBusiness,
  Calendar,
  Loader2,
  MapPin,
  Pencil,
  PlusCircle,
  Trash2,
  AlertTriangle,
  Building2,
} from 'lucide-react';

import { useExperience } from '@/hooks/useProfile';
import { AddExperience } from '../AddEducation'; // adjust path
import ModalPortal from '@/components/ui/modalPortal';
import { ProfileGridSkeleton } from '@/components/ui/ProfileGridSkeleton';

const formatDateForMonthInput = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.toLocaleString('default', {
    month: 'short',
  })} ${d.getFullYear()}`;
};

const Experience = () => {
  const { experiences, deleteExperience, loading } = useExperience();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 ">
      {/* --- HEADER --- */}
      <div className="flex w-full items-center justify-between mb-6 ">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Briefcase className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Experience
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-semibold">
              {experiences.length}
            </span>
            {loading && (
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
            )}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-all"
        >
          <PlusCircle className="mr-1.5 h-4 w-4" />
          Add
        </button>
      </div>

      {/* --- EXPERIENCE LIST --- */}
      <div className="max-h-[65vh] overflow-y-auto custom-scrollbar pr-2 pb-4">
        <div className="space-y-5">
          {loading && experiences.length === 0 ? (
            <ProfileGridSkeleton count={3} />
          ) : experiences.length > 0 ? (
            experiences.map((exp: any) => (
              <div
                key={exp._id}
                className="group bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                {/* Top Row: Title, Company & Actions */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 leading-tight">
                      {exp.designation}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-blue-600 font-medium text-[15px]">
                      <Building2 className="h-4 w-4" />
                      {exp.company}
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditData(exp)}
                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(exp._id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Metadata Row (Location, Type, Dates) */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-5 mb-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-medium text-gray-700">
                      {formatDateForMonthInput(exp.startDate)} —{' '}
                      {formatDateForMonthInput(exp.endDate) || (
                        <span className="text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded">
                          Present
                        </span>
                      )}
                    </span>
                    {exp.experienceYrs > 0 && (
                      <span className="ml-1 text-gray-400">
                        ({exp.experienceYrs} yrs)
                      </span>
                    )}
                  </div>

                  {exp.employmentType && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <BriefcaseBusiness className="h-3.5 w-3.5 text-gray-400" />
                      <span>{exp.employmentType}</span>
                    </div>
                  )}

                    {exp.experienceYrs > 0 && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{exp.experienceYrs} years</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {formatDateForMonthInput(exp.startDate)} to{' '}
                        {/* {formatDateForMonthInput(exp.endDate) || 'Present'} */}
                        {exp.currentlyWorking
                          ? 'Present'
                          : formatDateForMonthInput(exp.endDate) || 'Present'}
                      </span>
                    </div>
                  </div>

                  {/* {exp.technologies?.length > 0 && (
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

                {/* Description */}
                {exp.description && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[15px] text-gray-600 leading-relaxed break-words whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <Briefcase className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                No experience added yet.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Click "Add" to showcase your work history.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- ADD MODAL --- */}
      {isAddOpen && <AddExperience onCancel={() => setIsAddOpen(false)} />}

      {/* --- EDIT MODAL --- */}
      {editData && (
        <AddExperience
          isEdit={true}
          data={editData}
          onCancel={() => setEditData(null)}
        />
      )}

      {/* --- DELETE CONFIRM MODAL --- */}
      <ModalPortal>
        {deleteId && (
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl">
              <div className="flex items-center gap-3 mb-4 text-red-600">
                <div className="p-2 bg-red-50 rounded-full">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Experience
                </h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm">
                Are you sure you want to remove this experience? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteExperience(deleteId);
                    setDeleteId(null);
                  }}
                  className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalPortal>
    </div>
  );
};

export default Experience;

// 'use client';

// import React, { useState } from 'react';
// import {
//   Briefcase,
//   BriefcaseBusiness,
//   Calendar,
//   Loader2,
//   MapPin,
//   Pencil,
//   PlusCircle,
//   Trash2,
// } from 'lucide-react';

// import { useExperience } from '@/hooks/useProfile';
// import { AddExperience } from '../AddEducation'; // adjust path
// import ModalPortal from '@/components/ui/modalPortal';
// import { ProfileGridSkeleton } from '@/components/ui/ProfileGridSkeleton';

// const formatDateForMonthInput = (date: string) => {
//   if (!date) return '';
//   const d = new Date(date);
//   return `${d.toLocaleString('default', {
//     month: 'short',
//   })} ${d.getFullYear()}`;
// };

// const Experience = () => {
//   const { experiences, deleteExperience, loading } = useExperience();

//   // local UI state (correct place)
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [editData, setEditData] = useState<any | null>(null);
//   const [deleteId, setDeleteId] = useState<string | null>(null);

//   return (
//     <div>
//       {/* Header */}
//       <div className="flex w-full items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
//             <Briefcase className="h-6 w-6 text-white" />
//           </div>
//           <h3 className="text-xl flex gap-2 font-bold text-gray-800">
//             Experience : {experiences.length}
//             <span>
//               {' '}
//               {loading && (
//                 <Loader2 className="animate-spin transition duration-500" />
//               )}
//             </span>
//           </h3>
//         </div>

//         <button
//           type="button"
//           onClick={() => setIsAddOpen(true)}
//           className="flex items-center justify-center py-2 px-4 bg-buttonPrimary hover:bg-blue-700 text-white rounded-lg transition-all"
//         >
//           <PlusCircle className="mr-2 h-5 w-5" />
//           Add
//         </button>
//       </div>

//       {/* List */}
//       <div className=" p-2 max-h-[70vh] overflow-y-auto">
//         <div className=" space-y-4">
//           {loading && experiences.length === 0 ? (
//             <ProfileGridSkeleton count={3} />
//           ) : experiences.length > 0 ? (
//             experiences.map((exp, index) => (
//               <div key={exp._id} className=" bg-white rounded-lg p-4 border ">
//                 <div className="flex justify-between items-center">
//                   <div className="flex-1">
//                     <h4 className="text-lg font-bold text-gray-800">
//                       <span className="text-sm font-semibold text-gray-500 shrink-0 mr-1">
//                         {index + 1}.
//                       </span>
//                       {exp.company}
//                     </h4>
//                     <p className="text-blue-600 font-medium ">
//                       {exp.designation}
//                     </p>
//                   </div>

//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => setEditData(exp)}
//                       className="text-blue-600 border border-blue-300 hover:bg-blue-50 h-9 w-9 rounded-md flex items-center justify-center"
//                     >
//                       <Pencil className="h-4 w-4" />
//                     </button>

//                     <button
//                       onClick={() => setDeleteId(exp._id)}
//                       className="text-red-600 border border-red-300 hover:bg-red-50 h-9 w-9 rounded-md flex items-center justify-center"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="mt-2 pt-4 border-t border-gray-100 space-y-2">
//                   {exp.description && (
//                     <p className="text-gray-600 break-all leading-relaxed">
//                       {exp.description}
//                     </p>
//                   )}

//                   <div className="flex flex-wrap justify-between gap-4 text-sm">
//                     {exp.location && (
//                       <div className="flex items-center gap-2 text-gray-600">
//                         <MapPin className="h-4 w-4 text-gray-400" />
//                         <span>{exp.location}</span>
//                       </div>
//                     )}

//                     <div className="flex items-center gap-2  text-gray-600">
//                       <BriefcaseBusiness className="h-4 w-4 text-gray-400 ml-2" />
//                       <span>{exp.employmentType}</span>
//                     </div>

//                     {exp.experienceYrs > 0 && (
//                       <div className="flex items-center gap-2 text-gray-600">
//                         <Calendar className="h-4 w-4 text-gray-400" />
//                         <span>{exp.experienceYrs} years</span>
//                       </div>
//                     )}
//                     <div className="flex items-center gap-2 text-gray-600">
//                       <Calendar className="h-4 w-4 text-gray-400" />
//                       <span>
//                         {formatDateForMonthInput(exp.startDate)} to{' '}
//                         {formatDateForMonthInput(exp.endDate) || 'Present'}
//                       </span>
//                     </div>
//                   </div>

//                   {/* {exp.technologies?.length > 0 && (
//                     <div>
//                       <p className="text-sm font-medium text-gray-700 mb-2">
//                         Technologies:
//                       </p>
//                       <div className="flex flex-wrap gap-2">
//                         {exp.technologies.map((tech: string) => (
//                           <span
//                             key={tech}
//                             className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
//                           >
//                             {tech}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )} */}
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="text-gray-500 italic">No experience added</div>
//           )}
//         </div>
//       </div>

//       {/* ADD */}
//       {isAddOpen && <AddExperience onCancel={() => setIsAddOpen(false)} />}

//       {/* EDIT */}
//       {editData && (
//         <AddExperience
//           isEdit={true}
//           data={editData}
//           onCancel={() => setEditData(null)}
//         />
//       )}

//       {/* DELETE CONFIRM */}
//       <ModalPortal>
//         {deleteId && (
//           <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//             <div className="bg-white p-6 rounded-lg w-80">
//               <p className="text-gray-800 mb-4">
//                 Are you sure you want to delete this experience?
//               </p>
//               <div className="flex justify-end gap-3">
//                 <button
//                   onClick={() => setDeleteId(null)}
//                   className="px-4 py-2 border rounded"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => {
//                     deleteExperience(deleteId);
//                     setDeleteId(null);
//                   }}
//                   className="px-4 py-2 bg-red-600 text-white rounded"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </ModalPortal>
//     </div>
//   );
// };

// export default Experience;
