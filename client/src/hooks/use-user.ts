import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
}

export function useUser() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
