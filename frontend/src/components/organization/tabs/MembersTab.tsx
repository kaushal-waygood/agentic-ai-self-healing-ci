'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  UserPlus,
  Upload,
  Trash2,
  MoreHorizontal,
  Edit,
  Users,
  ShieldCheck,
  Crown,
  AlertTriangle,
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import UpdateMemberForm from '../UpdateMemberForm';
import { useMemberLogic } from '@/hooks/useMemberLogic';
import type { UserProfile } from '@/lib/data/user';

interface MembersTabProps {
  seatsAvailable: number;
  isPendingVerification: boolean;
  organizationId: string;
  planId: string;
}

export default function MembersTab({
  seatsAvailable,
  isPendingVerification,
  organizationId,
  planId,
}: MembersTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<UserProfile | null>(null);

  const {
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
  } = useMemberLogic(organizationId, planId, seatsAvailable);

  const seatLimitReached = seatsAvailable <= 0;

  const THEME = {
    glassCard:
      'bg-white/90 backdrop-blur-xl border-0 shadow-2xl shadow-purple-500/10',
    gradientText:
      'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent',
    gradientBtn:
      'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30 border-0',
    inputFocus:
      'focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:border-transparent transition-all duration-300',
    hoverRow:
      'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-colors duration-200',
  };

  return (
    <>
      <Card className={`${THEME.glassCard} overflow-hidden`}>
        <CardHeader className="space-y-4 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle
                  className={`text-2xl font-bold tracking-tight ${THEME.gradientText}`}
                >
                  Member Management
                </CardTitle>
              </div>
              <CardDescription className="text-gray-500 ml-1">
                Invite and manage organization members, roles, and access.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">
                  Total:
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {members.length}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 w-full gap-3 rounded-xl border border-gray-100 bg-white/50 p-4 sm:grid-cols-2 lg:grid-cols-4 shadow-sm">
            <Input
              placeholder="Search by name..."
              className={`bg-white border-gray-200 ${THEME.inputFocus}`}
              value={filters.fullName}
              onChange={(e) => handleFilterChange('fullName', e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                className={`${THEME.gradientBtn} transition-all duration-300 transform hover:scale-105`}
                disabled={seatLimitReached || isPendingVerification}
                onClick={() => setIsAddOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" /> Add Member
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="bg-white border-gray-200 hover:bg-gray-50 hover:text-purple-600 transition-colors"
                onClick={() => csvImportRef.current?.click()}
                disabled={
                  isImporting || seatLimitReached || isPendingVerification
                }
              >
                <Upload className="mr-2 h-4 w-4" /> Import CSV
              </Button>
              <input
                type="file"
                ref={csvImportRef}
                onChange={handleFileImport}
                className="hidden"
                accept=".csv"
              />
            </div>

            {selectedIds.length > 0 && (
              <Button
                size="sm"
                variant="destructive"
                className="shadow-lg shadow-red-500/20"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedIds.length}
                )
              </Button>
            )}
          </div>

          {seatLimitReached && !isPendingVerification && (
            <Alert
              variant="destructive"
              className="mt-4 bg-red-50 border-red-100 text-red-900"
            >
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-sm font-bold text-red-800">
                Seat limit reached
              </AlertTitle>
              <AlertDescription className="text-xs sm:text-sm text-red-700">
                You&apos;ve used all available seats.{' '}
                <Link
                  href="/subscriptions"
                  className="font-bold underline hover:text-red-950"
                >
                  Upgrade your plan
                </Link>{' '}
                to add more members.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      className="border-gray-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      checked={
                        members.length > 0 &&
                        selectedIds.length === members.length
                      }
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                    />
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Role
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Status
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-600">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow
                    key={member._id}
                    data-state={
                      selectedIds.includes(member._id) ? 'selected' : ''
                    }
                    className={`${THEME.hoverRow} border-gray-100 cursor-pointer group`}
                  >
                    <TableCell>
                      <Checkbox
                        className="border-gray-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                        checked={selectedIds.includes(member._id)}
                        onCheckedChange={(checked) => {
                          setSelectedIds((prev) =>
                            checked
                              ? [...prev, member._id]
                              : prev.filter((id) => id !== member._id),
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-xs font-bold text-purple-700">
                          {member.fullName
                            ? member.fullName.charAt(0).toUpperCase()
                            : '?'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {member.fullName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {member.role === 'admin' ? (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white shadow-purple-200">
                          <Crown className="w-3 h-3 mr-1" /> Admin
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          {member.role === 'hr' ? 'HR' : 'Member'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 px-2 py-0.5"
                      >
                        <ShieldCheck className="mr-1 h-3 w-3" /> Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => setEditingMember(member)}
                            className="cursor-pointer focus:bg-purple-50 focus:text-purple-700"
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
                            onClick={() => handleDelete(member._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {members.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-16 text-center text-sm text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                          <Users className="h-8 w-8 text-gray-300" />
                        </div>
                        <span className="text-lg font-medium text-gray-900">
                          No members found
                        </span>
                        <span className="max-w-xs text-gray-400">
                          Get started by inviting people to your organization.
                        </span>
                        {!seatLimitReached && !isPendingVerification && (
                          <Button
                            size="sm"
                            className={`mt-4 ${THEME.gradientBtn}`}
                            onClick={() => setIsAddOpen(true)}
                          >
                            <UserPlus className="mr-2 h-4 w-4" /> Add your first
                            member
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-1 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-white rounded-lg overflow-hidden">
              <UpdateMemberForm onClose={() => setIsAddOpen(false)} op="add" />
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-1 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-white rounded-lg overflow-hidden">
              <UpdateMemberForm
                onClose={() => setEditingMember(null)}
                member={editingMember}
                op="edit"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
