import { useState, useCallback } from "react";
import {
  MetricsSummary,
  TimeMetrics,
  TicketMetrics,
  CategoryMetric,
  HistoricalDataPoint,
  Period,
} from "../types/metrics";

export const useMetrics = () => {
  const [timeMetrics, setTimeMetrics] = useState<TimeMetrics | null>(null);
  const [ticketMetrics, setTicketMetrics] = useState<TicketMetrics | null>(
    null
  );
  const [categoryMetrics, setCategoryMetrics] = useState<
    CategoryMetric[] | null
  >(null);
  const [historicalData, setHistoricalData] = useState<
    HistoricalDataPoint[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiError = (error: unknown) => {
    console.error("API Error:", error);
    setError("Error al cargar las métricas");
    setLoading(false);
  };

  const fetchTimeMetrics = useCallback(async (period: Period) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startDate: period.startDate.toISOString(),
        endDate: period.endDate.toISOString(),
      });

      const response = await fetch(`/api/v1/metrics/time?${params}`);
      if (!response.ok) throw new Error("API Error");

      const data = await response.json();
      setTimeMetrics(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTicketMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/metrics/tickets");
      if (!response.ok) throw new Error("API Error");

      const data = await response.json();
      setTicketMetrics(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistoricalMetrics = useCallback(async (days: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        days: days.toString(),
      });

      const response = await fetch(`/api/v1/metrics/historical?${params}`);
      if (!response.ok) throw new Error("API Error");

      const data = await response.json();
      setHistoricalData(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFullMetrics = useCallback(async (period: Period) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        startDate: period.startDate.toISOString(),
        endDate: period.endDate.toISOString(),
      });

      const response = await fetch(`/api/v1/metrics/full?${params}`);
      if (!response.ok) throw new Error("API Error");

      const data: MetricsSummary = await response.json();
      setTimeMetrics(data.timeMetrics);
      setTicketMetrics(data.ticketMetrics);
      setCategoryMetrics(data.categoryMetrics || null);
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    timeMetrics,
    ticketMetrics,
    categoryMetrics,
    historicalData,
    loading,
    error,
    fetchTimeMetrics,
    fetchTicketMetrics,
    fetchHistoricalMetrics,
    fetchFullMetrics,
  };
};
