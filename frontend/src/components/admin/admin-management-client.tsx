
"use client";

import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockUsers, UserProfile, mockUserProfile, mockAdminRoles } from "@/lib/data/user";
import { logAdminAction } from "@/lib/data/audit-logs";

interface AdminManagementClientProps {
  initialAdmins: UserProfile[];
}

const adminFormSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("A valid email is required."),
  adminRoleId: z.string().nonempty("A role must be assigned."),
});
type AdminFormValues = z.infer<typeof adminFormSchema>;

export function AdminManagementClient({ initialAdmins }: AdminManagementClientProps) {
  const { toast } = useToast();
  
  const [admins, setAdmins] = useState(initialAdmins);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<UserProfile | null>(null);

  const loggedInAdmin = mockUserProfile;
  const loggedInAdminRole = mockAdminRoles.find(r => r.id === loggedInAdmin.adminRoleId);
  const permissions = loggedInAdminRole?.permissions;

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
  });

  const openAddDialog = () => {
    setEditingAdmin(null);
    form.reset({
      fullName: "",
      email: "",
      adminRoleId: "",
    });
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (admin: UserProfile) => {
    setEditingAdmin(admin);
    form.reset({
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      adminRoleId: admin.adminRoleId,
    });
    setIsDialogOpen(true);
  };
  
  const handleDeleteAdmin = (adminId: string) => {
    if (admins.length <= 1) {
        toast({ variant: "destructive", title: "Cannot Delete", description: "You cannot delete the last administrator." });
        return;
    }
    const adminToDelete = admins.find(a => a.id === adminId);
    logAdminAction("ADMIN_ACTION", adminId, `Deleted admin '${adminToDelete?.fullName}'.`);

    const updatedAdmins = admins.filter(a => a.id !== adminId);
    setAdmins(updatedAdmins);
    const userIndex = mockUsers.findIndex(u => u.id === adminId);
    if (userIndex > -1) mockUsers.splice(userIndex, 1);
    toast({ title: "Admin Deleted" });
  };
  
  const onSubmit = (values: AdminFormValues) => {
    if (editingAdmin) { 
      const adminIndex = admins.findIndex(a => a.id === editingAdmin.id);
      if (adminIndex > -1) {
          const updatedAdmin = { ...admins[adminIndex], ...values };
          const updatedAdmins = [...admins];
          updatedAdmins[adminIndex] = updatedAdmin;
          setAdmins(updatedAdmins);

          const userIndex = mockUsers.findIndex(u => u.id === editingAdmin.id);
          if (userIndex > -1) mockUsers[userIndex] = updatedAdmin;
          
          logAdminAction("ADMIN_ACTION", updatedAdmin.id, `Updated admin '${updatedAdmin.fullName}'.`);
          toast({ title: "Administrator Updated" });
      }
    } else { 
      const newAdmin: UserProfile = {
        id: `admin-${Date.now()}`,
        fullName: values.fullName,
        email: values.email,
        createdAt: new Date().toISOString(),
        role: 'PrimaryAdmin',
        adminRoleId: values.adminRoleId,
        currentPlanId: 'pro', 
        jobPreference: 'Admin', 
        narratives: {challenges: '', achievements: '', appreciation: ''},
        education: [], 
        experience: [], 
        projects: [], 
        skills: [], 
        referralCode: '', 
        referralsMade: 0,
        earnedApplicationCredits: 0, 
        usage: { aiJobApply: 0, aiCvGenerator: 0, aiCoverLetterGenerator: 0, applications: 0 },
        lastApplicationDate: '', 
        isEmailLinked: false, 
        linkedEmailProvider: '',
        savedCvs: [], 
        savedCoverLetters: [], 
        autoApplyAgents: [], 
        actionItems: [],
      };
      mockUsers.push(newAdmin);
      setAdmins([...admins, newAdmin]);
      
      logAdminAction("ADMIN_ACTION", newAdmin.id, `Created new admin '${newAdmin.fullName}'.`);
      toast({ title: "Administrator Added", description: `"${values.fullName}" can now log in with the default password 'Admin@123'.` });
    }
    setIsDialogOpen(false);
  };

  const getRoleName = (roleId?: string) => {
      return mockAdminRoles.find(r => r.id === roleId)?.name || 'No Role Assigned';
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Admin User Management</CardTitle>
            <Button onClick={openAddDialog} disabled={!permissions?.admin_create}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Admin
            </Button>
          </div>
          <CardDescription>Assign roles and manage administrator accounts on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.fullName}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{getRoleName(admin.adminRoleId)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(admin)} disabled={!permissions?.admin_update}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteAdmin(admin.id)} disabled={!permissions?.admin_delete || admin.id === loggedInAdmin.id || admins.length <= 1}>
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
            <DialogTitle>{editingAdmin ? "Edit Administrator" : "Add New Administrator"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} readOnly={!!editingAdmin} /></FormControl><FormMessage /></FormItem>)} />
                
                <FormField
                    control={form.control}
                    name="adminRoleId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role to assign" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {mockAdminRoles.map(role => (
                                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
