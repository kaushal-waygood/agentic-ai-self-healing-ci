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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2 } from 'lucide-react';

interface CvProjectsFormProps {
  control: Control<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

export const CvProjectsForm = ({
  control,
  watch,
  setValue,
}: CvProjectsFormProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'projects',
  });

  return (
    <div>
      <h3 className="text-lg font-medium mb-2 text-slate-200">
        Projects / Research Work
      </h3>
      {fields.map((field, index) => (
        <Card
          key={field.id}
          className="p-4 mt-2 mb-4 space-y-4 relative bg-slate-800/50 border-slate-700"
        >
          <FormField
            control={control}
            name={`projects.${index}.name`}
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., AI-Powered Chatbot" {...f} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`projects.${index}.description`}
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your project, its goals, and your role."
                    {...f}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`projects.${index}.startDate`}
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
              name={`projects.${index}.endDate`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input
                      type="month"
                      {...f}
                      value={f.value ?? ''}
                      disabled={watch(`projects.${index}.isCurrent`)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={control}
            name={`projects.${index}.isCurrent`}
            render={({ field: f }) => (
              <FormItem className="flex flex-row items-center space-x-3 pt-2">
                <FormControl>
                  <Checkbox
                    checked={f.value}
                    onCheckedChange={(checked) => {
                      f.onChange(checked);
                      setValue(`projects.${index}.endDate`, '');
                    }}
                  />
                </FormControl>
                <FormLabel className="font-normal text-slate-300">
                  I'm currently working on this
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`projects.${index}.technologies`}
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Technologies Used (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., React, Python, TensorFlow"
                    {...f}
                    value={f.value ?? ''}
                  />
                </FormControl>
                <FormDescription>
                  Comma-separated list of technologies.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`projects.${index}.link`}
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Project Link (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://github.com/user/project"
                    {...f}
                    value={f.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => remove(index)}
            className="absolute top-2 right-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="bg-transparent border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
        onClick={() => append({ name: '', description: '' })}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Project
      </Button>
    </div>
  );
};
