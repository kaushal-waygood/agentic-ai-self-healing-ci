'use client';

import React, { useState } from 'react';
import { Code, PlusCircle, Trash2 } from 'lucide-react';

import { useSkills } from '@/hooks/useProfile';
import { AddSkill } from '../AddEducation';
import ModalPortal from '@/components/ui/modalPortal';

const getSkillBadgeColor = (level: string) => {
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

const Skills = () => {
  const { skills, createSkill, updateSkill, deleteSkill } = useSkills();

  // local UI state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div>
      {/* Header */}
      <div className="flex w-full items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
            <Code className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-800">Skills</h3>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center py-2 px-4 bg-buttonPrimary hover:bg-blue-700 text-white rounded-lg transition-all"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add Skill
        </button>
      </div>

      {/* Skills Grid */}
      <div className="p-2 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.length > 0 ? (
            skills.map((skill: any) => (
              <div
                key={skill._id}
                className="bg-white rounded-lg p-4 shadow-inner hover:shadow-lg transition-all border border-gray-200 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="pr-2">
                    <h4 className="text-base font-bold text-gray-800 break-all">
                      {skill.skill}
                    </h4>
                    <span
                      className={`mt-1 inline-block  py-0.5 rounded-full text-xs font-semibold ${getSkillBadgeColor(
                        skill.level,
                      )}`}
                    >
                      {skill.level}
                    </span>
                  </div>

                  <div className="flex  items-center gap-2">
                    <select
                      value={skill.level}
                      onChange={(e) =>
                        updateSkill(skill._id, {
                          level: e.target.value,
                        })
                      }
                      className="text-gray-600 rounded border-gray-300  py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="EXPERT">Expert</option>
                    </select>

                    <button
                      onClick={() => setDeleteId(skill._id)}
                      className="text-red-600  hover:text-red-700 hover:bg-red-50 border-red-300 flex-shrink-0 p-2 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 italic p-4 col-span-full">
              You haven’t added any skills yet. Click “Add Skill” to get
              started.
            </div>
          )}
        </div>
      </div>

      {/* ADD */}
      {isAddOpen && (
        <AddSkill
          onCancel={() => setIsAddOpen(false)}
          onSave={(data) => {
            createSkill(data);
            setIsAddOpen(false);
          }}
        />
      )}

      {/* DELETE CONFIRM */}
      <ModalPortal>
        {deleteId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-80">
              <p className="text-gray-800 mb-4">
                Are you sure you want to delete this skill?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteSkill(deleteId);
                    setDeleteId(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded"
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
