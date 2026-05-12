"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { ChevronLeftIcon, ChevronDownIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { formatDateReadable, formatTime12h } from "@/lib/utils";
import type { Patient } from "@/types";

interface Visit {
  id: string;
  appointment_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  duration_minutes: number;
  check_in_time?: string;
  completion_time?: string;
  free_text_notes?: string;
  field_values: Record<string, string | null>;
}

export default function DoctorPatientDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);

  const loadPatientAndVisits = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load patient
      const patientResponse = await fetch(`/api/patients/${params.id}`);
      if (!patientResponse.ok) {
        throw new Error("Failed to load patient");
      }
      const patientData = await patientResponse.json();
      setPatient(patientData.data);

      // Load visits for this patient
      const visitsResponse = await fetch(
        `/api/patients/${params.id}/visits`
      );
      if (visitsResponse.ok) {
        const visitsData = await visitsResponse.json();
        setVisits(visitsData.visits || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadPatientAndVisits();
  }, [loadPatientAndVisits]);

  if (!user) {
    return <LoadingOverlay message="Loading..." />;
  }

  if (isLoading) {
    return (
      <LoadingOverlay message="Loading patient details..." />
    );
  }

  if (!patient) {
    return (
      <>
        <div className="mb-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back
          </button>
        </div>
        <EmptyState
          title="Patient not found"
          description="The patient could not be loaded."
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-4"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Patients
        </button>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
          <Badge variant={patient.status === "active" ? "success" : "warning"}>
            {patient.status === "active" ? "Active" : "Inactive"}
          </Badge>
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
              <div className="text-slate-900 font-medium">{patient.sex}</div>
            </div>
          )}
        </div>
      </div>

      {/* Visit History */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Visit History ({visits.length})
        </h2>

        {visits.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon className="h-12 w-12 text-primary-400" />}
            title="No visits recorded"
            description="No visit documentation for this patient yet"
          />
        ) : (
          <div className="space-y-2">
            {visits.map((visit) => {
              const isExpanded = expandedVisitId === visit.id;
              return (
                <div
                  key={visit.id}
                  className="border border-clinic-border rounded-lg overflow-hidden"
                >
                  {/* Visit Summary */}
                  <button
                    onClick={() =>
                      setExpandedVisitId(isExpanded ? null : visit.id)
                    }
                    className="w-full p-4 bg-white hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-slate-900">
                            {formatDateReadable(visit.appointment_date)}
                          </span>
                          <span className="text-slate-600">
                            {formatTime12h(visit.appointment_time)}
                          </span>
                          <Badge variant="default">
                            {visit.duration_minutes} min
                          </Badge>
                          <Badge
                            variant={
                              visit.status === "completed"
                                ? "success"
                                : "default"
                            }
                          >
                            {visit.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <ChevronDownIcon
                          className={`h-5 w-5 text-slate-400 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Visit Details */}
                  {isExpanded && (
                    <div className="border-t border-clinic-border bg-slate-50 p-4 space-y-4">
                      {/* Doctor Notes */}
                      {visit.free_text_notes && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-2">
                            Doctor Notes
                          </h4>
                          <div className="bg-white border border-clinic-border rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap">
                            {visit.free_text_notes}
                          </div>
                        </div>
                      )}

                      {/* Visit Times */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {visit.check_in_time && (
                          <div>
                            <span className="text-slate-500">Check-in:</span>
                            <div className="text-slate-900">
                              {formatTime12h(visit.check_in_time)}
                            </div>
                          </div>
                        )}
                        {visit.completion_time && (
                          <div>
                            <span className="text-slate-500">Completed:</span>
                            <div className="text-slate-900">
                              {formatTime12h(visit.completion_time)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Field Values */}
                      {Object.keys(visit.field_values).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-2">
                            Documentation
                          </h4>
                          <div className="bg-white border border-clinic-border rounded-lg p-3 space-y-2">
                            {Object.entries(visit.field_values).map(
                              ([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="text-slate-600">{key}:</span>
                                  <span className="ml-2 text-slate-900">
                                    {value || "—"}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
