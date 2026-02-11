'use client';

import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  Plus,
  Settings,
  Users,
  Briefcase,
  Check,
} from 'lucide-react';
import { useMultiCompanyStore } from '@/store/multi-company.store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
 } from '../ui/dropdown-menu';
import AddCompanyModal from './AddCompanyModal';

interface CompanySwitcherProps {
  companies: any[];
  currentCompany: any;
}

export function CompanySwitcher({ companies, currentCompany }: CompanySwitcherProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { switchCompany } = useMultiCompanyStore();

  const handleSwitch = async (companyId: string) => {
    await switchCompany(companyId);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-3 py-2 h-auto border-gray-300 bg-white hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              {currentCompany?.logo ? (
                <img
                  src={currentCompany.logo}
                  alt={currentCompany.name}
                  className="w-6 h-6 rounded object-cover"
                />
              ) : (
                <Building2 className="w-5 h-5 text-gray-600" />
              )}
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                  {currentCompany?.name || 'Select Company'}
                </p>
                <p className="text-xs text-gray-500">
                  {companies.length} company{companies.length !== 1 ? 'ies' : ''}
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
            YOUR COMPANIES
          </DropdownMenuLabel>
          
          {companies.map((company) => (
            <DropdownMenuItem
              key={company._id}
              onClick={() => handleSwitch(company._id)}
              className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{company.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Briefcase className="w-3 h-3" />
                    <span>{company.jobCount || 0} jobs</span>
                    <Users className="w-3 h-3 ml-2" />
                    <span>{company.memberCount || 0} members</span>
                  </div>
                </div>
              </div>
              {currentCompany?._id === company._id && (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 py-2 cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Add New Company</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer text-gray-600 hover:bg-gray-50">
            <Settings className="w-4 h-4" />
            <span>Company Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}