import { useQuery } from "@tanstack/react-query";
import { atmService, ATMError } from "@/services/api/atm";

export interface UseATMError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export function useATM(atmId?: string) {
  const {
    data: atm,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["atm", atmId],
    queryFn: () => {
      if (!atmId) {
        throw new ATMError("Se requiere el ID del ATM", "VALIDATION_ERROR");
      }
      return atmService.getATM(atmId);
    },
    enabled: !!atmId,
  });

  const formatError = (error: unknown): UseATMError | null => {
    if (error instanceof ATMError) {
      return {
        message: error.message,
        code: error.code,
        details: error.details,
      };
    }
    if (error instanceof Error) {
      return {
        message: error.message,
        code: "UNKNOWN_ERROR",
      };
    }
    return null;
  };

  return {
    atm,
    isLoading,
    error: formatError(error),
    refetch,
  };
}
