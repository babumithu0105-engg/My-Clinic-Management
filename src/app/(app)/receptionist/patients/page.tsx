"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { PatientForm } from "@/components/patients/PatientForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/Sheet";
import { UserGroupIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { Patient, AppointmentWithPatient } from "@/types";

const ITEMS_PER_PAGE = 10;

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [openAddForm, setOpenAddForm] = useState(false);
  const [, setSelectedPatient] = useState<Patient | null>(null);
  const [patientDetails, setPatientDetails] = useState<(Patient & { appointments?: AppointmentWithPatient[] }) | null>(null);
  const [openDetails, setOpenDetails] = useState(false);

  // Load patients on mount and when page changes
  useEffect(() => {
    loadPatients(1);
  }, []);

  // Load patients when search changes
  useEffect(() => {
    if (search) {
      loadPatients(1, search);
    } else {
      loadPatients(1);
    }
  }, [search]);

  const loadPatients = async (page: number, query?: string) => {
    setIsLoading(true);
    setCurrentPage(page);
    try {
      const skip = (page - 1) * ITEMS_PER_PAGE;
      let url = `/api/patients?skip=${skip}&limit=${ITEMS_PER_PAGE}`;
      if (query) {
        url += `&search=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to load patients");
      }
      const { data, total } = await response.json();
      setResults(data);
      setTotal(total);
    } catch (error) {
      console.error("Error loading patients:", error);
      setResults([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/patients/${patient.id}`);
      if (!response.ok) {
        throw new Error("Failed to load patient details");
      }
      const data = await response.json();
      setPatientDetails(data);
      setOpenDetails(true);
    } catch (error) {
      console.error("Error loading patient details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientSuccess = async () => {
    setOpenAddForm(false);
    // Reload the first page to show the new patient
    loadPatients(1);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <>
      <PageHeader
        title="Patients"
        description={`${total} patient${total !== 1 ? 's' : ''} in system`}
        action={
          <Button
            variant="primary"
            onClick={() => setOpenAddForm(true)}
          >
            Add Patient
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="mb-6">
        <Input
          placeholder="Search by name or phone number..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* Results */}
      {isLoading && results.length === 0 ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={<UserGroupIcon className="h-12 w-12 text-primary-400" />}
          title={search ? "No patients found" : "No patients yet"}
          description={search ? `No patients match "${search}"` : "Add your first patient to get started"}
          action={
            <Button
              variant="primary"
              onClick={() => setOpenAddForm(true)}
            >
              Add Patient
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-2 mb-6">
            {results.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handleSelectPatient(patient)}
                className="w-full p-4 bg-white border border-clinic-border rounded-lg hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {patient.name}
                    </div>
                    <div className="text-sm text-slate-500">
                      {patient.phone_number}
                      {patient.age && ` • Age: ${patient.age}`}
                      {patient.sex && ` • ${patient.sex}`}
                    </div>
                  </div>
                  <PencilIcon className="h-5 w-5 text-primary-500 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-clinic-border pt-4">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {totalPages} • Showing {results.length} of {total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => loadPatients(currentPage - 1, search)}
                  disabled={!hasPrevPage || isLoading}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => loadPatients(currentPage + 1, search)}
                  disabled={!hasNextPage || isLoading}
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Patient Form */}
      <PatientForm
        open={openAddForm}
        onOpenChange={setOpenAddForm}
        onSuccess={() => handlePatientSuccess()}
      />

      {/* Patient Details Sheet */}
      <Sheet open={openDetails} onOpenChange={setOpenDetails}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{patientDetails?.name}</SheetTitle>
            <SheetDescription>Patient details and history</SheetDescription>
          </SheetHeader>

          {patientDetails && (
            <div className="mt-6 space-y-4">
              {/* Patient Info */}
              <div className="space-y-3 pb-4 border-b border-clinic-border">
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase">
                    Phone
                  </div>
                  <div className="text-sm text-slate-900">
                    {patientDetails.phone_number}
                  </div>
                </div>
                {patientDetails.age && (
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">
                      Age
                    </div>
                    <div className="text-sm text-slate-900">
                      {patientDetails.age} years
                    </div>
                  </div>
                )}
                {patientDetails.sex && (
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">
                      Sex
                    </div>
                    <div className="text-sm text-slate-900">
                      {patientDetails.sex === "M"
                        ? "Male"
                        : patientDetails.sex === "F"
                        ? "Female"
                        : "Other"}
                    </div>
                  </div>
                )}
                {patientDetails.address && (
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase">
                      Address
                    </div>
                    <div className="text-sm text-slate-900">
                      {patientDetails.address}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Appointments */}
              {patientDetails.appointments && patientDetails.appointments.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Recent Appointments
                  </div>
                  <div className="space-y-2">
                    {patientDetails.appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="text-sm p-2 bg-slate-50 rounded border border-clinic-border"
                      >
                        <div className="font-medium text-slate-900">
                          {apt.appointment_date} at {apt.appointment_time}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Duration: {apt.duration_minutes}min • Status:{" "}
                          <span className="capitalize">{apt.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <SheetFooter className="pt-4">
            <Button
              variant="primary"
              onClick={() => {
                // TODO: Open edit form for patient
                setOpenDetails(false);
              }}
              fullWidth
            >
              Edit Patient
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
