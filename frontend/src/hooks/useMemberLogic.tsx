import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import {
  getAllOrganizationMemberRequest,
  deleteOrganizationMemberRequest,
  filterOrganizationMemberRequest,
  getAllOrgMembersUniqueDepartmentsRequest,
  getAllOrgMembersUniqueCourseRequest,
} from '@/redux/reducers/organizationsReducer';
import { RootState } from '@/redux/rootReducer';
import { UserProfile } from '@/lib/data/user';

export const useMemberLogic = (
  organizationId: string,
  planId: string,
  seatsAvailable: number,
) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const csvImportRef = useRef<HTMLInputElement>(null);

  // Redux Selectors
  const { members, departments, courses, loading } = useSelector(
    (state: RootState) => state.organizations,
  );

  // Local State
  const [filters, setFilters] = useState({
    fullName: '',
    email: '',
    department: 'all',
    course: 'all',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Initial Fetch
  useEffect(() => {
    dispatch(getAllOrganizationMemberRequest());
    dispatch(getAllOrgMembersUniqueDepartmentsRequest());
    dispatch(getAllOrgMembersUniqueCourseRequest());
  }, [dispatch]);

  // Debounced Filter Effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(
        filterOrganizationMemberRequest({
          fullName: filters.fullName,
          email: filters.email,
          department: filters.department !== 'all' ? filters.department : '',
          course: filters.course !== 'all' ? filters.course : '',
          limit: 10,
        }),
      );
    }, 300);
    return () => clearTimeout(timeout);
  }, [filters, dispatch]);

  // Actions
  const handleFilterChange = (field: string, value: string) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const handleDelete = (id: string) => {
    dispatch(deleteOrganizationMemberRequest({ id }));
    toast({ title: 'Member Deleted' });
    setSelectedIds((prev) => prev.filter((mid) => mid !== id));
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach((id) =>
      dispatch(deleteOrganizationMemberRequest({ id })),
    );
    toast({ title: `${selectedIds.length} members deleted.` });
    setSelectedIds([]);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? members.map((m) => m._id) : []);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // ... (Keep existing parsing logic here, simplified for brevity)
        // Ensure you dispatch addOrganizationMemberRequest actions here instead of mutating mocks directly
        toast({
          title: 'Import Processed',
          description: `Processed ${results.data.length} rows.`,
        });
        setIsImporting(false);
      },
      error: (err) => {
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: err.message,
        });
        setIsImporting(false);
      },
    });
    if (csvImportRef.current) csvImportRef.current.value = '';
  };

  return {
    members,
    departments,
    courses,
    filters,
    selectedIds,
    isImporting,
    csvImportRef,
    handleFilterChange,
    handleDelete,
    handleDeleteSelected,
    handleSelectAll,
    setSelectedIds,
    handleFileImport,
  };
};
