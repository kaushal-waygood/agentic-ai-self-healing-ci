import { Code, PlusCircle, Trash2, Edit, ChevronDown } from 'lucide-react';
import React from 'react';

const Skills = ({
  defaultValues,
  setAddSkill,
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
      <div className="flex w-full items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
            <Code className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-800">
            Skills ({defaultValues.skills.length})
          </h3>
        </div>

        {/* Add Skill Button - Responsive */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setAddSkill(true);
          }}
          className="flex items-center justify-center py-2 px-4 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-lg  gap-2 transition-all duration-300 text-sm font-semibold"
        >
          <PlusCircle className="ml-2 sm:ml-0 h-5 w-5 sm:w-4" />
          <span className="hidden sm:inline">Add Skill</span>
        </button>
      </div>
      {/* --- */}

      {/* Scrollable skills list container */}
      <div className="  ">
        <div className="p-2 max-h-[70vh] overflow-y-auto  ">
          {/* Responsive Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 ">
            {defaultValues.skills && defaultValues.skills.length > 0 ? (
              defaultValues.skills.map((skill, index) => (
                <div
                  key={skill._id || index}
                  className="bg-white rounded-lg p-4 shadow-inner hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start ">
                    {/* Skill Name and Level Badge */}
                    <div className="pr-2">
                      <h4 className="text-base font-bold text-gray-800 break-all">
                        {skill.skill}
                      </h4>
                      <span
                        className={`mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${getSkillBadgeColor(
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
                          handleLevelChange(skill._id, e.target.value);
                        }}
                        className="w-full text-gray-600 rounded border-gray-300 px-3 py-2 text-sm  focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                        className="   text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300 flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4 items-center justify-center" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty State
              <div className="text-gray-500 italic p-4 col-span-full">
                You haven't added any skills yet. Click "Add Skill" to get
                started!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skills;
