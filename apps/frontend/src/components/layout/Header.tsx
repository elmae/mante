"use client";

import React, { Fragment } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { Menu, Popover, Transition } from "@headlessui/react";
import { NotificationBell, NotificationList } from "@/components/notifications";
import { useAuth } from "@/contexts/auth/AuthContext";
export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 z-50 w-full bg-white shadow-sm h-16">
      <div className="flex h-full items-center justify-between px-4">
        {/* Logo y toggle del menú */}
        <div className="flex items-center">
          <button
            type="button"
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="ml-4 flex lg:ml-6">
            <span className="text-xl font-bold text-primary-600">CMMS</span>
          </div>
        </div>

        {/* Acciones del header */}
        <div className="flex items-center gap-4">
          {/* Notificaciones */}
          <Popover className="relative">
            {() => (
              <>
                <Popover.Button className="focus:outline-none">
                  <NotificationBell asButton={false} />
                </Popover.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute right-0 mt-2 w-96 transform">
                    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="relative bg-white">
                        <NotificationList />
                      </div>
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>

          {/* Avatar del usuario */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex rounded-full bg-gray-100 text-sm focus:outline-none">
              <span className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700">
                {user?.name?.substring(0, 2).toUpperCase() || "US"}
              </span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } block w-full px-4 py-2 text-left text-sm text-gray-700`}
                    >
                      Cerrar Sesión
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
}

export default Header;
