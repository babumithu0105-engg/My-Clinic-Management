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
import { WalkInForm } from "@/components/appointments/WalkInForm";
import { CalendarIcon, UserGroupIcon, UserPlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatTime12h, formatDateReadable, getCurrentDate } from "@/lib/utils";
import type { AppointmentWithPatient, QueueResponse } from "@/types";

type TabType = "queue" | "schedule";

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const { business_id, role } = useBusiness();
  const [activeTab, setActiveTab] = useState<TabType>("queue");

  // Queue state
  const [queue, setQueue] = useState<QueueResponse | null>(null);
  const [queueLoading, setQueueLoading] = useState(true);

  // Schedule state
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  // Form states
  const [openBookingForm, setOpenBookingForm] = useState(false);
  const [openWalkInForm, setOpenWalkInForm] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<{ id: string; appointment: AppointmentWithPatient } | null>(null);

  // Load queue (today)
  const loadQueue = useCallback(async () => {
    setQueueLoading(true);
    try {
      const response = await fetch("/api/queue");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load queue");
      }
      const responseData = await response.json();
      const queueData = responseData.data || responseData;
      setQueue(queueData || { booked: [], walk_ins: [] });
    } catch (error) {
      console.error("Error loading queue:", error);
      setQueue({ booked: [], walk_ins: [] });
    } finally {
      setQueueLoading(false);
    }
  }, []);

  // Load appointments for selected date
  const loadAppointments = useCallback(async () => {
    setScheduleLoading(true);
    try {
      const response = await fetch(`/api/appointments?date=${selectedDate}`);
      if (!response.ok) throw new Error("Failed to load appointments");
      const data = await response.json();
      setAppointments(data.data || []);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Failed to load appointments");
      setAppointments([]);
    } finally {
      setScheduleLoading(false);
    }
  }, [selectedDate]);

  // Load data when tab changes or inputs change
  useEffect(() => {
    if (activeTab === "queue") {
      loadQueue();
    }
  }, [activeTab, loadQueue]);

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
    loadQueue();
  };

  const handleWalkInSuccess = () => {
    setOpenWalkInForm(false);
    loadQueue();
  };

  const handleReschedule = (appointment: AppointmentWithPatient) => {
    setRescheduleData({ id: appointment.id, appointment });
    setOpenBookingForm(true);
  };

  const handleSendToDoctor = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "checked-in" }),
      });

      if (!response.ok) throw new Error("Failed to send patient to doctor");
      toast.success("Patient sent to doctor");
      loadQueue();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send patient");
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (!response.ok) throw new Error("Failed to cancel appointment");
      toast.success("Appointment cancelled");
      loadAppointments();
      loadQueue();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to cancel");
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
        <button
          onClick={() => setOpenWalkInForm(true)}
          className="group relative overflow-hidden rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 p-6 transition-all hover:border-primary-500 hover:shadow-md"
        >
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

        <button
          onClick={() => setActiveTab("queue")}
          className="group relative overflow-hidden rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 p-6 transition-all hover:border-primary-500 hover:shadow-md"
        >
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

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-clinic-border">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("queue")}
            className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${
              activeTab === "queue"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Today's Queue
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${
              activeTab === "schedule"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Schedule
          </button>
        </div>
      </div>

      {/* Queue Tab */}
      {activeTab === "queue" && (
        <div className="mb-8">
          {queueLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : !queue || (queue.booked.length === 0 && queue.walk_ins.length === 0) ? (
            <EmptyState
              icon={<UserGroupIcon className="h-12 w-12 text-primary-400" />}
              title="No patients in queue"
              description="All patients have been completed or no patients are scheduled for today"
              action={
                <Button variant="primary" onClick={() => setOpenBookingForm(true)}>
                  Book Appointment
                </Button>
              }
            />
          ) : (
            <div className="space-y-6">
              {/* Booked Queue */}
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
                          <div className="font-semibold text-slate-900 min-w-fit">
                            {formatTime12h(appointment.appointment_time)}
                          </div>
                          <div className="text-sm text-slate-600 min-w-fit">
                            {appointment.duration_minutes} min
                          </div>
                          <div className="min-w-fit">
                            {getStatusBadge(appointment.status)}
                          </div>
                          <div className="flex-1 text-sm text-slate-700 ml-4">
                            {appointment.patient?.name}
                            {appointment.patient?.age && (
                              <span className="hidden md:inline"> • Age {appointment.patient.age}</span>
                            )}
                            {appointment.patient?.phone_number && ` • ${appointment.patient.phone_number}`}
                          </div>

                          <div className="flex gap-2 ml-4 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendToDoctor(appointment.id)}
                              disabled={appointment.status !== "scheduled"}
                              title={
                                appointment.status !== "scheduled"
                                  ? "Patient already sent or completed"
                                  : "Send to Doctor"
                              }
                            >
                              Send to Doctor
                            </Button>
                            <button
                              onClick={() => handleReschedule(appointment)}
                              disabled={appointment.status !== "scheduled"}
                              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              title={
                                appointment.status !== "scheduled"
                                  ? "Can only reschedule scheduled appointments"
                                  : "Reschedule"
                              }
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
                </div>
              )}

              {/* Walk-ins Queue */}
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
                          <div className="font-semibold text-slate-900 min-w-fit">
                            {formatTime12h(appointment.appointment_time)}
                          </div>
                          <div className="text-sm text-slate-600 min-w-fit">
                            {appointment.duration_minutes} min
                          </div>
                          <div className="min-w-fit">
                            <Badge variant="info">Walk-in</Badge>
                          </div>
                          <div className="flex-1 text-sm text-slate-700 ml-4">
                            {appointment.patient?.name}
                            {appointment.patient?.age && (
                              <span className="hidden md:inline"> • Age {appointment.patient.age}</span>
                            )}
                            {appointment.patient?.phone_number && ` • ${appointment.patient.phone_number}`}
                          </div>

                          <div className="flex gap-2 ml-4 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendToDoctor(appointment.id)}
                              disabled={appointment.status !== "scheduled"}
                            >
                              Send to Doctor
                            </Button>
                            <ConfirmInline
                              onConfirm={() => handleCancelAppointment(appointment.id)}
                              title="Cancel Walk-in"
                              description={`Are you sure you want to remove ${appointment.patient?.name} from the queue?`}
                              disabled={!["scheduled", "checked-in"].includes(appointment.status)}
                            >
                              <button
                                disabled={!["scheduled", "checked-in"].includes(appointment.status)}
                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </ConfirmInline>
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
      )}

      {/* Schedule Tab */}
      {activeTab === "schedule" && (
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

          {scheduleLoading ? (
            <div className="space-y-3">
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
      )}

      {/* Booking Form */}
      <BookingForm
        open={openBookingForm}
        onOpenChange={setOpenBookingForm}
        appointmentId={rescheduleData?.id}
        initialData={rescheduleData?.appointment}
        onSuccess={handleBookingSuccess}
      />

      {/* Walk-in Form */}
      <WalkInForm
        open={openWalkInForm}
        onOpenChange={setOpenWalkInForm}
        onSuccess={handleWalkInSuccess}
      />
    </>
  );
}
