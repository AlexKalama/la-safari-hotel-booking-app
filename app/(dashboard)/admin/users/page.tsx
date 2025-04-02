"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase";
import { UserData, updateUserRole, UserRole } from "@/lib/users";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient.from("users").select("*");
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: UserRole) => {
    setUpdatingUser(userId);
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";
      const success = await updateUserRole(userId, newRole);
      
      if (success) {
        // Update the local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        toast.success(`User role updated to ${newRole}`);
      } else {
        throw new Error("Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    } finally {
      setUpdatingUser(null);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>
      
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-700" />
        </div>
      ) : (
        <Table>
          <TableCaption>A list of all users in the system</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === "admin" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.created_at ? new Date(user.created_at).toLocaleString() : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleUserRole(user.id, user.role)}
                      disabled={updatingUser === user.id}
                    >
                      {updatingUser === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : null}
                      {user.role === "admin" ? "Make User" : "Make Admin"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
