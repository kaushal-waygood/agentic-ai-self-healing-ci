'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Loader2,
  MapPin,
  Package,
  Pencil,
  PlusCircle,
  Trash2,
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

  // local UI state (correct place)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editData, setEditData] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div>
      {/* Header */}
      <div className="flex w-full items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl flex gap-2 font-bold text-gray-800">
            Projects ({projects.length}){' '}
            <span>
              {' '}
              {loading && (
                <Loader2 className="animate-spin transition duration-500" />
              )}
            </span>
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center py-2 px-4 bg-buttonPrimary hover:bg-blue-700 text-white rounded-lg transition-all"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Add
        </button>
      </div>

      {/* List */}
      <div className="rounded-lg p-2 max-h-[70vh] overflow-y-auto">
        <div className="space-y-4">
          {loading && projects.length === 0 ? (
            <ProfileGridSkeleton count={3} />
          ) : projects.length > 0 ? (
            projects.map((proj, index) => (
              <div key={proj._id} className="bg-white rounded-lg p-4 border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-500 shrink-0 mr-1">
                    {index + 1}.
                  </span>
                  <div className="flex-1 pr-4">
                    <h4 className="text-lg font-bold text-gray-800 break-all">
                      {proj.projectName}
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditData(proj)}
                      className="text-blue-600 border border-blue-300 hover:bg-blue-50 h-9 w-9 rounded-md flex items-center justify-center"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setDeleteId(proj._id)}
                      className="text-red-600 border border-red-300 hover:bg-red-50 h-9 w-9 rounded-md flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    {proj.description}
                  </p>
                  <p className="break-all">{proj.link}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        {formatDateForMonthInput(proj.startDate)} to{' '}
                        {formatDateForMonthInput(proj.endDate) || 'Present'}
                      </span>
                    </div>

                    {proj.country && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{proj.country}</span>
                      </div>
                    )}
                  </div>

                  {proj.technologies?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Technologies:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {proj.technologies.map((tech: string) => (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium"
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
            <div className="text-gray-500 italic">No projects added</div>
          )}
        </div>
      </div>

      {/* ADD */}
      {isAddOpen && <AddProject onCancel={() => setIsAddOpen(false)} />}

      {/* EDIT */}
      {editData && (
        <AddProject isEdit data={editData} onCancel={() => setEditData(null)} />
      )}

      <ModalPortal>
        {/* DELETE CONFIRM */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-80">
              <p className="text-gray-800 mb-4">
                Are you sure you want to delete this project?
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
                    deleteProject(deleteId);
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

export default Project;
