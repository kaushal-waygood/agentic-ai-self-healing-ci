'use client';

import { useEffect, useState } from 'react';
import { useJobStore } from '@/store/job.store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  MapPin,
  FileText,
  Save,
  HelpCircle,
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
        remote: job.remote || false,
        location: job.location || { city: '', state: '' },
        resumeRequired: job.resumeRequired || false,
      });
    }
  }, [job, isOpen]);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const payload = {
        title: draft.title,
        description: draft.description,
        responsibilities: draft.responsibilities
          .split('\n')
          .filter((s) => s.trim()),
        qualifications: draft.qualifications
          .split('\n')
          .filter((s) => s.trim()),
        screeningQuestions: draft.screeningQuestions,
        salary: draft.salary,
        remote: draft.remote,
        location: draft.location,
        resumeRequired: draft.resumeRequired,
      };

      console.log('payload', payload);

      const success = await updateJobDescription(job._id, payload);
      console.log('success', success);
      if (success) {
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
        { question: '', type: 'SHORT_ANSWER', required: true },
      ],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl  w-[90vw] sm:max-w-[90vw] lg:max-w-[1200px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-2xl font-bold text-blue-600">
            Edit Job Posting
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-10 pb-6">
            {/* 1. BASIC DETAILS & LOCATION */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <MapPin className="w-5 h-5 text-blue-500" /> Basic Details &
                Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-xl bg-gray-50/30">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-gray-500">
                    Job Title
                  </Label>
                  <Input
                    value={draft.title}
                    onChange={(e) =>
                      setDraft({ ...draft, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-gray-500">
                    Settings
                  </Label>
                  <div className="flex gap-6 pt-2">
                    {/* <div className="flex items-center gap-2">
                      <Checkbox
                        id="remote"
                        checked={draft.remote}
                        onCheckedChange={(v) =>
                          setDraft({ ...draft, remote: !!v })
                        }
                      />
                      <Label
                        htmlFor="remote"
                        className="font-medium cursor-pointer"
                      >
                        Remote Work
                      </Label>
                    </div> */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="resume"
                        checked={draft.resumeRequired}
                        onCheckedChange={(v) =>
                          setDraft({ ...draft, resumeRequired: !!v })
                        }
                      />
                      <Label
                        htmlFor="resume"
                        className="font-medium cursor-pointer"
                      >
                        Require Resume
                      </Label>
                    </div>
                  </div>
                </div>
                {!draft.remote && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-gray-500">
                        City
                      </Label>
                      <Input
                        value={draft.location.city}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            location: {
                              ...draft.location,
                              city: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase font-bold text-gray-500">
                        State
                      </Label>
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
                  </>
                )}
              </div>
            </section>

            {/* 2. SALARY DETAILS */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <Banknote className="w-5 h-5 text-blue-500" /> Salary
                Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-xl bg-gray-50/30">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-gray-500">
                    Min Salary
                  </Label>
                  <Input
                    type="number"
                    value={draft.salary.min}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        salary: {
                          ...draft.salary,
                          min: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-gray-500">
                    Max Salary
                  </Label>
                  <Input
                    type="number"
                    value={draft.salary.max}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        salary: {
                          ...draft.salary,
                          max: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-gray-500">
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
                    <option value="HOURLY">Hourly</option>
                  </select>
                </div>
              </div>
            </section>

            {/* 3. DESCRIPTION */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <FileText className="w-5 h-5 text-blue-500" /> Job Description
              </h3>
              <div className="min-h-[350px] border rounded-xl overflow-hidden shadow-sm">
                <QuillJs
                  content={draft.description}
                  onContentChange={(val) =>
                    setDraft({ ...draft, description: val })
                  }
                />
              </div>
            </section>

            {/* 4. REQUIREMENTS & QUALIFICATIONS */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                <Plus className="w-5 h-5 text-blue-500" /> Requirements & Lists
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-gray-400">
                    Responsibilities (One per line)
                  </Label>
                  <textarea
                    className="w-full h-48 p-3 border rounded-xl text-sm shadow-sm"
                    value={draft.responsibilities}
                    onChange={(e) =>
                      setDraft({ ...draft, responsibilities: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-gray-400">
                    Qualifications (One per line)
                  </Label>
                  <textarea
                    className="w-full h-48 p-3 border rounded-xl text-sm shadow-sm"
                    value={draft.qualifications}
                    onChange={(e) =>
                      setDraft({ ...draft, qualifications: e.target.value })
                    }
                  />
                </div>
              </div>
            </section>

            {/* 5. SCREENING QUESTIONS */}
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                  <HelpCircle className="w-5 h-5 text-blue-500" /> Screening
                  Questions
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addQuestion}
                  className="text-blue-600 border-blue-200"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Question
                </Button>
              </div>
              <div className="grid gap-4">
                {draft.screeningQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="p-4 border rounded-xl bg-gray-50/50 relative group transition-all hover:border-blue-200"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      onClick={() => {
                        const updated = draft.screeningQuestions.filter(
                          (_, idx) => idx !== i,
                        );
                        setDraft({ ...draft, screeningQuestions: updated });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid gap-4 w-[95%]">
                      <Input
                        placeholder="Enter your question here..."
                        value={q.question}
                        onChange={(e) => {
                          const updated = [...draft.screeningQuestions];
                          updated[i].question = e.target.value;
                          setDraft({ ...draft, screeningQuestions: updated });
                        }}
                      />
                      <div className="flex gap-4 items-center">
                        <select
                          className="border rounded-md px-2 py-1 text-sm bg-white"
                          value={q.type}
                          onChange={(e) => {
                            const updated = [...draft.screeningQuestions];
                            updated[i].type = e.target.value;
                            setDraft({ ...draft, screeningQuestions: updated });
                          }}
                        >
                          <option value="SHORT_ANSWER">Short Answer</option>
                          <option value="YES_NO">Yes/No</option>
                          <option value="NUMBER">Number</option>
                        </select>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`req-${i}`}
                            checked={q.required}
                            onCheckedChange={(v) => {
                              const updated = [...draft.screeningQuestions];
                              updated[i].required = !!v;
                              setDraft({
                                ...draft,
                                screeningQuestions: updated,
                              });
                            }}
                          />
                          <Label
                            htmlFor={`req-${i}`}
                            className="text-xs font-medium cursor-pointer"
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
        </div>

        <DialogFooter className="p-6 border-t bg-gray-50/80">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Update Job Posting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
