'use client';

import React, { useState } from 'react';
import {
  Calendar,
  ExternalLink,
  Loader2,
  Package,
  Pencil,
  PlusCircle,
  Trash2,
  AlertTriangle,
  Link as LinkIcon,
} from 'lucide-react';

import { useProjects } from '@/hooks/useProfile';
import { AddProject } from '../AddEducation';
import ModalPortal from '@/components/ui/modalPortal';
import { ProfileGridSkeleton } from '@/components/ui/ProfileGridSkeleton';

const formatDateForMonthInput = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.toLocaleString('default', {
    month: 'short',
  })} ${d.getFullYear()}`;
};

const Project = () => {
  const { projects, deleteProject, loading } = useProjects();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 ">
      {/* --- HEADER --- */}
      <div className="flex w-full items-center justify-between mb-6 ">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Projects
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-semibold">
              {projects.length}
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

      {/* --- PROJECT LIST --- */}
      <div className="max-h-[65vh] overflow-y-auto custom-scrollbar pr-2 pb-4">
        <div className="space-y-5">
          {loading && projects.length === 0 ? (
            <ProfileGridSkeleton count={3} />
          ) : projects.length > 0 ? (
            projects.map((proj: any) => (
              <div
                key={proj._id}
                className="group bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col"
              >
                {/* Top Row: Title & Actions */}
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-bold text-gray-900 leading-tight pr-4">
                    {proj.projectName}
                  </h4>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setEditData(proj)}
                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(proj._id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Metadata Row (Dates & Link) */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-medium text-gray-700">
                      {formatDateForMonthInput(proj.startDate)} —{' '}
                      {formatDateForMonthInput(proj.endDate) || (
                        <span className="text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded">
                          Present
                        </span>
                      )}
                    </span>
                  </div>

                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors max-w-full"
                    >
                      <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate max-w-[200px] sm:max-w-xs">
                        {proj.link}
                      </span>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-70 ml-0.5" />
                    </a>
                  )}
                </div>

                {/* Description */}
                {proj.description && (
                  <div className="py-4 border-t border-gray-100 flex-grow">
                    <p className="text-[15px] text-gray-600 leading-relaxed break-words whitespace-pre-wrap">
                      {proj.description}
                    </p>
                  </div>
                )}

                {/* Footer: Technologies */}
                {proj.technologies?.length > 0 && (
                  <div className="pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex flex-wrap gap-2">
                      {proj.technologies.map((tech: string) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-xs font-semibold tracking-wide"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <Package className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                No projects added yet.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Click "Add" to showcase your personal or professional projects.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- ADD MODAL --- */}
      {isAddOpen && <AddProject onCancel={() => setIsAddOpen(false)} />}

      {/* --- EDIT MODAL --- */}
      {editData && (
        <AddProject isEdit data={editData} onCancel={() => setEditData(null)} />
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
                  Delete Project
                </h3>
              </div>
              <p className="text-gray-600 mb-6 text-sm">
                Are you sure you want to remove this project? This action cannot
                be undone.
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
                    deleteProject(deleteId);
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

export default Project;

// 'use client';

// import React, { useState } from 'react';
// import {
//   Calendar,
//   ExternalLink,
//   Loader2,
//   MapPin,
//   Package,
//   Pencil,
//   PlusCircle,
//   Trash2,
// } from 'lucide-react';

// import { useProjects } from '@/hooks/useProfile';
// import { AddProject } from '../AddEducation';
// import ModalPortal from '@/components/ui/modalPortal';
// import { ProfileGridSkeleton } from '@/components/ui/ProfileGridSkeleton';

// const formatDateForMonthInput = (date: string) => {
//   if (!date) return '';
//   const d = new Date(date);
//   return `${d.toLocaleString('default', {
//     month: 'short',
//   })} ${d.getFullYear()}`;
// };

// const Project = () => {
//   const { projects, deleteProject, loading } = useProjects();

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
//             <Package className="h-6 w-6 text-white" />
//           </div>
//           <h3 className="text-xl flex gap-2 font-bold text-gray-800">
//             Projects : {projects.length}
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
//         <div className="space-y-4">
//           {loading && projects.length === 0 ? (
//             <ProfileGridSkeleton count={3} />
//           ) : projects.length > 0 ? (
//             projects.map((proj, index) => (
//               <div key={proj._id} className="bg-white rounded-lg p-4 border">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm font-semibold text-gray-500 shrink-0 mr-1">
//                     {index + 1}.
//                   </span>
//                   <div className="flex-1 pr-4">
//                     <h4 className="text-lg font-bold text-gray-800 break-all">
//                       {proj.projectName}
//                     </h4>
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => setEditData(proj)}
//                       className="text-blue-600 border border-blue-300 hover:bg-blue-50 h-9 w-9 rounded-md flex items-center justify-center"
//                     >
//                       <Pencil className="h-4 w-4" />
//                     </button>

//                     <button
//                       onClick={() => setDeleteId(proj._id)}
//                       className="text-red-600 border border-red-300 hover:bg-red-50 h-9 w-9 rounded-md flex items-center justify-center"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
//                   <p className="text-gray-600 leading-relaxed">
//                     {proj.description}
//                   </p>

//                   <a
//                     href={proj.link}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="flex items-center gap-1 text-blue-600 hover:underline break-all"
//                   >
//                     {/* Assuming you are using Lucide or Heroicons like the Calendar icon */}
//                     <ExternalLink className="w-3 h-3 flex-shrink-0" />
//                     {proj.link}
//                   </a>

//                   <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 text-sm">
//                     {/* Left Side: Technologies */}
//                     {proj.technologies?.length > 0 && (
//                       <div className="">
//                         <p className="text-sm font-medium text-gray-700 mb-2">
//                           Technologies:
//                         </p>
//                         <div className="flex flex-wrap gap-2">
//                           {proj.technologies.map((tech: string) => (
//                             <span
//                               key={tech}
//                               className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium"
//                             >
//                               {tech}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {/* Right Side: Date */}
//                     {/* Added md:ml-auto to ensure it pushes right if tech is empty, or just rely on justify-between */}
//                     <div className="flex items-center gap-2 text-gray-600 shrink-0">
//                       <Calendar className="h-4 w-4 text-gray-400" />
//                       <span>
//                         {formatDateForMonthInput(proj.startDate)} to{' '}
//                         {formatDateForMonthInput(proj.endDate) || 'Present'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="text-gray-500 italic">No projects added</div>
//           )}
//         </div>
//       </div>

//       {/* ADD */}
//       {isAddOpen && <AddProject onCancel={() => setIsAddOpen(false)} />}

//       {/* EDIT */}
//       {editData && (
//         <AddProject isEdit data={editData} onCancel={() => setEditData(null)} />
//       )}

//       <ModalPortal>
//         {/* DELETE CONFIRM */}
//         {deleteId && (
//           <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//             <div className="bg-white p-6 rounded-lg w-80">
//               <p className="text-gray-800 mb-4">
//                 Are you sure you want to delete this project?
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
//                     deleteProject(deleteId);
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

// export default Project;
