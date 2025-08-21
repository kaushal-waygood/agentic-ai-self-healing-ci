import { Control, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { countries } from '@/lib/data/countries';
import { PlusCircle, Trash2 } from 'lucide-react';

interface CvEducationFormProps {
  control: Control<any>;
}

export const CvEducationForm = ({ control }: CvEducationFormProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education',
  });

  return (
    <div>
      <h3 className="text-lg font-medium mb-2 text-slate-200">
        Education <span className="text-red-400">*</span>
      </h3>
      {fields.map((field, index) => (
        <Card
          key={field.id}
          className="p-4 mt-2 mb-4 space-y-4 relative bg-slate-800/50 border-slate-700"
        >
          <FormField
            control={control}
            name={`education.${index}.institution`}
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Institution</FormLabel>
                <FormControl>
                  <Input {...f} value={f.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`education.${index}.degree`}
            render={({ field: f }) => (
              <FormItem>
                <FormLabel>Degree</FormLabel>
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
              name={`education.${index}.country`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={f.onChange} defaultValue={f.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`education.${index}.fieldOfStudy`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>Field of Study (Optional)</FormLabel>
                  <FormControl>
                    <Input {...f} value={f.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`education.${index}.startDate`}
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
              name={`education.${index}.endDate`}
              render={({ field: f }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="month" {...f} value={f.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
            institution: '',
            degree: '',
            country: '',
            startDate: '',
            endDate: '',
          })
        }
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Education
      </Button>
    </div>
  );
};
