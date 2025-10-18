import React from 'react';
import {
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  GraduationCap,
  MapPin,
  Package,
  Pencil,
  PlusCircle,
  Trash2,
} from 'lucide-react';
const Project = ({
  setAddEdu,
  setEditEdu,
  setEditEduIndex,
  setDeleteEdu,
  setDeleteEduIndex,
  setAddProj,
  setEditProj,
  setEditProjIndex,
  setDeleteProj,
  setDeleteProjIndex,
  defaultValues, // THIS IS THE KEY ONE! IT CONTAINS THE DATA
  expandedIndex,
  toggleExpand,
}: any) => {
  return (
    <div>
      <div className="flex w-full items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            {/* FIXED: Icon is now FolderOpen */}
            <Package className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Projects</h3>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setAddProj(true);
            }}
            className="w-full flex items-center justify-center py-2 px-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            <PlusCircle className=" mr-2 h-5 w-5" />
            {/* FIXED: Button text is now correct */}
            Add Project
          </button>
          {/* <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-180" /> */}
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl p-6 border border-cyan-200">
        {/* REMOVED: Redundant header was here */}
        <div className="space-y-4">
          {defaultValues.project && defaultValues.project.length > 0 ? (
            defaultValues.projects?.map((proj, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <div
                  key={proj._id}
                  className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100"
                >
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleExpand(index)}
                  >
                    <div className="flex-1 pr-4">
                      <h4 className="text-lg font-bold text-gray-800">
                        {proj.name}
                      </h4>
                      {!isExpanded && (
                        <p className="text-gray-600 line-clamp-1 mt-1">
                          {proj.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        size="icon"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditProj(true);
                          setEditProjIndex(index);
                        }}
                        className="text-cyan-600 border-cyan-300 hover:bg-cyan-50 h-9 w-9"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        size="icon"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteProj(true);
                          setDeleteProjIndex(proj._id);
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50 h-9 w-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button variant="ghost" size="icon" className="h-9 w-9">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top duration-300">
                      <p className="text-gray-600 leading-relaxed">
                        {proj.description}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="whitespace-nowrap font-bold">
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
                            {proj.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className=" text-gray-500  italic">No data</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Project;
