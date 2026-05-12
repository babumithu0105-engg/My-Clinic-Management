"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";
import { useBusiness } from "@/context/BusinessProvider";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { DocumentTextIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { formatTime12h, formatDateReadable } from "@/lib/utils";
import type { Patient, AppointmentWithPatient } from "@/types";

interface AppointmentsResponse {
  data: AppointmentWithPatient[];
  total: number;
}

export default function PatientAppointmentsPage({
  params,
}: {
  params: { patientId: string };
}) {
  const { user } = useAuth();
  const { role } = useBusiness();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [showAllPast, setShowAllPast] = useState(false);

  const loadPatientAndAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch patient details
      const patientResponse = await fetch(`/api/patients/${params.patientId}`);
      if (!patientResponse.ok) {
        throw new Error("Failed to load patient");
      }
      const patientData = await patientResponse.json();
      setPatient(patientData.data);

      // Fetch all appointments for this patient
      const appointmentParams = new URLSearchParams({
        patientId: params.patientId,
      });

      const appointmentsResponse = await fetch(
        `/api/appointments/history?${appointmentParams}`
      );
      if (!appointmentsResponse.ok) {
        throw new Error("Failed to load appointments");
      }
      const appointmentsData: AppointmentsResponse =
        await appointmentsResponse.json();
      setAppointments(appointmentsData.data || []);
    } catch (error) {
      console.error("Error loading patient and appointments:", error);
      toast.error("Failed to load patient or appointments");
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [params.patientId]);

  useEffect(() => {
    loadPatientAndAppointments();
  }, [loadPatientAndAppointments]);

  if (!user) {
    return <LoadingOverlay message="Loading..." />;
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      scheduled: "default",
      "checked-in": "info",
      completed: "success",
      "no-show": "danger",
      cancelled: "warning",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const toggleNotes = (appointmentId: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(appointmentId)) {
        next.delete(appointmentId);
      } else {
        next.add(appointmentId);
      }
      return next;
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate >= today && ["scheduled", "checked-in"].includes(apt.status);
  });

  const pastAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointment_date);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate < today || apt.status === "completed";
  });

  const displayedPastAppointments = showAllPast ? pastAppointments : pastAppointments.slice(0, 10);
  const hasMorePastAppointments = pastAppointments.length > 10 && !showAllPast;

  return (
    <>
      {/* Header with back link */}
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/receptionist/patients"
          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="text-sm font-medium">Patients</span>
        </Link>
      </div>

      {/* Patient Header */}
      {isLoading ? (
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-64" />
        </div>
      ) : patient ? (
        <>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
              {patient.status && (
                <Badge variant={patient.status === "active" ? "success" : "warning"}>
                  {patient.status === "active" ? "Active" : "Inactive"}
                </Badge>
              )}
            </div>
          </div>

          {/* Patient Info Card */}
          <div className="bg-white border border-clinic-border rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-slate-600">Phone</span>
                <div className="text-slate-900 font-medium">{patient.phone_number}</div>
              </div>
              {patient.age && (
                <div>
                  <span className="text-sm text-slate-600">Age</span>
                  <div className="text-slate-900 font-medium">{patient.age}</div>
                </div>
              )}
              {patient.sex && (
                <div>
                  <span className="text-sm text-slate-600">Sex</span>
                  <div className="text-slate-900 font-medium">{patient.sex === "M" ? "Male" : "Female"}</div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Appointments Section */}
      <div>
        <PageHeader
          title="Appointments"
          description="View appointment history"
        />

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : (
          <>
            {/* Upcoming Appointments */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Upcoming</h2>
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No upcoming appointments</p>
              ) : (
                <div className="space-y-2">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 bg-white border border-clinic-border rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span className="font-medium text-slate-900 min-w-fit">
                          {formatDateReadable(appointment.appointment_date)}
                        </span>
                        <span className="text-slate-600">
                          {formatTime12h(appointment.appointment_time)}
                        </span>
                        <span className="text-slate-600">
                          {appointment.duration_minutes} min
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Appointments */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Past</h2>
              {pastAppointments.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No past appointments</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {displayedPastAppointments.map((appointment) => (
                      <div key={appointment.id} className="space-y-2">
                        <div className="p-4 bg-white border border-clinic-border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <span className="font-medium text-slate-900">
                                {formatDateReadable(appointment.appointment_date)}
                              </span>
                              <span className="text-slate-600">
                                {formatTime12h(appointment.appointment_time)}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600">
                                {appointment.duration_minutes} min
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {getStatusBadge(appointment.status)}
                              {appointment.receptionist_notes && (
                                <button
                                  onClick={() => toggleNotes(appointment.id)}
                                  className="text-slate-500 hover:text-slate-700 transition-colors p-1"
                                  title={expandedNotes.has(appointment.id) ? "Collapse notes" : "Expand notes"}
                                >
                                  <DocumentTextIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expanded notes */}
                          {expandedNotes.has(appointment.id) && appointment.receptionist_notes && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <p className="text-xs text-slate-600 font-medium mb-1">Receptionist Notes</p>
                              <p className="text-sm text-slate-700">
                                {appointment.receptionist_notes}
                              </p>
                            </div>
                          )}

                          {/* Doctor notes (only if role is doctor) */}
                          {role === "doctor" && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <p className="text-xs text-slate-600 font-medium mb-1">Doctor Notes</p>
                              <p className="text-sm text-slate-700">
                                [Doctor visit notes would appear here]
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {hasMorePastAppointments && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="secondary"
                        onClick={() => setShowAllPast(true)}
                      >
                        View All ({pastAppointments.length} total)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
