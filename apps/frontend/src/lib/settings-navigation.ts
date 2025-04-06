import {
  UserIcon,
  BellIcon,
  TrashIcon,
  KeyIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export const settingsNavigation = [
  {
    name: "Perfil",
    href: "/settings/profile",
    icon: UserIcon,
    description: "Gestiona tu información personal y preferencias",
  },
  {
    name: "Seguridad",
    href: "/settings/security",
    icon: ShieldCheckIcon,
    description: "Configura la autenticación y permisos",
  },
  {
    name: "Notificaciones",
    href: "/settings/notifications",
    icon: BellIcon,
    description: "Personaliza tus notificaciones",
  },
  {
    name: "Papelera de Reciclaje",
    href: "/settings/recycle-bin",
    icon: TrashIcon,
    description: "Gestiona archivos eliminados",
  },
  {
    name: "Retención de Archivos",
    href: "/settings/retention",
    icon: ClockIcon,
    description: "Configura políticas de retención",
  },
  {
    name: "API Keys",
    href: "/settings/api-keys",
    icon: KeyIcon,
    description: "Gestiona claves de acceso a la API",
  },
];
