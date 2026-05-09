"use client";

import { useAuth } from "@/context/AuthProvider";
import { useBusiness } from "@/context/BusinessProvider";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { CalendarIcon, UserGroupIcon, UserPlusIcon } from "@heroicons/react/24/outline";

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const { business_id, role } = useBusiness();

  if (!user) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <>
      <PageHeader
        title="Welcome back"
        description={`${user.email} • ${role}`}
      />

      {/* Welcome Card */}
      <div className="mb-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Reception Dashboard</h2>
        <p className="text-primary-100 mb-6">Manage appointments, queue, and patient information</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button className="group relative overflow-hidden rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 p-6 transition-all hover:border-primary-500 hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
          <div className="relative z-10 flex flex-col items-start">
            <div className="rounded-lg bg-primary-200 p-3 mb-4">
              <UserPlusIcon className="h-6 w-6 text-primary-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Add Walk-in</h3>
            <p className="text-sm text-slate-600 mt-2">Register a new walk-in patient</p>
          </div>
        </button>

        <button className="group relative overflow-hidden rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 p-6 transition-all hover:border-primary-500 hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
          <div className="relative z-10 flex flex-col items-start">
            <div className="rounded-lg bg-primary-200 p-3 mb-4">
              <CalendarIcon className="h-6 w-6 text-primary-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Book Appointment</h3>
            <p className="text-sm text-slate-600 mt-2">Schedule a new appointment</p>
          </div>
        </button>

        <button className="group relative overflow-hidden rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 p-6 transition-all hover:border-primary-500 hover:shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
          <div className="relative z-10 flex flex-col items-start">
            <div className="rounded-lg bg-primary-200 p-3 mb-4">
              <UserGroupIcon className="h-6 w-6 text-primary-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">View Queue</h3>
            <p className="text-sm text-slate-600 mt-2">See current patient queue</p>
          </div>
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Your Role</p>
                <p className="text-2xl font-bold text-slate-900 capitalize">{role}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email</p>
                <p className="text-lg font-bold text-slate-900 truncate">{user.email}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-600">{user.email.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
