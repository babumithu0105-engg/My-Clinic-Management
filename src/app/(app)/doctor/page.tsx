"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useBusiness } from "@/context/BusinessProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { VisitSheet } from "@/components/visits/VisitSheet";
import { ClockIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { formatTime12h } from "@/lib/utils";
import type { AppointmentWithPatient, QueueResponse } from "@/types";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { role } = useBusiness();

  const [queue, setQueue] = useState<QueueResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithPatient | null>(null);
  const [openVisitSheet, setOpenVisitSheet] = useState(false);

  // Load queue (today, auto-filtered to checked-in)
  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/queue");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load queue");
      }
      const responseData = await response.json();
      const queueData = responseData.data || responseData;

      // Filter to only checked-in patients
      const checkedInAppointments = [
        ...queueData.booked,
        ...queueData.walk_ins,
      ].filter((apt) => apt.status === "checked-in");

      setQueue({
        booked: checkedInAppointments.filter((apt) => !apt.is_walk_in),
        walk_ins: checkedInAppointments.filter((apt) => apt.is_walk_in),
      });
    } catch (error) {
      console.error("Error loading queue:", error);
      setQueue({ booked: [], walk_ins: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load queue on mount and set up auto-refresh every 30 seconds
  useEffect(() => {
    loadQueue();

    const interval = setInterval(() => {
      loadQueue();
    }, 30000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadQueue]);

  if (!user) {
    return <div className="p-4">Loading...</div>;
  }

  const handleStartVisit = (appointment: AppointmentWithPatient) => {
    setSelectedAppointment(appointment);
    setOpenVisitSheet(true);
  };

  const handleVisitComplete = () => {
    setOpenVisitSheet(false);
    setSelectedAppointment(null);
    loadQueue();
  };

  const allPatients = queue
    ? [...queue.booked, ...queue.walk_ins]
    : [];

  return (
    <>
      <PageHeader
        title="Welcome back"
        description={`${user.email} • ${role}`}
      />

      {/* Welcome Card */}
      <div className="mb-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Doctor Dashboard</h2>
        <p className="text-primary-100 mb-6">View your patient queue and document visits</p>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-clinic-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Patients in Queue</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{allPatients.length}</p>
            </div>
            <div className="rounded-lg bg-primary-100 p-3">
              <UserGroupIcon className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-clinic-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Last Updated</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">Just now</p>
              <p className="text-xs text-slate-500 mt-1">Auto-refreshes every 30 seconds</p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <ClockIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Queue Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Today&apos;s Queue</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadQueue}
          >
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : !allPatients || allPatients.length === 0 ? (
          <EmptyState
            icon={<UserGroupIcon className="h-12 w-12 text-primary-400" />}
            title="No patients in queue"
            description="All patients have been completed or no patients have been sent to you yet"
          />
        ) : (
          <div className="space-y-6">
            {/* Booked Appointments */}
            {queue!.booked.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  Booked Appointments ({queue!.booked.length})
                </h3>
                <div className="space-y-2">
                  {queue!.booked.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 bg-white border border-clinic-border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="font-semibold text-slate-900">
                              {appointment.patient?.name}
                            </div>
                            <Badge variant="info">Scheduled</Badge>
                          </div>
                          <div className="text-sm text-slate-600 mt-1">
                            Time: {formatTime12h(appointment.appointment_time)} • Duration: {appointment.duration_minutes} min
                          </div>
                          {appointment.patient?.age && (
                            <div className="text-sm text-slate-500 mt-1">
                              Age: {appointment.patient.age} • Phone: {appointment.patient.phone_number}
                            </div>
                          )}
                          {appointment.receptionist_notes && (
                            <div className="bg-amber-50 border border-amber-200 rounded p-2 mt-2 text-sm text-amber-900">
                              <strong>Notes:</strong> {appointment.receptionist_notes}
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStartVisit(appointment)}
                          >
                            Start Visit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Walk-ins */}
            {queue!.walk_ins.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  Walk-ins ({queue!.walk_ins.length})
                </h3>
                <div className="space-y-2">
                  {queue!.walk_ins.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 bg-white border border-clinic-border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="font-semibold text-slate-900">
                              {appointment.patient?.name}
                            </div>
                            <Badge variant="warning">Walk-in</Badge>
                          </div>
                          <div className="text-sm text-slate-600 mt-1">
                            Checked in: {formatTime12h(appointment.appointment_time)} • Duration: {appointment.duration_minutes} min
                          </div>
                          {appointment.patient?.age && (
                            <div className="text-sm text-slate-500 mt-1">
                              Age: {appointment.patient.age} • Phone: {appointment.patient.phone_number}
                            </div>
                          )}
                          {appointment.receptionist_notes && (
                            <div className="bg-amber-50 border border-amber-200 rounded p-2 mt-2 text-sm text-amber-900">
                              <strong>Notes:</strong> {appointment.receptionist_notes}
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStartVisit(appointment)}
                          >
                            Start Visit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visit Sheet */}
      <VisitSheet
        appointment={selectedAppointment}
        open={openVisitSheet}
        onOpenChange={setOpenVisitSheet}
        onComplete={handleVisitComplete}
      />
    </>
  );
}
