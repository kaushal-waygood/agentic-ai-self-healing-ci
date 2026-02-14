'use client';

import { useMultiCompanyStore } from '@/store/multi-company.store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';

export const useCompanies = () => {
  const router = useRouter();
  const { companies, getCompanies, deleteCompany, loading } =
    useMultiCompanyStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    getCompanies();
  }, []);

  const handleDelete = async (companyId: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      await deleteCompany(companyId);
    }
  };

  const handleViewDetails = (companyId: string) => {
    router.push(`/dashboard/companies/${companyId}`);
  };

  return {
    companies,
    getCompanies,
    deleteCompany,
    loading,
    isAddModalOpen,
    setIsAddModalOpen,
    handleDelete,
    handleViewDetails,
  };
};
