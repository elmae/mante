"use client";

import MaintenancePage from "../page";

interface ATMMaintenancePageProps {
  params: {
    atmId: string;
  };
}

export default function ATMMaintenancePage({
  params,
}: ATMMaintenancePageProps) {
  return <MaintenancePage params={params} />;
}
