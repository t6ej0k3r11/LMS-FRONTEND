import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getStudentPaymentsService } from "@/services";

/**
 * Custom hook for managing student payment history
 * @returns {Object} Hook state and functions
 */
export function usePaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getStudentPaymentsService();
      if (response?.success) {
        setPayments(response.data.payments || []);
      } else {
        const errorMessage = response?.message || "Failed to load payment history";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching payment history:", error);
      const errorMessage = "Failed to load payment history. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refetch = useCallback(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    error,
    refetch
  };
}