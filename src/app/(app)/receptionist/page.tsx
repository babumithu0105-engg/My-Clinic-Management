"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useBusiness } from "@/context/BusinessProvider";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmInline } from "@/components/ui/ConfirmInline";
import { BookingForm } from "@/components/appointments/BookingForm";
import { CalendarIcon, UserGroupIcon, UserPlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatTime12h, formatDateReadable, getCurrentDate } from "@/lib/utils";
import type { AppointmentWithPatient } from "@/types";

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const { business_id, role } = useBusiness();
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openBookingForm, setOpenBookingForm] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<{ id: string; appointment: AppointmentWithPatient } | null>(null);

  // Load appointments for selected date
  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments?date=${selectedDate}`);
      if (!response.ok) {
        throw new Error("Failed to load appointments");
      }
      const data = await response.json();
      setAppointments(data.data || []);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Failed to load appointments");
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  // Fetch appointments when date changes
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  if (!user) {
    return <div className="p-4">Loading...</div>;
  }

  const handleBookingSuccess = () => {
    setOpenBookingForm(false);
    setRescheduleData(null);
    loadAppointments();
  };

  const handleReschedule = (appointment: AppointmentWithPatient) => {
    setRescheduleData({ id: appointment.id, appointment });
    setOpenBookingForm(true);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      toast.success("Appointment cancelled");
      loadAppointments();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to cancel";
      toast.error(message);
    }
  };

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

        <button
          onClick={() => setOpenBookingForm(true)}
          className="group relative overflow-hidden rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 p-6 transition-all hover:border-primary-500 hover:shadow-md"
        >
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

      {/* Appointments Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Appointments for {formatDateReadable(selectedDate)}
          </h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-clinic-border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Appointments List */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon className="h-12 w-12 text-primary-400" />}
            title="No appointments"
            description="No appointments scheduled for this date"
            action={
              <Button variant="primary" onClick={() => setOpenBookingForm(true)}>
                Book Appointment
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 bg-white border border-clinic-border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold text-slate-900">
                    {formatTime12h(appointment.appointment_time)}
                  </div>
                  <div className="text-sm text-slate-600">
                    {appointment.duration_minutes} min
                  </div>
                  <div>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="flex-1 text-sm text-slate-700 ml-4">
                    {appointment.patient?.name}
                    {appointment.patient?.age && <span className="hidden md:inline"> • Age {appointment.patient.age}</span>}
                    {appointment.patient?.phone_number && ` • ${appointment.patient.phone_number}`}
                  </div>

                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleReschedule(appointment)}
                      disabled={appointment.status !== "scheduled"}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title={appointment.status !== "scheduled" ? "Can only reschedule scheduled appointments" : "Reschedule"}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <ConfirmInline
                      onConfirm={() => handleCancelAppointment(appointment.id)}
                      title="Cancel Appointment"
                      description={`Are you sure you want to cancel the appointment for ${appointment.patient?.name}?`}
                      disabled={!["scheduled", "checked-in"].includes(appointment.status)}
                    >
                      <button
                        disabled={!["scheduled", "checked-in"].includes(appointment.status)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          !["scheduled", "checked-in"].includes(appointment.status)
                            ? "Can only cancel scheduled or checked-in appointments"
                            : "Cancel"
                        }
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </ConfirmInline>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Form */}
      <BookingForm
        open={openBookingForm}
        onOpenChange={setOpenBookingForm}
        appointmentId={rescheduleData?.id}
        initialData={rescheduleData?.appointment}
        onSuccess={handleBookingSuccess}
      />
    </>
  );
}
