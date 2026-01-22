'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LucideIcon } from 'lucide-react';

interface ModalDetail {
  icon: LucideIcon;
  label: string;
  value: string | React.ReactNode;
}

interface CommonDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  badgeContent?: string | React.ReactNode; // e.g., Initials or an Icon
  details: ModalDetail[];
  sections?: React.ReactNode; // For custom content like "Documents" or "Bio"
  footerActions?: React.ReactNode; // For "Reject/Shortlist" or "Edit/Delete"
  headerClassName?: string;
}

export function CommonDetailsModal({
  open,
  onOpenChange,
  title,
  description,
  badgeContent,
  details,
  sections,
  footerActions,
  headerClassName = 'bg-indigo-600',
}: CommonDetailsModalProps) {
  const renderDetailItem = (icon: LucideIcon, label: string, value: any) => (
    <div className="flex items-start gap-3" key={label}>
      <div className="mt-0.5 p-2 rounded-md bg-slate-100 text-slate-500 shrink-0">
        {React.createElement(icon, { size: 16 })}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider truncate">
          {label}
        </p>
        <div className="text-sm font-semibold text-slate-700 break-words">
          {value || 'N/A'}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] gap-0 p-0 overflow-hidden outline-none">
        {/* Header Section */}
        <div className={`${headerClassName} p-6 text-white`}>
          <DialogHeader>
            <div className="flex items-center gap-4 text-left">
              {badgeContent && (
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
                  {badgeContent}
                </div>
              )}
              <div className="min-w-0">
                <DialogTitle className="text-2xl text-white truncate">
                  {title}
                </DialogTitle>
                {description && (
                  <DialogDescription className="text-white/80 line-clamp-1">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Main Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {details.map((item) =>
              renderDetailItem(item.icon, item.label, item.value),
            )}
          </div>

          {/* Custom Sections (Optional) */}
          {sections && (
            <>
              <Separator className="bg-slate-100" />
              <div className="space-y-4">{sections}</div>
            </>
          )}
        </div>

        {/* Footer Section */}
        <DialogFooter className="p-4 bg-slate-50 border-t flex sm:justify-between items-center gap-2">
          <div className="flex gap-2 items-center">{footerActions}</div>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
