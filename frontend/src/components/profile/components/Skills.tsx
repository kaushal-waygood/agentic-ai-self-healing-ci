// import { ChevronDown, Code, PlusCircle, Trash2 } from 'lucide-react';
// import React from 'react';

// const Skills = ({
//   defaultValues,
//   expandedIndex,
//   toggleExpand,
//   setAddSkill,
//   setEditSkill,
//   setEditSkillIndex,
//   setDeleteSkill,
//   setDeleteSkillIndex,
//   handleLevelChange,
// }: any) => {
//   const getSkillBadgeColor = (level) => {
//     switch (level) {
//       case 'EXPERT':
//         return 'bg-green-100 text-green-700 border-green-300';
//       case 'INTERMEDIATE':
//         return 'bg-blue-100 text-blue-700 border-blue-300';
//       case 'BEGINNER':
//         return 'bg-yellow-100 text-yellow-700 border-yellow-300';
//       default:
//         return 'bg-gray-100 text-gray-700 border-gray-300';
//     }
//   };

//   return (
//     <div>
//       <div className="flex w-full items-center justify-between pb-4">
//         <div className="flex items-center gap-3">
//           <div className="p-3 bg-gradient-to-r from-green-500 to-cyan-600 rounded-xl">
//             <Code className="h-6 w-6 text-white" />
//           </div>
//           <h3 className="text-xl font-bold text-gray-800">Skills</h3>
//         </div>
//         <div className="flex items-center gap-4">
//           <button
//             type="button"
//             onClick={(e) => {
//               e.stopPropagation();
//               setAddSkill(true);
//             }}
//             className="w-full flex items-center justify-center py-3 px-1 bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
//           >
//             <PlusCircle className="mr-2 h-5 w-5" />
//             Add Skill
//           </button>
//           <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
//         </div>
//       </div>
//       <div className="bg-gradient-to-r from-green-50 to-cyan-50 rounded-2xl p-6 border border-green-200">
//         <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
//           {defaultValues.skills && defaultValues.skills.length > 0 ? (
//             defaultValues.skills?.map((skill) => (
//               <div
//                 key={skill._id}
//                 className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100"
//               >
//                 <div className="flex justify-between items-center gap-3">
//                   <div className="flex-1">
//                     <h4 className="text-lg font-bold text-gray-800">
//                       {skill.skill}
//                     </h4>
//                     <span
//                       className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getSkillBadgeColor(
//                         skill.level,
//                       )}`}
//                     >
//                       {skill.level}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <select
//                       value={skill.level}
//                       onChange={(e) =>
//                         handleLevelChange(skill.skillId, e.target.value)
//                       }
//                       className="w-full rounded border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
//                     >
//                       <option value="BEGINNER">Beginner</option>
//                       <option value="INTERMEDIATE">Intermediate</option>
//                       <option value="EXPERT">Expert</option>
//                     </select>
//                     <button
//                       onClick={() => {
//                         setDeleteSkill(true);
//                         setDeleteSkillIndex(skill._id);
//                       }}
//                       className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 flex-shrink-0"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className=" text-gray-500  italic">No data</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Skills;

import { ChevronDown, Code, PlusCircle, Trash2 } from 'lucide-react';
import React from 'react';

const Skills = ({
  defaultValues,
  expandedIndex,
  toggleExpand,
  setAddSkill,
  setEditSkill,
  setEditSkillIndex,
  setDeleteSkill,
  setDeleteSkillIndex,
  handleLevelChange,
}: any) => {
  const getSkillBadgeColor = (level) => {
    switch (level) {
      case 'EXPERT':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'BEGINNER':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex w-full items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-cyan-600 rounded-xl">
            <Code className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Skills</h3>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAddSkill(true);
            }}
            className="w-full flex items-center justify-center py-2 px-1 bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Skill
          </button>
          {/* <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-180" /> */}
        </div>
      </div>

      {/* Scrollable skills list */}
      <div className="bg-gradient-to-r from-green-50 to-cyan-50 rounded-2xl p-6 border border-green-200">
        <div className=" overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {defaultValues.skills && defaultValues.skills.length > 0 ? (
              defaultValues.skills?.map((skill) => (
                <div
                  key={skill._id}
                  className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100"
                >
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800">
                        {skill.skill}
                      </h4>
                      <span
                        className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getSkillBadgeColor(
                          skill.level,
                        )}`}
                      >
                        {skill.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={skill.level}
                        onChange={(e) => {
                          console.log(e.target.value);
                          handleLevelChange(skill.skillId, e.target.value);
                        }}
                        className="w-full text-gray-600 rounded border-gray-300 px-3 py-2 text-sm border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="EXPERT">Expert</option>
                      </select>
                      <button
                        onClick={() => {
                          setDeleteSkill(true);
                          setDeleteSkillIndex(skill._id);
                        }}
                        className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic">No data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skills;
