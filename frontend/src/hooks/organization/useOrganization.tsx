// hooks/organization/useOrganization.ts
import { useOrganizationMembers } from './useOrganizationMembers';
import { useOrganizationJobs } from './useOrganizationJobs';
import { useOrganizationApi } from './useOrganizationApi';
import { UserProfile } from '@/lib/data/user';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  addOrganizationMemberRequest,
  editOrganizationMemberRequest,
  filterOrganizationMemberRequest,
} from '@/redux/reducers/organizationsReducer';
import { useToast } from '../use-toast';
import { z } from 'zod';

const memberFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.'),
  role: z.enum(['admin', 'member']),
  department: z.string().optional(),
  course: z.string().optional(),
});
type MemberFormValues = z.infer<typeof memberFormSchema>;

export const useOrganization = ({
  organization,
  initialMembers = [],
  initialJobs = [],
}: {
  organization: any;
  initialMembers?: any[];
  initialJobs?: any[];
}) => {
  const {
    // Members
    members,
    membersList,
    uniqueDepartments,
    uniqueCourses,
    loading,
    error,
    searchTerm,
    selectedDepartment,
    selectedCourse,
    selectedIds,
    isImporting,
    setSearchTerm,
    setSelectedDepartment,
    setSelectedCourse,
    setSelectedIds,
    handleMemberSubmit,
    handleDeleteMember,
    handleFileImport,
    memberForm,
    csvImportRef,
  } = useOrganizationMembers();

  const {
    // Jobs
    jobs,
    isPostJobOpen,
    setIsPostJobOpen,
    jobForm,
    handleJobSubmit,
  } = useOrganizationJobs(initialJobs);

  const {
    // API
    apiKey,
    generateApiKey,
    copyApiKey,
  } = useOrganizationApi(organization.apiKey);

  const { toast } = useToast();

  const [editingMember, setEditingMember] = useState<UserProfile | null>(null);
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const dispatch = useDispatch();

  const isPendingVerification =
    organization.isEmailVerified === 'pending_verification';
  const seatsUsed = members?.length || 0;
  const seatsAvailable = organization.seats - seatsUsed;
  const seatLimitReached = seatsAvailable <= 0;

  const onMemberSubmit = async (values: MemberFormValues) => {
    try {
      if (editingMember) {
        // Edit existing member
        dispatch(
          editOrganizationMemberRequest({
            id: editingMember._id,
            updates: values,
          }),
        );

        toast({
          title: 'Member Updated',
          description: `${values.fullName}'s details have been saved.`,
        });
      } else {
        // Add new member
        dispatch(addOrganizationMemberRequest(values));

        toast({
          title: 'Member Added Successfully',
          description: `${values.fullName} can now log in with the password 'Student@123'.`,
        });
      }

      setIsEditMemberOpen(false);
      setIsAddMemberOpen(false);
      setEditingMember(null);
      memberForm.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while saving member details.',
      });
    }
  };

  const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setSearchTerm(e.target.value); // Update the state with the new value

      dispatch(
        filterOrganizationMemberRequest({
          searchTerm: e.target.value,
          department: selectedDepartment,
          role: selectedRole,
        }),
      );
    } catch (error) {
      console.error('Error handling filter:', error);
    }
  };

  return {
    // Organization info
    organization,
    isPendingVerification,
    seatsUsed,
    seatsAvailable,
    seatLimitReached,

    // Members
    members,
    uniqueDepartments,
    uniqueCourses,
    loading,
    error,
    searchTerm,
    selectedDepartment,
    selectedCourse,
    selectedIds,
    isImporting,
    setSearchTerm,
    setSelectedDepartment,
    setSelectedCourse,
    setSelectedIds,
    handleMemberSubmit,
    handleDeleteMember,
    handleFileImport,
    memberForm,
    csvImportRef,

    // Jobs
    jobs,
    isPostJobOpen,
    setIsPostJobOpen,
    jobForm,
    handleJobSubmit,

    // API
    apiKey,
    generateApiKey,
    copyApiKey,

    onMemberSubmit,
    isEditMemberOpen,
    setIsEditMemberOpen,
    isAddMemberOpen,
    setIsAddMemberOpen,
    editingMember,
    setEditingMember,
  };
};
