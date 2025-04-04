import {
  HomeIcon,
  ComputerDesktopIcon,
  TicketIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    name: "ATMs",
    href: "/atms",
    icon: ComputerDesktopIcon,
  },
  {
    name: "Tickets",
    href: "/tickets",
    icon: TicketIcon,
  },
  {
    name: "Mantenimientos",
    href: "/maintenance",
    icon: ClipboardDocumentListIcon,
  },
  {
    name: "Clientes",
    href: "/clients",
    icon: UserGroupIcon,
  },
  {
    name: "Configuración",
    href: "/settings",
    icon: Cog6ToothIcon,
  },
];
