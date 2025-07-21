'use client';

import { useEffect, useState } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockUsers, mockAdminRoles, AdminRole } from '@/lib/data/user';
import { logAdminAction } from '@/lib/data/audit-logs';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { getProfileRequest } from '@/redux/reducers/authReducer';

interface RolesManagementClientProps {
  initialRoles: AdminRole[];
}

const roleFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Role name must be at least 2 characters.'),
  description: z.string().min(5, 'Description must be at least 5 characters.'),
  permissions: z.object({
    canManageOrgs: z.boolean().default(false),
    canManageUsers: z.boolean().default(false),
    canManageBilling: z.boolean().default(false),
    canManageJobs: z.boolean().default(false),
    canManageFooter: z.boolean().default(false),
    canManageHeader: z.boolean().default(false),
  }),
});
type RoleFormValues = z.infer<typeof roleFormSchema>;

const permissionLabels: Record<keyof RoleFormValues['permissions'], string> = {
  canManageOrgs: 'Manage Organizations',
  canManageUsers: 'Manage Admins & Roles',
  canManageBilling: 'Manage Subscriptions',
  canManageJobs: 'Manage Job Listings',
  canManageFooter: 'Manage Footer Content',
  canManageHeader: 'Manage Header Menus',
};

export function RolesManagementClient({
  initialRoles,
}: RolesManagementClientProps) {
  const { toast } = useToast();

  console.log('RolesManagementClient initialized with initialRoles:', initialRoles);


  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);

  const [roles, setRoles] = useState(initialRoles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);

  console.log('roles', roles);

  useEffect(() => {
    dispatch(getProfileRequest());
  }, [dispatch]);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
  });

  const openAddDialog = () => {
    setEditingRole(null);
    form.reset({
      name: '',
      description: '',
      permissions: {
        canManageOrgs: false,
        canManageUsers: false,
        canManageBilling: false,
        canManageJobs: false,
        canManageFooter: false,
        canManageHeader: false,
      },
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (role: AdminRole) => {
    setEditingRole(role);
    form.reset({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    // Prevent deletion if role is assigned to any admin user
    const isRoleAssigned = mockUsers.some(
      (user) => user.role === 'PrimaryAdmin' && user.adminRoleId === roleId,
    );
    if (isRoleAssigned) {
      toast({
        variant: 'destructive',
        title: 'Cannot Delete Role',
        description:
          'This role is currently assigned to one or more administrators.',
      });
      return;
    }

    const roleToDelete = roles.find((r) => r.id === roleId);
    logAdminAction(
      'ADMIN_ACTION',
      roleId,
      `Deleted role '${roleToDelete?.name}'.`,
    );

    const updatedRoles = roles.filter((r) => r.id !== roleId);
    setRoles(updatedRoles);
    // Also update the global mock data
    mockAdminRoles.splice(
      mockAdminRoles.findIndex((r) => r.id === roleId),
      1,
    );
    toast({ title: 'Role Deleted' });
  };

  const onSubmit = (values: RoleFormValues) => {
    if (editingRole) {
      const roleIndex = roles.findIndex((r) => r.id === editingRole.id);
      if (roleIndex > -1) {
        const updatedRole = { ...roles[roleIndex], ...values };
        const updatedRoles = [...roles];
        updatedRoles[roleIndex] = updatedRole;
        setRoles(updatedRoles);

        // Update the global mock data
        const globalRoleIndex = mockAdminRoles.findIndex(
          (r) => r.id === editingRole.id,
        );
        if (globalRoleIndex > -1) mockAdminRoles[globalRoleIndex] = updatedRole;

        logAdminAction(
          'ADMIN_ACTION',
          updatedRole.id,
          `Updated role '${updatedRole.name}'.`,
        );
        toast({ title: 'Role Updated' });
      }
    } else {
      const newRole: AdminRole = {
        id: `role_${Date.now()}`,
        name: values.name,
        description: values.description,
        permissions: values.permissions,
      };
      mockAdminRoles.push(newRole);
      setRoles([...roles, newRole]);

      logAdminAction(
        'ADMIN_ACTION',
        newRole.id,
        `Created new role '${newRole.name}'.`,
      );
      toast({
        title: 'Role Created',
        description: `The "${values.name}" role is now available to be assigned.`,
      });
    }
    setIsDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Available Roles</CardTitle>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Role
            </Button>
          </div>
          <CardDescription>
            Define roles that can be assigned to administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(role)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRole(role.id)}
                      disabled={role.id === 'role_super_admin'}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Permissions</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border p-4">
                  {Object.keys(permissionLabels).map((key) => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`permissions.${
                        key as keyof RoleFormValues['permissions']
                      }`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {
                              permissionLabels[
                                key as keyof typeof permissionLabels
                              ]
                            }
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
