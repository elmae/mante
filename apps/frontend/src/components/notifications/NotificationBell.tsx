"use client";

import React from "react";
import { BiBell } from "react-icons/bi";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationBellProps {
  onClick?: () => void;
  asButton?: boolean;
}

const NotificationBellContent: React.FC = () => {
  const { unreadCount } = useNotifications();

  return (
    <>
      <BiBell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </>
  );
};

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onClick,
  asButton = true,
}) => {
  if (!asButton) {
    return (
      <div className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
        <NotificationBellContent />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="Notificaciones"
    >
      <NotificationBellContent />
    </button>
  );
};
