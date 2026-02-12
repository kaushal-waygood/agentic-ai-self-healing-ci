'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { INDUSTRY_OPTIONS } from '@/constants/companyData';
import { useMultiCompanyStore } from '@/store/multi-company.store';
import { toast } from 'sonner';
import { Upload, Building2, X, MapPin, Mail, Phone, Info } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCompanyModal({
  isOpen,
  onClose,
}: AddCompanyModalProps) {
  const { createCompany, loading } = useMultiCompanyStore();
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    contactEmail: '',
    contactPhone: '',
    description: '',
    address: { country: 'IN', state: '', city: '' },
    logo: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await createCompany(formData);
      if (success) {
        toast.success('Company created successfully!');
        onClose();
        // Reset logic...
      }
    } catch (error) {
      toast.error('Failed to create company');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData({ ...formData, logo: file });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="sm:max-w-[450px] w-full flex flex-col p-0 gap-0"
      >
        <SheetHeader className="p-6 border-b bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-xl">Add New Company</SheetTitle>
              <SheetDescription>
                Set up a new sub-entity profile.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* 1. Identity Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Info className="w-4 h-4 text-blue-500" />
                Company Identity
              </div>

              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors group relative">
                {formData.logo ? (
                  <div className="relative group">
                    <Image
                      src={URL.createObjectURL(formData.logo)}
                      alt="Preview"
                      className="w-24 h-24 rounded-2xl object-cover shadow-md border-4 border-white"
                      width={96}
                      height={96}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: null })}
                      className="absolute -top-2 -right-2 bg-white shadow-sm border rounded-full p-1.5 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center">
                    <div className="p-3 bg-white rounded-full shadow-sm border mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                      Upload Logo
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-xs font-bold uppercase tracking-wider text-gray-500"
                  >
                    Company Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Acme Corp"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="industry"
                    className="text-xs font-bold uppercase tracking-wider text-gray-500"
                  >
                    Industry *
                  </Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) =>
                      setFormData({ ...formData, industry: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <Separator />

            {/* 2. Contact Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Mail className="w-4 h-4 text-blue-500" />
                Communication
              </div>
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="contactEmail"
                    className="text-xs font-bold uppercase tracking-wider text-gray-500"
                  >
                    Work Email *
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    placeholder="hr@company.com"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="contactPhone"
                    className="text-xs font-bold uppercase tracking-wider text-gray-500"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    placeholder="+1 (555) 000-0000"
                    className="h-11"
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* 3. Location Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MapPin className="w-4 h-4 text-blue-500" />
                Primary Office
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label
                    htmlFor="country"
                    className="text-xs font-bold uppercase tracking-wider text-gray-500"
                  >
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    readOnly
                    className="bg-gray-50 h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="state"
                    className="text-xs font-bold uppercase tracking-wider text-gray-500"
                  >
                    State
                  </Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value },
                      })
                    }
                    placeholder="State"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="city"
                    className="text-xs font-bold uppercase tracking-wider text-gray-500"
                  >
                    City
                  </Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                    placeholder="City"
                    className="h-11"
                  />
                </div>
              </div>
            </section>
          </div>
        </form>

        <SheetFooter className="p-6 border-t bg-white">
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create Company'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
