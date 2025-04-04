"use client";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="border-b border-gray-200 pb-5">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="mt-2 h-4 bg-gray-200 rounded w-2/4"></div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg bg-white p-6 shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="mt-4 h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="mt-4 h-[300px] bg-gray-100 rounded"></div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="mt-4 h-[300px] bg-gray-100 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
