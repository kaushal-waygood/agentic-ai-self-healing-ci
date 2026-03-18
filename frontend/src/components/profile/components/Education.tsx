'use client';

import React, { useState } from 'react';
import {
  Award,
  Calendar,
  GraduationCap,
  MapPin,
  Pencil,
  PlusCircle,
  Trash2,
  Loader2,
  AlertTriangle,
  Building2,
  BookOpen,
} from 'lucide-react';

import { useEducation } from '@/hooks/useProfile';
import { AddEducation } from '../AddEducation';
import ModalPortal from '@/components/ui/modalPortal';
import { ProfileGridSkeleton } from '@/components/ui/ProfileGridSkeleton';

const formatDateForMonthInput = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toLocaleString('default', {
    month: 'short',
  })} ${d.getFullYear()}`;
};

const Education = () => {
  const { educations, deleteEducation, loading } = useEducation();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 ">
      {/* --- HEADER --- */}
      <div className="flex w-full items-center justify-between mb-6 ">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Education
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-semibold">
              {educations.length}
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
      {/* --- EDUCATION LIST --- */}
      <div className="max-h-[65vh] overflow-y-auto custom-scrollbar pr-2 pb-4">
        {/* Changed grid layout to stack vertically like experiences, which reads better for detailed info */}
        <div className="space-y-5 ">
          {loading && educations.length === 0 ? (
            <ProfileGridSkeleton count={3} />
          ) : educations.length > 0 ? (
            educations.map((edu: any) => (
              <div
                key={edu._id}
                className="group bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                {/* Top Row: Degree, Institute & Actions */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 leading-tight">
                      {edu.degree}
                    </h4>

                    <div className="flex items-center gap-2 mt-2 text-[15px] font-medium text-gray-800">
                      <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="break-all">{edu.institute}</span>
                    </div>

                    {edu.fieldOfStudy && (
                      <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-600">
                        <BookOpen className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="break-all">
                          Field of Study: {edu.fieldOfStudy}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => setEditData(edu)}
                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(edu._id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Metadata Row (Dates, Location, Grades) */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                  {/* Dates */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                    <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-700 whitespace-nowrap">
                      {formatDateForMonthInput(edu.startDate)} —{' '}
                      {formatDateForMonthInput(edu.endDate) || (
                        <span className="text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded">
                          Present
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Country / Location */}
                  {edu.country && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="truncate max-w-[150px]">
                        {edu.country}
                      </span>
                    </div>
                  )}

                  {/* GPA */}
                  {edu.gpa && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-blue-50/50 px-2.5 py-1 rounded-md border border-blue-100">
                      <Award className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span className="font-medium text-blue-700">
                        GPA: {edu.gpa}
                      </span>
                    </div>
                  )}

                  {/* Percentage/Grade */}
                  {edu.grade && !edu.gpa && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-blue-50/50 px-2.5 py-1 rounded-md border border-blue-100">
                      <Award className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span className="font-medium text-blue-700">
                        Grade: {edu.grade}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <GraduationCap className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                No education added yet.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Click "Add" to showcase your academic background.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- ADD MODAL --- */}
      {isAddOpen && <AddEducation onCancel={() => setIsAddOpen(false)} />}

      {/* --- EDIT MODAL --- */}
      {editData && (
        <AddEducation
          isEdit
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
                  Delete Education
                </h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm">
                Are you sure you want to remove this education entry? This
                action cannot be undone.
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
                    deleteEducation(deleteId);
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

export default Education;

// 'use client';

// import React, { useState } from 'react';
// import {
//   Award,
//   Calendar,
//   GraduationCap,
//   MapPin,
//   Pencil,
//   PlusCircle,
//   Trash2,
//   Loader2,
// } from 'lucide-react';

// import { useEducation } from '@/hooks/useProfile';
// import { AddEducation } from '../AddEducation';
// import ModalPortal from '@/components/ui/modalPortal';
// import { ProfileGridSkeleton } from '@/components/ui/ProfileGridSkeleton';

// const formatDateForMonthInput = (date: string) => {
//   if (!date) return '';
//   const d = new Date(date);
//   if (Number.isNaN(d.getTime())) return '';
//   return `${d.toLocaleString('default', {
//     month: 'short',
//   })} ${d.getFullYear()}`;
// };

// const Education = () => {
//   const { educations, deleteEducation, loading } = useEducation();

//   // modal state (LOCAL, correct place)
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [editData, setEditData] = useState<any | null>(null);
//   const [deleteId, setDeleteId] = useState<string | null>(null);

//   return (
//     <div>
//       {/* Header */}
//       <div className="flex w-full items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
//             <GraduationCap className="h-6 w-6 text-white" />
//           </div>
//           <h3 className="text-xl flex font-bold gap-2 text-gray-800">
//             Education : {educations.length}
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
//       <div className="rounded-lg p-2 max-h-[70vh] overflow-y-auto">
//         <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2  gap-4">
//           {loading && educations.length === 0 ? (
//             <ProfileGridSkeleton count={6} />
//           ) : educations.length > 0 ? (
//             educations.map((edu, index) => (
//               <div key={edu._id} className="bg-white rounded-lg p-4 border ">
//                 <div className="flex justify-between items-start mb-4">
//                   <div className="flex-1">
//                     <h4 className="text-lg font-bold text-gray-800 mb-1">
//                       <span className="text-sm font-semibold text-gray-500 shrink-0 mr-1">
//                         {index + 1}.
//                       </span>
//                       {edu.degree}
//                     </h4>
//                     <p className="text-blue-600 font-medium break-all ">
//                       {edu.institute}
//                     </p>
//                     {edu.fieldOfStudy && (
//                       <p className="text-sm text-gray-500 mt-1 break-all line-clamp-1">
//                         Field: {edu.fieldOfStudy}
//                       </p>
//                     )}
//                   </div>

//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => setEditData(edu)}
//                       className="text-blue-600 border border-blue-300 hover:bg-blue-50 h-9 w-9 rounded-md flex items-center justify-center"
//                     >
//                       <Pencil className="h-4 w-4" />
//                     </button>

//                     <button
//                       onClick={() => setDeleteId(edu._id)}
//                       className="text-red-600 border border-red-300 hover:bg-red-50 h-9 w-9 rounded-md flex items-center justify-center"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-100">
//                   <div className="flex items-center gap-2 text-gray-600">
//                     <Calendar className="h-4 w-4 text-gray-400" />
//                     <span>
//                       {formatDateForMonthInput(edu.startDate)} to{' '}
//                       {formatDateForMonthInput(edu.endDate) || 'Present'}
//                     </span>
//                   </div>

//                   {edu.gpa && (
//                     <div className="flex items-center gap-2 text-gray-600">
//                       <Award className="h-4 w-4 text-gray-400" />
//                       <span>GPA: {edu.gpa}</span>
//                     </div>
//                   )}

//                   {edu.country && (
//                     <div className="flex items-center gap-2 text-gray-600">
//                       <MapPin className="h-4 w-4 text-gray-400" />
//                       <span>{edu.country}</span>
//                     </div>
//                   )}
//                   {edu.grade && (
//                     <div className="flex items-center gap-2 text-gray-600">
//                       <Award className="h-4 w-4 text-gray-400" />
//                       <span>Percentage/CGPA: {edu.grade}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="text-gray-500 italic">No education added</div>
//           )}
//         </div>
//       </div>

//       {/* ADD MODAL */}
//       {isAddOpen && <AddEducation onCancel={() => setIsAddOpen(false)} />}

//       {/* EDIT MODAL */}
//       {editData && (
//         <AddEducation
//           isEdit
//           data={editData}
//           onCancel={() => setEditData(null)}
//         />
//       )}

//       {/* DELETE CONFIRM */}

//       <ModalPortal>
//         {deleteId && (
//           <div className="fixed inset-0 z-[50] bg-black/40 flex items-center justify-center ">
//             <div className="bg-white p-6 rounded-lg w-80">
//               <p className="text-gray-800 mb-4">
//                 Are you sure you want to delete this education?
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
//                     deleteEducation(deleteId);
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

// export default Education;
