import { useState, useEffect } from "react";
import { User } from "@/types/entities";
import { api } from "@/services/api";

export const useUsers = () => {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/users");
      setData(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchUsers,
  };
};
