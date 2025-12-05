'use client';

import React from 'react';
import { membersType } from './organization-client';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from '../ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/input';
import { DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  addOrganizationMemberRequest,
  editOrganizationMemberRequest,
} from '@/redux/reducers/organizationsReducer';
import { useDispatch } from 'react-redux';
import { X } from 'lucide-react';

type PropMemberType = {
  onClose: () => void;
  member?: membersType;
  op: 'edit' | 'add';
};

const memberFormSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  role: z.enum(['hr']),
  _id: z.string(),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

const UpdateMemberForm = ({ onClose, member, op }: PropMemberType) => {
  const dispatch = useDispatch();

  const memberForm = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      email: member?.email || '',
      role: member?.role || 'member',
      _id: member?._id || '',
    },
  });

  const onSubmit = (values: MemberFormValues) => {
    if (op === 'edit') {
      dispatch(
        editOrganizationMemberRequest({
          id: values._id,
          updates: values,
        }),
      );
    } else {
      dispatch(
        addOrganizationMemberRequest({
          ...values,
        }),
      );
    }

    onClose();
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-xl p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {op === 'edit' ? 'Edit' : 'Add'} Member
        </h2>
        <button onClick={onClose} className="text-sm text-blue-600 underline">
          Close
        </button>
      </div>

      <Form {...memberForm}>
        <form
          className="space-y-4"
          onSubmit={memberForm.handleSubmit(onSubmit)}
        >
          {op === 'add' && (
            <FormField
              control={memberForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      placeholder="Enter Your Emails"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={memberForm.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="submit"
              disabled={!memberForm.formState.isValid}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
};

export const UpdateJobStatus = ({ onClose }: { onClose: () => boolean }) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-xl p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Update Job Status</h2>
        <button onClick={onClose} className="text-sm text-blue-600 underline">
          <X className="w-4 h-4" />
        </button>
      </div>

      <Form>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <FormField
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Status</FormLabel>
                <Select
                  onValueChange={handleStatusChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
};

export default UpdateMemberForm;
