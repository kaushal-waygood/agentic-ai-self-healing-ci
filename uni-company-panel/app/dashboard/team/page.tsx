'use client';

import React, { useEffect, useState } from 'react';
import { useRBACStore, Role } from '@/store/rbac.store';
import { useMultiCompanyStore } from '@/store/multi-company.store';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  UserPlus,
  MoreVertical,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Send,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateRoleButton } from './CreateRoleButton';

const ROLE_CONFIG: Record<string, { color: string; desc: string }> = {
  OWNER: {
    color: 'bg-purple-100 text-purple-800',
    desc: 'Full access to all features',
  },
  HR_MANAGER: {
    color: 'bg-blue-100 text-blue-800',
    desc: 'Manage jobs and candidates',
  },
  RECRUITER: {
    color: 'bg-green-100 text-green-800',
    desc: 'Screen and schedule candidates',
  },
  INTERVIEWER: {
    color: 'bg-yellow-100 text-yellow-800',
    desc: 'Provide candidate feedback',
  },
  VIEWER: { color: 'bg-gray-100 text-gray-800', desc: 'Read-only access' },
};

export default function TeamPage() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const {
    teamMembers,
    getTeamMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
    loading,
    roles,
    getAllCustomRoles,
    inviteTeamMember,
  } = useRBACStore();
  const { currentCompany } = useMultiCompanyStore();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      role: 'VIEWER',
      message: '',
    },
  });

  useEffect(() => {
    getAllCustomRoles();
    if (currentCompany?._id) {
      getTeamMembers(currentCompany._id);
    }
  }, [currentCompany, getAllCustomRoles, getTeamMembers]);

  const onSubmit = async (data: any) => {
    try {
      const success = await inviteMember({
        ...data,
        companyId: currentCompany?._id,
      });
      if (success) {
        toast.success('Invitation sent successfully!');
        setInviteDialogOpen(false);
        reset();
      }
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    await updateMemberRole(memberId, newRole as Role);
    toast.success('Role updated successfully');
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      await removeMember(memberId);
      toast.success('Member removed successfully');
    }
  };

  const getRoleBadge = (roleName: string) => {
    const config = ROLE_CONFIG[roleName] || {
      color: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      desc: 'Custom Role',
    };
    return (
      <div className="flex flex-col gap-1">
        <Badge className={`w-fit uppercase text-[10px] ${config.color}`}>
          {roleName.replace('_', ' ')}
        </Badge>
        <p className="text-[11px] text-gray-500">{config.desc}</p>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      INACTIVE: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={styles[status] || 'bg-gray-100'}>
        {status === 'ACTIVE' && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
        {status === 'INACTIVE' && <XCircle className="w-3 h-3 mr-1" />}
        {status}
      </Badge>
    );
  };

  const onInviteSubmit = async (data: any) => {
    console.log(currentCompany, data);
    if (!currentCompany?._id) {
      return toast.error('No active organization found.');
    }

    try {
      await inviteTeamMember({
        ...data,
        orgId: currentCompany._id,
      });

      toast.success('Invitation sent successfully!');
      reset(); // Clear the form
      setInviteDialogOpen(false); // Close the dialog
    } catch (error) {
      toast.error('Failed to send invitation.');
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Team Management
          </h1>
          <p className="text-gray-500">
            Managing members for{' '}
            <span className="font-semibold">
              {currentCompany?.name || 'Company'}
            </span>
          </p>
        </div>

        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Assign a role and send an invitation.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  {...register('email', { required: true })}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">Email is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  onValueChange={(value) => setValue('role', value)}
                  defaultValue="VIEWER"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <DropdownMenuLabel className="text-[10px] uppercase text-gray-400">
                      System Roles
                    </DropdownMenuLabel>
                    {Object.keys(ROLE_CONFIG).map((roleKey) => (
                      <SelectItem key={roleKey} value={roleKey}>
                        {roleKey.replace('_', ' ')}
                      </SelectItem>
                    ))}
                    {roles.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-[10px] uppercase text-gray-400">
                          Custom Roles
                        </DropdownMenuLabel>
                        {roles.map((role: any) => (
                          <SelectItem key={role._id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  className="w-full p-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  {...register('message')}
                />
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  onClick={handleSubmit(onInviteSubmit)}
                >
                  <Send className="w-4 h-4 mr-2" /> Send Invitation
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total',
            value: teamMembers.length,
            icon: Users,
            color: 'text-blue-500',
          },
          {
            label: 'Active',
            value: teamMembers.filter((m) => m.status === 'ACTIVE').length,
            icon: CheckCircle,
            color: 'text-green-500',
          },
          {
            label: 'Pending',
            value: teamMembers.filter((m) => m.status === 'PENDING').length,
            icon: Clock,
            color: 'text-yellow-500',
          },
          {
            label: 'Roles',
            value: roles.length + 5,
            icon: Shield,
            color: 'text-purple-500',
          },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color} opacity-20`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card shadow-sm>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage your team's access levels and roles.
            </CardDescription>
          </div>
          <CreateRoleButton />
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {member.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {/* System Roles */}
                          {Object.keys(ROLE_CONFIG).map((r) => (
                            <DropdownMenuItem
                              key={r}
                              onClick={() => handleRoleChange(member._id, r)}
                            >
                              <span className="flex-1">
                                {r.replace('_', ' ')}
                              </span>
                              {member.role === r && (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              )}
                            </DropdownMenuItem>
                          ))}
                          {/* Custom Roles */}
                          {roles.map((r: any) => (
                            <DropdownMenuItem
                              key={r._id}
                              onClick={() =>
                                handleRoleChange(member._id, r.name)
                              }
                            >
                              <span className="flex-1">{r.name}</span>
                              {member.role === r.name && (
                                <CheckCircle className="w-3 h-3 text-green-600" />
                              )}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && teamMembers.length === 0 && (
            <div className="py-20 text-center">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No team members found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
