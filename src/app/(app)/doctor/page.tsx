"use client";

import { useAuth } from "@/context/AuthProvider";
import { useBusiness } from "@/context/BusinessProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { business_id, role } = useBusiness();

  if (!user) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <>
      <PageHeader
        title="Doctor Dashboard"
        description={`Welcome, ${user.name}`}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {role || "Loading..."}
            </p>
            <p>
              <strong>Business ID:</strong>{" "}
              <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                {business_id}
              </code>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-medium text-slate-900">Phase 7+</h3>
              <ul className="text-sm text-slate-600 space-y-1 mt-2">
                <li>• Patient Queue</li>
                <li>• Check-in Patient</li>
                <li>• Visit Documentation</li>
                <li>• Patient History</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
