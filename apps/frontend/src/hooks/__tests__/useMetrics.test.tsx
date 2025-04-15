import { renderHook, act } from "@testing-library/react";
import { useMetrics } from "@/hooks/useMetrics";
import {
  MetricsSummary,
  TimeMetrics,
  TicketMetrics,
  HistoricalDataPoint,
} from "@/types/metrics";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

describe("useMetrics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch time metrics successfully", async () => {
    const mockTimeMetrics: TimeMetrics = {
      averageResponseTime: 120,
      averageResolutionTime: 480,
      slaComplianceRate: 95,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTimeMetrics),
    });

    const { result } = renderHook(() => useMetrics());

    await act(async () => {
      await result.current.fetchTimeMetrics({
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-04-30"),
      });
    });

    expect(result.current.timeMetrics).toEqual(mockTimeMetrics);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/metrics/time?startDate=2025-04-01"),
      expect.any(Object)
    );
  });

  it("should fetch ticket metrics successfully", async () => {
    const mockTicketMetrics: TicketMetrics = {
      total: 100,
      openTickets: 30,
      closedTickets: 60,
      inProgressTickets: 10,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTicketMetrics),
    });

    const { result } = renderHook(() => useMetrics());

    await act(async () => {
      await result.current.fetchTicketMetrics();
    });

    expect(result.current.ticketMetrics).toEqual(mockTicketMetrics);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith("/api/v1/metrics/tickets");
  });

  it("should fetch historical metrics successfully", async () => {
    const mockHistoricalData: HistoricalDataPoint[] = [
      {
        date: "2025-04-01",
        metrics: {
          timeMetrics: {
            averageResponseTime: 120,
            averageResolutionTime: 480,
            slaComplianceRate: 95,
          },
          ticketMetrics: {
            total: 100,
            openTickets: 30,
            closedTickets: 60,
            inProgressTickets: 10,
          },
        },
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockHistoricalData),
    });

    const { result } = renderHook(() => useMetrics());

    await act(async () => {
      await result.current.fetchHistoricalMetrics(30);
    });

    expect(result.current.historicalData).toEqual(mockHistoricalData);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/metrics/historical?days=30")
    );
  });

  it("should fetch full metrics successfully", async () => {
    const mockFullMetrics: MetricsSummary = {
      timeMetrics: {
        averageResponseTime: 120,
        averageResolutionTime: 480,
        slaComplianceRate: 95,
      },
      ticketMetrics: {
        total: 100,
        openTickets: 30,
        closedTickets: 60,
        inProgressTickets: 10,
      },
      categoryMetrics: [
        {
          category: "Hardware",
          subcategory: "Display",
          ticket_count: 50,
          average_resolution_time: 240,
          sla_compliance_rate: 90,
          trending: true,
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFullMetrics),
    });

    const { result } = renderHook(() => useMetrics());

    await act(async () => {
      await result.current.fetchFullMetrics({
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-04-30"),
      });
    });

    expect(result.current.timeMetrics).toEqual(mockFullMetrics.timeMetrics);
    expect(result.current.ticketMetrics).toEqual(mockFullMetrics.ticketMetrics);
    expect(result.current.categoryMetrics).toEqual(
      mockFullMetrics.categoryMetrics
    );
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/metrics/full?startDate=2025-04-01")
    );
  });

  it("should handle API errors correctly", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useMetrics());

    await act(async () => {
      await result.current.fetchTimeMetrics({
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-04-30"),
      });
    });

    expect(result.current.error).toBe("Error al cargar las métricas");
    expect(result.current.loading).toBe(false);
    expect(result.current.timeMetrics).toBeNull();
  });

  it("should handle non-ok responses correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad Request",
    });

    const { result } = renderHook(() => useMetrics());

    await act(async () => {
      await result.current.fetchTimeMetrics({
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-04-30"),
      });
    });

    expect(result.current.error).toBe("Error al cargar las métricas");
    expect(result.current.loading).toBe(false);
    expect(result.current.timeMetrics).toBeNull();
  });

  it("should manage loading state correctly", async () => {
    const mockTimeMetrics: TimeMetrics = {
      averageResponseTime: 120,
      averageResolutionTime: 480,
      slaComplianceRate: 95,
    };

    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve(mockTimeMetrics),
              }),
            100
          )
        )
    );

    const { result } = renderHook(() => useMetrics());

    expect(result.current.loading).toBe(false);

    const fetchPromise = act(async () => {
      const promise = result.current.fetchTimeMetrics({
        startDate: new Date("2025-04-01"),
        endDate: new Date("2025-04-30"),
      });
      expect(result.current.loading).toBe(true);
      await promise;
    });

    await fetchPromise;
    expect(result.current.loading).toBe(false);
    expect(result.current.timeMetrics).toEqual(mockTimeMetrics);
  });
});
