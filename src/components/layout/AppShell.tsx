"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { useBusiness } from "@/context/BusinessProvider";
import { Button } from "@/components/ui/Button";
import {
  QueueListIcon,
  ArrowLeftOnRectangleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import {
  BuildingOfficeIcon,
  ClockIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { clsx } from "clsx";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/receptionist",
    icon: <QueueListIcon className="h-5 w-5" />,
    roles: ["receptionist"],
  },
  {
    label: "Appointments",
    href: "/receptionist/appointments",
    icon: <CalendarIcon className="h-5 w-5" />,
    roles: ["receptionist"],
  },
  {
    label: "Patients",
    href: "/receptionist/patients",
    icon: <UserGroupIcon className="h-5 w-5" />,
    roles: ["receptionist"],
  },
  {
    label: "Queue",
    href: "/doctor",
    icon: <QueueListIcon className="h-5 w-5" />,
    roles: ["doctor"],
  },
  {
    label: "Business Info",
    href: "/admin/business",
    icon: <BuildingOfficeIcon className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    label: "Working Hours",
    href: "/admin/working-hours",
    icon: <ClockIcon className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    label: "Holidays",
    href: "/admin/holidays",
    icon: <CalendarDaysIcon className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    label: "Visit Fields",
    href: "/admin/visit-fields",
    icon: <DocumentTextIcon className="h-5 w-5" />,
    roles: ["admin"],
  },
];

export interface AppShellProps {
  children: React.ReactNode;
}

const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  ({ children }, ref) => {
    const { logout } = useAuth();
    const { role } = useBusiness();
    const pathname = usePathname();

    const visibleNavItems = NAV_ITEMS.filter(
      (item) => !item.roles || (role && item.roles.includes(role))
    );

    const isActive = (href: string) => {
      if (href === pathname) return true;
      if (pathname.startsWith(href + "/")) return true;
      return false;
    };

    return (
      <div ref={ref} className="flex min-h-screen flex-col bg-clinic-bg md:flex-row">
        {/* Sidebar (Desktop) */}
        <aside className="hidden w-64 border-r border-slate-200 bg-white md:flex md:flex-col md:justify-between md:px-6 md:py-8">
          <div className="space-y-8">
            <div className="flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Clinic Logo"
                width={200}
                height={60}
                className="h-auto w-full max-w-xs"
                priority
              />
            </div>
            <nav className="space-y-2">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-sky-50 text-sky-700"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <Button
            variant="ghost"
            onClick={() => logout()}
            className="w-full justify-start gap-2"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            Logout
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8 md:px-8 md:py-8">
          <div className="max-w-6xl">{children}</div>
        </main>

        {/* Bottom Navigation (Mobile) */}
        <nav className="fixed bottom-0 left-0 right-0 flex border-t border-slate-200 bg-white md:hidden">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex-1 flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium transition-colors",
                isActive(item.href)
                  ? "bg-sky-50 text-sky-700"
                  : "text-slate-600"
              )}
            >
              <div className="flex h-6 w-6 items-center justify-center">
                {item.icon}
              </div>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => logout()}
            className="flex-1 flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium text-slate-600 transition-colors"
          >
            <div className="flex h-6 w-6 items-center justify-center">
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            </div>
            <span className="truncate">Logout</span>
          </button>
        </nav>
      </div>
    );
  }
);
AppShell.displayName = "AppShell";

export { AppShell };
