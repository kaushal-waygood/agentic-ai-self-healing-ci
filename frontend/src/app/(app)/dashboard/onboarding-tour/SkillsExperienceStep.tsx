// src/app/(app)/dashboard/onboarding-tour/SkillsExperienceStep.tsx

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, XCircle } from 'lucide-react';

// Define Prop Types
type SkillEntry = { skill: string; level: string };
type ExperienceEntry = {
  company: string;
  title: string;
  duration: string;
  description: string;
};

// ✅ FIX: Update the props interface to accept individual props
interface SkillsExperienceStepProps {
  skills: SkillEntry[];
  experience: ExperienceEntry[];
  onSkillChange: (
    index: number,
    field: keyof SkillEntry,
    value: string,
  ) => void;
  onAddSkill: () => void;
  onRemoveSkill: (index: number) => void;
  onExperienceChange: (
    index: number,
    field: keyof ExperienceEntry,
    value: string,
  ) => void;
  onAddExperience: () => void;
  onRemoveExperience: (index: number) => void;
}

const SkillsExperienceStep: React.FC<SkillsExperienceStepProps> = ({
  skills,
  experience,
  onSkillChange,
  onAddSkill,
  onRemoveSkill,
  onExperienceChange,
  onAddExperience,
  onRemoveExperience,
}) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Your Skills
        </h3>
        <div className="space-y-3">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border-2 border-gray-100 rounded-xl bg-white/60"
            >
              <Input
                value={skill.skill}
                onChange={(e) => onSkillChange(index, 'skill', e.target.value)}
                placeholder="e.g., JavaScript"
                className="h-11 text-base focus:border-purple-500"
              />
              <Select
                value={skill.level}
                onValueChange={(value) => onSkillChange(index, 'level', value)}
              >
                <SelectTrigger className="w-[180px] h-11 focus:border-purple-500">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="EXPERT">Expert</SelectItem>
                </SelectContent>
              </Select>
              {/* ✅ FIX: Use the 'skills' prop directly */}
              {skills.length > 1 && (
                <Button
                  type="button"
                  onClick={() => onRemoveSkill(index)}
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:bg-red-100 rounded-full"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          onClick={onAddSkill}
          variant="outline"
          className="w-full mt-4 h-12 border-dashed"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Add Skill
        </Button>
      </div>

      {/* Experience Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Work Experience
        </h3>
        <div className="space-y-4">
          {/* ✅ FIX: Use the 'experience' prop directly */}
          {experience.map((exp, index) => (
            <div
              key={index}
              className="space-y-3 p-4 border-2 border-purple-100 rounded-xl relative bg-white/60"
            >
              {/* ✅ FIX: Use the 'experience' prop directly */}
              {experience.length > 1 && (
                <Button
                  type="button"
                  onClick={() => onRemoveExperience(index)}
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-red-500 hover:bg-red-100 rounded-full h-8 w-8"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              )}
              <Input
                value={exp.company}
                onChange={(e) =>
                  onExperienceChange(index, 'company', e.target.value)
                }
                placeholder="Company Name"
                className="h-11"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={exp.title}
                  onChange={(e) =>
                    onExperienceChange(index, 'title', e.target.value)
                  }
                  placeholder="Job Title"
                  className="h-11"
                />
                <Input
                  value={exp.duration}
                  onChange={(e) =>
                    onExperienceChange(index, 'duration', e.target.value)
                  }
                  placeholder="e.g., Jan 2022 - Present"
                  className="h-11"
                />
              </div>
              <Textarea
                value={exp.description}
                onChange={(e) =>
                  onExperienceChange(index, 'description', e.target.value)
                }
                placeholder="Describe your role and accomplishments..."
                className="h-20"
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          onClick={onAddExperience}
          variant="outline"
          className="w-full mt-4 h-12 border-dashed"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Add Experience
        </Button>
      </div>
    </div>
  );
};
export default SkillsExperienceStep;
