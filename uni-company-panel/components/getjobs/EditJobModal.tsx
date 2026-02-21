'use client';

import { useEffect, useState } from 'react';
import { useJobStore } from '@/store/job.store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Loader2,
  Plus,
  Trash2,
  Banknote,
  FileText,
  Briefcase,
  HelpCircle,
  Save,
  Pencil,
  MapPin,
} from 'lucide-react';
import QuillJs from '@/components/rich-text/QuillJs';

interface EditJobModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
}

export const EditJobModal = ({ job, isOpen, onClose }: EditJobModalProps) => {
  const { updateJobDescription } = useJobStore();
  const [isSaving, setIsSaving] = useState(false);

  const [draft, setDraft] = useState({
    title: '',
    description: '',
    responsibilities: '',
    qualifications: '',
    screeningQuestions: [] as any[],
    salary: { min: 0, max: 0, period: 'YEARLY' },
    remote: false,
    location: { city: '', state: '' },
    resumeRequired: false,
    jobTypes: [] as string[],
  });

  useEffect(() => {
    if (job && isOpen) {
      setDraft({
        title: job.title || '',
        description: job.description || '',
        responsibilities: job.responsibilities?.join('\n') || '',
        qualifications: job.qualifications?.join('\n') || '',
        screeningQuestions: job.screeningQuestions || [],
        salary: job.salary || { min: 0, max: 0, period: 'YEARLY' },
        remote: job.remote ?? false,
        location: job.location || { city: '', state: '' },
        resumeRequired: job.resumeRequired ?? false,
        jobTypes: job.jobTypes || [],
      });
    }
  }, [job, isOpen]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...draft,
        responsibilities: draft.responsibilities
          .split('\n')
          .filter((s) => s.trim()),
        qualifications: draft.qualifications
          .split('\n')
          .filter((s) => s.trim()),
      };

      const result = await updateJobDescription(job.id || job._id, payload);

      if (result !== false) {
        toast.success('Job updated successfully');
        onClose();
      }
    } catch (error) {
      toast.error('Failed to update job');
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = () => {
    setDraft((prev) => ({
      ...prev,
      screeningQuestions: [
        ...prev.screeningQuestions,
        { question: '', type: 'text', required: true },
      ],
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[650px] w-full flex flex-col p-0 border-l">
        <SheetHeader className="p-6 border-b bg-white sticky top-0 z-10">
          <SheetTitle className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <Pencil className="w-5 h-5" /> Edit Job Posting
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
          {/* 1. BASIC DETAILS */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Basic Details
            </h3>
            <div className="grid gap-4 p-4 border rounded-xl bg-gray-50/50">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">Job Title</Label>
                <Input
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold text-gray-700">
                    Job Type
                  </Label>
                  <select
                    className="w-full h-10 px-3 border rounded-md bg-white text-sm outline-none focus:ring-2 ring-blue-500"
                    value={draft.jobTypes[0] || ''}
                    onChange={(e) =>
                      setDraft({ ...draft, jobTypes: [e.target.value] })
                    }
                  >
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end space-y-3 pb-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remote-s"
                      checked={draft.remote}
                      onCheckedChange={(v) =>
                        setDraft({ ...draft, remote: !!v })
                      }
                    />
                    <Label htmlFor="remote-s" className="cursor-pointer">
                      Remote Work
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="resume-s"
                      checked={draft.resumeRequired}
                      onCheckedChange={(v) =>
                        setDraft({ ...draft, resumeRequired: !!v })
                      }
                    />
                    <Label htmlFor="resume-s" className="cursor-pointer">
                      Require Resume
                    </Label>
                  </div>
                </div>
              </div>

              {!draft.remote && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-2">
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">City</Label>
                    <Input
                      value={draft.location.city}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          location: { ...draft.location, city: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">State</Label>
                    <Input
                      value={draft.location.state}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          location: {
                            ...draft.location,
                            state: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 2. SALARY */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Banknote className="w-4 h-4" /> Salary Information
            </h3>
            <div className="grid grid-cols-3 gap-3 p-4 border rounded-xl bg-gray-50/50">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-gray-500">
                  Min
                </Label>
                <Input
                  type="number"
                  value={draft.salary.min}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      salary: { ...draft.salary, min: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-gray-500">
                  Max
                </Label>
                <Input
                  type="number"
                  value={draft.salary.max}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      salary: { ...draft.salary, max: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-gray-500">
                  Period
                </Label>
                <select
                  className="w-full h-10 px-3 border rounded-md bg-white text-sm outline-none focus:ring-2 ring-blue-500"
                  value={draft.salary.period}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      salary: { ...draft.salary, period: e.target.value },
                    })
                  }
                >
                  <option value="YEARLY">Yearly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
            </div>
          </section>

          {/* 3. DESCRIPTION */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Job Description
            </h3>
            <div className="min-h-[350px] border rounded-xl overflow-hidden shadow-sm bg-white">
              <QuillJs
                content={draft.description}
                onContentChange={(val) =>
                  setDraft({ ...draft, description: val })
                }
              />
            </div>
          </section>

          {/* 4. RESPONSIBILITIES & QUALIFICATIONS */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Requirements
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">
                  Responsibilities (One per line)
                </Label>
                <textarea
                  className="w-full h-32 p-3 border rounded-xl text-sm shadow-sm focus:ring-2 ring-blue-500 outline-none resize-none"
                  value={draft.responsibilities}
                  onChange={(e) =>
                    setDraft({ ...draft, responsibilities: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">
                  Qualifications (One per line)
                </Label>
                <textarea
                  className="w-full h-32 p-3 border rounded-xl text-sm shadow-sm focus:ring-2 ring-blue-500 outline-none resize-none"
                  value={draft.qualifications}
                  onChange={(e) =>
                    setDraft({ ...draft, qualifications: e.target.value })
                  }
                />
              </div>
            </div>
          </section>

          {/* 5. SCREENING QUESTIONS */}
          <section className="space-y-4 pb-10">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> Screening Questions
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addQuestion}
                className="text-blue-600 border-blue-200 h-8"
              >
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-3">
              {draft.screeningQuestions.map((q, i) => (
                <div
                  key={i}
                  className="p-4 border rounded-xl bg-gray-50/50 relative group"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 h-6 w-6 p-0"
                    onClick={() => {
                      const updated = draft.screeningQuestions.filter(
                        (_, idx) => idx !== i,
                      );
                      setDraft({ ...draft, screeningQuestions: updated });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <div className="space-y-3 pr-6">
                    <Input
                      placeholder="Question text"
                      value={q.question}
                      onChange={(e) => {
                        const updated = [...draft.screeningQuestions];
                        updated[i].question = e.target.value;
                        setDraft({ ...draft, screeningQuestions: updated });
                      }}
                    />
                    <div className="flex gap-4 items-center">
                      <select
                        className="border rounded-md px-2 py-1 text-xs bg-white h-8"
                        value={q.type}
                        onChange={(e) => {
                          const updated = [...draft.screeningQuestions];
                          updated[i].type = e.target.value;
                          setDraft({ ...draft, screeningQuestions: updated });
                        }}
                      >
                        <option value="text">Short Answer</option>
                        <option value="boolean">Yes/No</option>
                        <option value="number">Number</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`req-${i}`}
                          checked={q.required}
                          onCheckedChange={(v) => {
                            const updated = [...draft.screeningQuestions];
                            updated[i].required = !!v;
                            setDraft({ ...draft, screeningQuestions: updated });
                          }}
                        />
                        <Label
                          htmlFor={`req-${i}`}
                          className="text-xs cursor-pointer"
                        >
                          Required
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <SheetFooter className="p-6 border-t bg-gray-50/80 sticky bottom-0 z-10">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[180px] w-full sm:w-auto"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Update Posting
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
