'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ChevronDown,
  Plus,
  Settings,
  Users,
  Briefcase,
  Check,
  FolderTree,
  ChevronRight,
  Sparkles,
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
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '../ui/dropdown-menu';
import AddCompanyModal from './AddCompanyModal';
import Image from 'next/image';

interface CompanySwitcherProps {
  companies: any[];
  currentCompany: any;
}

export function CompanySwitcher({
  companies,
  currentCompany,
}: CompanySwitcherProps) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { switchCompany } = useMultiCompanyStore();

  // const handleSwitch = async (companyId: string) => {
  //   await switchCompany(companyId);
  // };
  const handleSwitch = async (companyId: string) => {
    await switchCompany(companyId);

    const company = companies.find((c) => c._id === companyId);
    if (company) {
      if (company.type === 'PARENT') {
        router.push('/dashboard/parent-dashboard');
      } else {
        router.push(`/dashboard/companies/${companyId}/dashboard`);
      }
    }
  };

  const parentCompany = companies.find(
    (c) => c.name === 'HappyTech' || c.type === 'PARENT',
  );

  const subsidiaries = companies.filter(
    (c) =>
      c.parentId === parentCompany?._id ||
      ['HelpStudy', 'Zobs', 'CodeLab'].includes(c.name),
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-gray-100 transition-all"
          >
            <div className="flex items-center gap-3">
              {currentCompany?.logo ? (
                <Image
                  src={currentCompany.logo}
                  alt={currentCompany.name}
                  className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                  width={32}
                  height={32}
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {currentCompany?.name || 'Select Company'}
                </p>
                <p className="text-xs text-gray-500">
                  {currentCompany?.type === 'PARENT'
                    ? 'Parent Company'
                    : 'Subsidiary'}
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-72 p-1.5">
          <div className="px-2 py-1.5 mb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Current Company
            </p>
            <div className="flex items-center gap-2 mt-1 p-1.5 bg-blue-50 rounded-lg border border-blue-100">
              {currentCompany?.logo ? (
                <Image
                  src={currentCompany.logo}
                  alt={currentCompany.name}
                  className="w-8 h-8 rounded-lg object-cover"
                  width={32}
                  height={32}
                />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {currentCompany?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {currentCompany?.industry || 'Technology'}
                </p>
              </div>
              <Check className="w-3 h-3 text-green-600 ml-auto" />
            </div>
          </div>

          <DropdownMenuSeparator className="my-1" />

          {parentCompany && (
            <>
              <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
                Switch Company
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => handleSwitch(parentCompany._id)}
                className="flex items-center gap-2 py-2 px-2 cursor-pointer hover:bg-gray-50 rounded-lg mb-1"
              >
                {parentCompany.logo ? (
                  <Image
                    src={parentCompany.logo}
                    alt={parentCompany.name}
                    className="w-6 h-6 rounded-lg object-cover"
                    width={24}
                    height={24}
                  />
                ) : (
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-3 h-3 text-purple-600" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {parentCompany.name}
                    </p>
                    <span className="text-[9px] bg-purple-100 text-purple-700 px-1 py-0.5 rounded-full font-medium">
                      Parent
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    All companies consolidated
                  </p>
                </div>
                {currentCompany?._id === parentCompany._id && (
                  <Check className="w-3 h-3 text-green-600" />
                )}
              </DropdownMenuItem>
            </>
          )}

          {subsidiaries.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mt-1">
                Subsidiaries
              </DropdownMenuLabel>

              {subsidiaries.map((sub) => (
                <DropdownMenuItem
                  key={sub._id}
                  onClick={() => handleSwitch(sub._id)}
                  className="flex items-center gap-2 py-2 px-2 cursor-pointer hover:bg-gray-50 rounded-lg mb-1"
                >
                  {sub.logo ? (
                    <Image
                      src={sub.logo}
                      alt={sub.name}
                      className="w-6 h-6 rounded-lg object-cover"
                      width={24}
                      height={24}
                    />
                  ) : (
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-3 h-3 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {sub.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sub.industry || 'Subsidiary'}
                    </p>
                  </div>
                  {currentCompany?._id === sub._id && (
                    <Check className="w-3 h-3 text-green-600" />
                  )}
                </DropdownMenuItem>
              ))}
            </>
          )}

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 py-2 px-2 cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
            >
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="w-3 h-3 text-blue-600" />
              </div>
              <span className="font-medium text-sm">Add New Company</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
