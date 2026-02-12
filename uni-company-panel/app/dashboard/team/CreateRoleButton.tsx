'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

// Stores
import { useRBACStore } from '@/store/rbac.store';
import { useMultiCompanyStore } from '@/store/multi-company.store';

// Define the permissions available for selection
const AVAILABLE_PERMISSIONS = [
  {
    id: 'jobs:manage',
    label: 'Manage Jobs',
    desc: 'Create, edit, and delete job postings',
  },
  {
    id: 'candidates:view',
    label: 'View Candidates',
    desc: 'Access resumes and applicant info',
  },
  {
    id: 'team:manage',
    label: 'Manage Team',
    desc: 'Invite members and change roles',
  },
  {
    id: 'settings:edit',
    label: 'Org Settings',
    desc: 'Edit company profile and logo',
  },
];

export function CreateRoleButton() {
  const [open, setOpen] = React.useState(false);
  const { currentCompany } = useMultiCompanyStore();
  const { roles, createCustomRole, getAllCustomRoles } = useRBACStore();

  // Initialize Form
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      permissions: [] as string[],
      description: '',
    },
  });

  const onRoleSubmit = async (data: any) => {
    if (!currentCompany?._id) {
      return toast.error('No active organization found.');
    }

    try {
      await createCustomRole({
        ...data,
        orgId: currentCompany._id,
      });

      await getAllCustomRoles();

      console.log(roles);

      toast.success('Custom role created successfully!');
      reset(); // Clear the form
      setOpen(false); // Close the dialog
    } catch (error) {
      toast.error('Failed to create role. It might already exist.');
    }
  };

  useEffect(() => {
    getAllCustomRoles();
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Role
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create Custom Role</DialogTitle>
          <DialogDescription>
            Define a new set of permissions for members in **
            {currentCompany?.name}**.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onRoleSubmit)} className="space-y-6 py-2">
          {/* Role Name */}
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              placeholder="e.g. Senior Recruiter"
              {...register('name', { required: true })}
            />
          </div>

          {/* Permissions List */}
          <div className="space-y-3">
            <Label>Permissions</Label>
            <div className="grid gap-4 border rounded-lg p-4 max-h-[250px] overflow-y-auto bg-slate-50/50">
              {AVAILABLE_PERMISSIONS.map((perm) => (
                <div key={perm.id} className="flex items-start space-x-3">
                  <Controller
                    name="permissions"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id={perm.id}
                        checked={field.value?.includes(perm.id)}
                        onCheckedChange={(checked) => {
                          const updatedValue = checked
                            ? [...field.value, perm.id]
                            : field.value.filter((v: string) => v !== perm.id);
                          field.onChange(updatedValue);
                        }}
                      />
                    )}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={perm.id}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {perm.label}
                    </label>
                    <p className="text-xs text-muted-foreground">{perm.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Save Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
