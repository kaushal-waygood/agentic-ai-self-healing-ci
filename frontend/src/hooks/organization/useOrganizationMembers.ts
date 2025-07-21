// hooks/organization/useOrganizationMembers.ts
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/rootReducer';
import {
  addOrganizationMemberRequest,
  deleteOrganizationMemberRequest,
  editOrganizationMemberRequest,
  filterOrganizationMemberRequest,
  getAllOrganizationMemberRequest,
  getAllOrgMembersUniqueCourseRequest,
  getAllOrgMembersUniqueDepartmentsRequest,
} from '@/redux/reducers/organizationsReducer';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const memberFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.'),
  role: z.enum(['admin', 'member']),
  department: z.string().optional(),
  course: z.string().optional(),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;

export const useOrganizationMembers = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();

  // Redux state
  const {
    members: membersList,
    departments: uniqueDepartments,
    courses: uniqueCourses,
    loading,
    error,
  } = useSelector((state: RootState) => state.organizations);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const csvImportRef = useRef<HTMLInputElement>(null);

  // Form handling
  const memberForm = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      role: 'member',
      department: '',
      course: '',
    },
  });

  // Filtered members
  const filteredMembers = useMemo(() => {
    if (!membersList) return [];
    return membersList.filter((member) => {
      const searchMatch =
        searchTerm === '' ||
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const departmentMatch =
        selectedDepartment === 'all' ||
        member.department === selectedDepartment;
      const courseMatch =
        selectedCourse === 'all' || member.course === selectedCourse;
      return searchMatch && departmentMatch && courseMatch;
    });
  }, [membersList, searchTerm, selectedDepartment, selectedCourse]);

  // Fetch data on mount
  useEffect(() => {
    dispatch(getAllOrganizationMemberRequest());
    dispatch(getAllOrgMembersUniqueDepartmentsRequest());
    dispatch(getAllOrgMembersUniqueCourseRequest());
  }, [dispatch]);

  // Handle member submission
  const handleMemberSubmit = async (values: MemberFormValues) => {
    try {
      if (values.id) {
        // Edit existing member
        dispatch(
          editOrganizationMemberRequest({
            id: values.id,
            updates: values,
          }),
        );
        toast({ title: 'Member Updated' });
      } else {
        // Add new member
        dispatch(addOrganizationMemberRequest(values));
        toast({ title: 'Member Added Successfully' });
      }
      memberForm.reset();
      return true;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save member',
      });
      return false;
    }
  };

  // Handle member deletion
  const handleDeleteMember = (memberId: string) => {
    try {
      dispatch(deleteOrganizationMemberRequest({ id: memberId }));
      toast({ title: 'Member Deleted' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Failed to delete member',
      });
    }
  };

  // Handle CSV import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validMembers = results.data
          .map((row: any) => {
            const result = memberFormSchema.safeParse(row);
            return result.success ? result.data : null;
          })
          .filter(Boolean);

        if (validMembers.length > 0) {
          validMembers.forEach((member: MemberFormValues) => {
            dispatch(addOrganizationMemberRequest(member));
          });
          toast({
            title: 'Import Complete',
            description: `${validMembers.length} members imported`,
          });
        }
        setIsImporting(false);
      },
      error: (error) => {
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: error.message,
        });
        setIsImporting(false);
      },
    });
  };

  return {
    // State
    membersList,
    members: filteredMembers,
    uniqueDepartments,
    uniqueCourses,
    loading,
    error,
    searchTerm,
    selectedDepartment,
    selectedCourse,
    selectedIds,
    isImporting,

    // Handlers
    setSearchTerm,
    setSelectedDepartment,
    setSelectedCourse,
    setSelectedIds,
    handleMemberSubmit,
    handleDeleteMember,
    handleFileImport,
    memberForm,
    csvImportRef,
  };
};
