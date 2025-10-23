
"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { mockUsers } from "@/lib/data/user";
import type { UserProfile } from "@/lib/data/user";
import type { SubscriptionPlan } from "@/lib/data/subscriptions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface UserManagementClientProps {
  plans: SubscriptionPlan[];
}

const USERS_PER_PAGE = 10;

export function UserManagementClient({ plans }: UserManagementClientProps) {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  
  // Effect to update search term if the query param changes
  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
    setCurrentPage(1);
  }, [searchParams]);

  const getPlanName = (planId: string) => {
    return plans.find((p) => p.id === planId)?.name || "N/A";
  };

  // Memoized calculations for performance
  const searchedUsers = useMemo(() => {
    return mockUsers.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const individualUsers = useMemo(
    () => searchedUsers.filter((u) => u.role === "Individual"),
    [searchedUsers]
  );
  const orgUsers = useMemo(
    () =>
      searchedUsers.filter(
        (u) => u.role === "OrgMember" || u.role === "OrgAdmin"
      ),
    [searchedUsers]
  );
  const adminUsers = useMemo(
    () => searchedUsers.filter((u) => u.role === "PrimaryAdmin"),
    [searchedUsers]
  );

  const displayedUsers = useMemo(() => {
    if (activeTab === "individual") return individualUsers;
    if (activeTab === "organization") return orgUsers;
    if (activeTab === "admin") return adminUsers;
    return searchedUsers;
  }, [activeTab, individualUsers, orgUsers, adminUsers, searchedUsers]);

  const totalPages = Math.ceil(displayedUsers.length / USERS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return displayedUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [displayedUsers, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderUsers = (users: UserProfile[]) => (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex flex-col gap-3">
              <div>
                <p className="font-semibold">{user.fullName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{user.role}</Badge>
                <Badge variant="secondary">{getPlanName(user.currentPlanId)}</Badge>
                <Badge variant="default" className="bg-green-500/80">Active</Badge>
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/primary-admin/users/${user.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div>{user.fullName}</div>
                  <div className="text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{getPlanName(user.currentPlanId)}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="default" className="bg-green-500/80">
                    Active
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/primary-admin/users/${user.id}`}>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {users.length === 0 && (
          <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
              No users found for this filter.
          </div>
      )}

      <CardFooter className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t pt-6">
        <div className="text-xs text-muted-foreground">
          Showing <strong>{paginatedUsers.length}</strong> of{" "}
          <strong>{displayedUsers.length}</strong> users.
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages > 0 ? totalPages : 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </>
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset page number when changing tabs
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset page number on new search
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>
          A complete list of every user on the zobsai platform.
        </CardDescription>
        <div className="mt-4">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Users ({searchedUsers.length})</TabsTrigger>
            <TabsTrigger value="individual">
              Individuals ({individualUsers.length})
            </TabsTrigger>
            <TabsTrigger value="organization">
              Organization Members ({orgUsers.length})
            </TabsTrigger>
            <TabsTrigger value="admin">
              Admins ({adminUsers.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            {renderUsers(paginatedUsers)}
          </TabsContent>
          <TabsContent value="individual" className="mt-4">
            {renderUsers(paginatedUsers)}
          </TabsContent>
          <TabsContent value="organization" className="mt-4">
            {renderUsers(paginatedUsers)}
          </TabsContent>
           <TabsContent value="admin" className="mt-4">
            {renderUsers(paginatedUsers)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
