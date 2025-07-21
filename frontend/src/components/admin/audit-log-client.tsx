
"use client";

import { useState, useMemo } from "react";
import type { AuditLogEntry } from "@/lib/data/audit-logs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const actionTypes = [
  "ALL",
  "USER_UPDATE",
  "PLAN_CHANGE",
  "ORG_UPDATE",
  "ADMIN_ACTION",
  "LOGIN_ACTION",
];

export function AuditLogClient({ initialLogs }: { initialLogs: AuditLogEntry[] }) {
  const [logs, setLogs] = useState(initialLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const searchMatch =
        searchTerm === "" ||
        log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase());
      
      const actionMatch = selectedAction === "ALL" || log.action === selectedAction;

      return searchMatch && actionMatch;
    });
  }, [logs, searchTerm, selectedAction]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log History</CardTitle>
        <CardDescription>A reverse-chronological list of all tracked admin actions.</CardDescription>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <Input 
                placeholder="Search by admin email, target ID, or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
            />
            <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by action type..." />
                </SelectTrigger>
                <SelectContent>
                    {actionTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs">{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{log.adminEmail}</TableCell>
                  <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                  <TableCell className="text-xs font-mono">{log.targetId}</TableCell>
                  <TableCell className="text-sm">{log.details}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No logs found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
