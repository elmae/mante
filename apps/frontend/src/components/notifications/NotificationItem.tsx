"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { BiCheck } from "react-icons/bi";
import { INotification } from "@/types/notifications";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationItemProps {
  notification: INotification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  const { markAsRead } = useNotifications();
  const { id, title, content, created_at, is_read } = notification;

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!is_read) {
      markAsRead(id);
    }
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        !is_read ? "bg-blue-50" : ""
      }`}
      onClick={handleMarkAsRead}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{content}</p>
          <span className="text-xs text-gray-500 mt-2 block">
            {formatDistanceToNow(new Date(created_at), {
              locale: es,
              addSuffix: true,
            })}
          </span>
        </div>
        {!is_read ? (
          <button
            onClick={handleMarkAsRead}
            className="text-blue-600 hover:text-blue-800"
            title="Marcar como leída"
          >
            <BiCheck className="w-5 h-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
};
