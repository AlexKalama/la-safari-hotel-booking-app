"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { UserRole } from "@/lib/users";

interface UserRoleContextType {
  role: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
}

const UserRoleContext = createContext<UserRoleContextType>({
  role: null,
  isAdmin: false,
  isLoading: true,
});

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!isLoaded || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        // First check if role is in clerk metadata
        const metadata = user?.publicMetadata;
        if (metadata && metadata.role) {
          setRole(metadata.role as UserRole);
          setIsLoading(false);
          return;
        }

        // If not in metadata, fetch from Supabase
        const response = await fetch(`/api/user-role?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setRole(data.role || 'user');
        } else {
          // Default to user role if there's an error
          setRole('user');
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole('user');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [isLoaded, userId, user]);

  return (
    <UserRoleContext.Provider
      value={{
        role,
        isAdmin: role === 'admin',
        isLoading,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
}

export const useUserRole = () => useContext(UserRoleContext);
