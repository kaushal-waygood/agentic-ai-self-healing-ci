import {
  Control,
  UseFormSetValue,
  UseFormWatch,
  useFieldArray,
} from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';

interface CvExperienceFormProps {
  control: Control<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export const CvExperienceForm = ({
  control,
  watch,
  setValue,
}: CvExperienceFormProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience',
  });

  return (
    <div>
      <h3 className="text-lg font-medium mb-2 text-slate-200">
        Work Experience <span className="text-red-400">*</span>
      </h3>
      {fields.map((field, index) => (
        <Card
          key={field.id}
          className="p-4 mt-2 mb-4 space-y-4 relative bg-slate-800/50 border-slate-700"
        >
          <FormField
            control={control}
            name={`experience.${index}.company`}
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input {...f} value={f.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`experience.${index}.jobTitle`}
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input {...f} value={f.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`experience.${index}.startDate`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="month" {...f} value={f.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`experience.${index}.endDate`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input
                      type="month"
                      {...f}
                      value={f.value ?? ''}
                      disabled={watch(`experience.${index}.isCurrent`)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name={`experience.${index}.isCurrent`}
            render={({ field: f }) => (
              <FormItem className="flex flex-row items-center space-x-3 pt-2">
                <FormControl>
                  <Checkbox
                    checked={f.value}
                    onCheckedChange={(checked) => {
                      f.onChange(checked);
                      setValue(`experience.${index}.endDate`, '');
                    }}
                  />
                </FormControl>
                <FormLabel className="font-normal text-slate-300">
                  I currently work here
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`experience.${index}.responsibilities`}
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Responsibilities (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe key responsibilities and achievements. Use separate lines for each point."
                    {...f}
                    value={f.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {fields.length > 1 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => remove(index)}
              className="absolute top-2 right-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="bg-transparent border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
        onClick={() =>
          append({
            company: '',
            jobTitle: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
          })
        }
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
      </Button>
    </div>
  );
};
