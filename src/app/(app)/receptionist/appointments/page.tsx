"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { CalendarIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { formatTime12h, formatDateReadable } from "@/lib/utils";
import type { AppointmentWithPatient } from "@/types";

type TabType = "past" | "future";
type DateRangeType = "week" | "month" | "3months" | "6months" | "year";

interface AppointmentsResponse {
  data: AppointmentWithPatient[];
  total: number;
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("past");
  const [dateRange, setDateRange] = useState<DateRangeType>("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  // Extract patient from URL query param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const patientName = params.get("patient");
    if (patientName) {
      setSearchQuery(patientName);
    }
  }, []);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        tab: activeTab,
        dateRange,
        search: searchQuery,
      });

      const response = await fetch(`/api/appointments/history?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load appointments");
      }
      const data: AppointmentsResponse = await response.json();
      setAppointments(data.data || []);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Failed to load appointments");
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, dateRange, searchQuery]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

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

  const groupByDate = (appts: AppointmentWithPatient[]) => {
    const groups: Record<string, AppointmentWithPatient[]> = {};
    appts.forEach((apt) => {
      const date = apt.appointment_date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(apt);
    });
    return groups;
  };

  const dateRangeOptions: { label: string; value: DateRangeType }[] = [
    { label: "Week", value: "week" },
    { label: "1 Month", value: "month" },
    { label: "3 Months", value: "3months" },
    { label: "6 Months", value: "6months" },
    { label: "1 Year", value: "year" },
  ];

  return (
    <>
      <PageHeader
        title="Appointments"
        description="View all past and upcoming appointments"
      />

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-clinic-border">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("past")}
            className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${
              activeTab === "past"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setActiveTab("future")}
            className={`pb-3 px-1 font-medium text-sm transition-colors border-b-2 ${
              activeTab === "future"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Future
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <Input
          placeholder="Search by patient name or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />

        {/* Date Range Pills */}
        <div className="flex gap-2 flex-wrap">
          {dateRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                dateRange === option.value
                  ? "bg-primary-500 text-white"
                  : "bg-slate-100 text-slate-900 hover:bg-slate-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
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
          icon={<CalendarIcon className="h-12 w-12 text-slate-300" />}
          title={`No ${activeTab} appointments`}
          description={`No ${activeTab} appointments found for the selected date range`}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupByDate(appointments)).map(([date, dateAppointments]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200">
                {formatDateReadable(date)}
              </h3>
              <div className="space-y-1">
                {dateAppointments.map((appointment) => (
                  <div key={appointment.id} className="space-y-2">
                    <div className="p-3 bg-white border border-clinic-border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex-1 flex items-center gap-3">
                          <span className="font-medium text-slate-900">
                            {appointment.patient?.name}
                          </span>
                          {appointment.patient?.phone_number && (
                            <span className="text-slate-500">
                              {appointment.patient.phone_number}
                            </span>
                          )}
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">
                            {formatTime12h(appointment.appointment_time)}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">
                            {appointment.duration_minutes} min
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {getStatusBadge(appointment.status)}
                          <div className="w-5">
                            {activeTab === "past" && appointment.receptionist_notes && (
                              <button
                                onClick={() => toggleNotes(appointment.id)}
                                className="text-slate-500 hover:text-slate-700 transition-colors"
                                title={expandedNotes.has(appointment.id) ? "Collapse notes" : "Expand notes"}
                              >
                                <DocumentTextIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded appointment notes */}
                      {expandedNotes.has(appointment.id) && appointment.receptionist_notes && (
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <p className="text-xs text-slate-700">
                            {appointment.receptionist_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
