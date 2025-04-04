import { type PropsWithChildren } from "react";

export const metadata = {
  title: "Mantenimientos - CMMS",
  description: "Gestión de mantenimientos de ATMs",
};

export default function MaintenanceLayout({ children }: PropsWithChildren) {
  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
