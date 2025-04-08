"use client";

import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { BiCheckDouble } from "react-icons/bi";

interface NotificationListProps {
  className?: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  className = "",
}) => {
  const { notifications, isLoading, markAllAsRead } = useNotifications();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No hay notificaciones nuevas
      </div>
    );
  }

  return (
    <div className={`max-h-[400px] overflow-y-auto ${className}`}>
      <div className="p-2 border-b flex justify-between items-center">
        <h3 className="font-medium">Notificaciones</h3>
        <button
          onClick={() => markAllAsRead()}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <BiCheckDouble className="w-4 h-4" />
          Marcar todas como leídas
        </button>
      </div>
      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
};
