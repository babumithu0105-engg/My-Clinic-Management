"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import {
  BuildingOfficeIcon,
  ClockIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
  const { user } = useAuth();

  if (!user) {
    return <LoadingOverlay message="Loading..." />;
  }

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description={`Welcome, ${user.name}`}
      />

      {/* Welcome Card */}
      <div className="mb-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-primary-100">Configure clinic settings and manage documentation fields</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/admin/business"
          className="group relative overflow-hidden rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 p-6 transition-all hover:border-primary-500 hover:shadow-md"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
          <div className="relative z-10 flex flex-col items-start">
            <div className="rounded-lg bg-primary-200 p-3 mb-4">
              <BuildingOfficeIcon className="h-6 w-6 text-primary-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Business Info</h3>
            <p className="text-sm text-slate-600 mt-2">Edit clinic name, phone, email, and address</p>
          </div>
        </Link>

        <Link
          href="/admin/working-hours"
          className="group relative overflow-hidden rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 p-6 transition-all hover:border-primary-500 hover:shadow-md"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
          <div className="relative z-10 flex flex-col items-start">
            <div className="rounded-lg bg-primary-200 p-3 mb-4">
              <ClockIcon className="h-6 w-6 text-primary-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Working Hours</h3>
            <p className="text-sm text-slate-600 mt-2">Set clinic hours for each day of the week</p>
          </div>
        </Link>

        <Link
          href="/admin/holidays"
          className="group relative overflow-hidden rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 p-6 transition-all hover:border-primary-500 hover:shadow-md"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
          <div className="relative z-10 flex flex-col items-start">
            <div className="rounded-lg bg-primary-200 p-3 mb-4">
              <CalendarDaysIcon className="h-6 w-6 text-primary-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Holidays</h3>
            <p className="text-sm text-slate-600 mt-2">Manage clinic closures and special dates</p>
          </div>
        </Link>

        <Link
          href="/admin/visit-fields"
          className="group relative overflow-hidden rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 p-6 transition-all hover:border-primary-500 hover:shadow-md"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
          <div className="relative z-10 flex flex-col items-start">
            <div className="rounded-lg bg-primary-200 p-3 mb-4">
              <DocumentTextIcon className="h-6 w-6 text-primary-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Visit Fields</h3>
            <p className="text-sm text-slate-600 mt-2">Customize what doctors document during visits</p>
          </div>
        </Link>
      </div>
    </>
  );
}
