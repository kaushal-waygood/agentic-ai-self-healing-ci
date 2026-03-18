'use client';

import React, { useState } from 'react';
import { Code, Loader2, PlusCircle, X } from 'lucide-react';

import { useSkills } from '@/hooks/useProfile';
import { AddSkill } from '../AddEducation';
import ModalPortal from '@/components/ui/modalPortal';

const Skills = () => {
  const { skills, createSkill, updateSkill, deleteSkill, loading } =
    useSkills();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Helper to color-code the tiny indicator dot
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'EXPERT':
        return 'bg-green-500';
      case 'INTERMEDIATE':
        return 'bg-blue-500';
      case 'BEGINNER':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* --- HEADER --- */}
      <div className="flex w-full items-center justify-between mb-6 ">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Code className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Skills
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-semibold">
              {skills.length}
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

      {/* --- HIGH DENSITY SKILLS WRAP --- */}
      <div className="max-h-[65vh] overflow-y-auto custom-scrollbar pr-2">
        <div className="flex flex-wrap gap-2.5">
          {skills.length > 0 ? (
            skills.map((skill: any) => (
              <div
                key={skill._id}
                className="group flex items-center bg-white border border-gray-200 hover:border-blue-400 rounded-lg pl-3 pr-1 py-2 shadow-sm transition-all"
              >
                {/* Skill Name */}
                <span className="text-sm font-semibold text-gray-700 mr-2 whitespace-nowrap">
                  {skill.skill}
                </span>

                {/* Level Dropdown (Compact) */}
                <div className="flex items-center bg-gray-50 rounded-full px-2 py-0.5 border border-gray-100">
                  <div
                    className={`h-2 w-2 rounded-full mr-1.5 ${getLevelColor(skill.level)}`}
                  ></div>
                  <select
                    value={skill.level}
                    onChange={(e) =>
                      updateSkill(skill._id, { level: e.target.value })
                    }
                    className="text-xs font-medium text-gray-600 bg-transparent cursor-pointer focus:outline-none appearance-none text-center"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>

                {/* Delete Button (Tiny X) */}
                <button
                  onClick={() => setDeleteId(skill._id)}
                  className="ml-1 p-1 rounded-full text-gray-400 hover:text-white hover:bg-red-500 transition-colors"
                  title="Delete"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          ) : !loading ? (
            <p className="text-gray-500 text-sm italic">No skills added yet.</p>
          ) : null}
        </div>
      </div>

      {/* --- ADD MODAL --- */}
      {isAddOpen && (
        <AddSkill
          onCancel={() => setIsAddOpen(false)}
          existingSkills={skills}
          skillCount={skills.length}
          maxSkillLimit={20}
          onSave={(data) => {
            createSkill(data);
            setIsAddOpen(false);
          }}
        />
      )}

      {/* --- DELETE CONFIRM MODAL --- */}
      <ModalPortal>
        {deleteId && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-xl w-80 shadow-xl">
              <p className="text-gray-800 font-medium mb-4">
                Remove this skill?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteSkill(deleteId);
                    setDeleteId(null);
                  }}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded-md"
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

export default Skills;

// 'use client';

// import React, { useState } from 'react';
// import {
//   Code,
//   Loader,
//   Loader2,
//   Loader2Icon,
//   LoaderPinwheel,
//   LucideLoader,
//   PlusCircle,
//   Trash2,
// } from 'lucide-react';

// import { useSkills } from '@/hooks/useProfile';
// import { AddSkill } from '../AddEducation';
// import ModalPortal from '@/components/ui/modalPortal';
// import { ProfileGridSkeleton } from '@/components/ui/ProfileGridSkeleton';

// const getSkillBadgeColor = (level: string) => {
//   switch (level) {
//     case 'EXPERT':
//       return 'bg-green-100 text-green-700 border-green-300';
//     case 'INTERMEDIATE':
//       return 'bg-blue-100 text-blue-700 border-blue-300';
//     case 'BEGINNER':
//       return 'bg-yellow-100 text-yellow-700 border-yellow-300';
//     default:
//       return 'bg-gray-100 text-gray-700 border-gray-300';
//   }
// };

// const Skills = () => {
//   const { skills, createSkill, updateSkill, deleteSkill, loading } =
//     useSkills();

//   // local UI state
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [deleteId, setDeleteId] = useState<string | null>(null);

//   return (
//     <div>
//       {/* Header */}
//       <div className="flex w-full items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
//             <Code className="h-6 w-6 text-white" />
//           </div>
//           <h3 className="text-xl flex gap-2 font-extrabold text-gray-800">
//             Skills : {skills.length}
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

//       {/* Skills Grid */}
//       <div className="p-2 max-h-[70vh]  overflow-y-auto">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {loading && skills.length === 0 ? (
//             <ProfileGridSkeleton count={6} />
//           ) : skills.length > 0 ? (
//             skills.map((skill: any, index) => (
//               <div
//                 key={skill._id}
//                 className="bg-white rounded-lg p-4 border border-gray-200 flex flex-col gap-3"
//               >
//                 {/* First line: Skill title */}
//                 <h4 className="text-base font-bold text-gray-800 line-clamp-1">
//                   <span className="text-sm font-semibold text-gray-500 mr-1">
//                     {index + 1}.
//                   </span>
//                   {skill.skill}
//                 </h4>

//                 {/* Second line: CENTERED & BETWEEN */}
//                 <div className="flex items-center flex-wrap justify-between ">
//                   {/* Left side */}
//                   <span
//                     className={`rounded-lg px-2 py-1 text-xs font-semibold ${getSkillBadgeColor(
//                       skill.level,
//                     )}`}
//                   >
//                     {skill.level}
//                   </span>

//                   {/* Right side */}
//                   <div className="flex items-center gap-2">
//                     <select
//                       value={skill.level}
//                       onChange={(e) =>
//                         updateSkill(skill._id, { level: e.target.value })
//                       }
//                       className="text-gray-600 border rounded border-gray-300 text-sm
//                    focus:outline-none focus:ring-2 focus:ring-blue-400"
//                     >
//                       <option value="BEGINNER">Beginner</option>
//                       <option value="INTERMEDIATE">Intermediate</option>
//                       <option value="EXPERT">Expert</option>
//                     </select>

//                     <button
//                       onClick={() => setDeleteId(skill._id)}
//                       className="text-red-600 border border-red-300 hover:bg-red-50 h-9 w-9 rounded-md flex items-center justify-center"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="text-gray-500 italic p-4 col-span-full">
//               You haven’t added any skills yet. Click “Add Skill” to get
//               started.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ADD */}
//       {isAddOpen && (
//         <AddSkill
//           onCancel={() => setIsAddOpen(false)}
//           existingSkills={skills}
//           skillCount={skills.length}
//           maxSkillLimit={20}
//           onSave={(data) => {
//             createSkill(data);
//             setIsAddOpen(false);
//           }}
//         />
//       )}

//       {/* DELETE CONFIRM */}
//       <ModalPortal>
//         {deleteId && (
//           <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//             <div className="bg-white p-6 rounded-lg w-80">
//               <p className="text-gray-800 mb-4">
//                 Are you sure you want to delete this skill?
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
//                     deleteSkill(deleteId);
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

// export default Skills;
