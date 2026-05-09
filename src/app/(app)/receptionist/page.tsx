"use client";

import { useAuth } from "@/context/AuthProvider";
import { useBusiness } from "@/context/BusinessProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const { business_id, role } = useBusiness();

  if (!user) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <>
      <PageHeader
        title="Receptionist Dashboard"
        description={`Welcome, ${user.email}`}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-primary-50 to-transparent">
            <CardTitle className="text-primary-700">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</p>
              <p className="text-sm font-medium text-slate-900 mt-1">{user.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {role || "Loading..."}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Business</p>
              <p className="text-xs font-mono text-slate-600 mt-1 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
                {business_id?.substring(0, 8)}...
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-sky-50 to-transparent">
            <CardTitle className="text-sky-700">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary-600 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Queue Management</p>
                  <p className="text-xs text-slate-500">View and manage patient queue</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary-600 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Appointment Booking</p>
                  <p className="text-xs text-slate-500">Schedule and reschedule appointments</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary-600 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Walk-in Management</p>
                  <p className="text-xs text-slate-500">Add and manage walk-in patients</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
