"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { PatientForm } from "@/components/patients/PatientForm";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { UserGroupIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";
import type { Patient, AppointmentWithPatient } from "@/types";

const ITEMS_PER_PAGE = 10;

export default function PatientsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [openAddForm, setOpenAddForm] = useState(false);
  const [, setSelectedPatient] = useState<Patient | null>(null);
  const [patientDetails, setPatientDetails] = useState<(Patient & { appointments?: AppointmentWithPatient[] }) | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Patient>>({});

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

  const handleEditField = (field: string, value: string | number) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async (field: string) => {
    if (!patientDetails) return;
    const newValue = editValues[field as keyof Patient];
    if (newValue === patientDetails[field as keyof Patient]) {
      setEditingField(null);
      return;
    }

    try {
      const response = await fetch(`/api/patients/${patientDetails.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (!response.ok) throw new Error("Failed to update patient");

      setPatientDetails((prev) => prev ? { ...prev, [field]: newValue } : null);
      setEditingField(null);
      toast.success("Patient updated");
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error("Failed to update patient");
    }
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  if (!user) {
    return <LoadingOverlay message="Loading..." />;
  }

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
          <div className="space-y-1 mb-6">
            {results.map((patient) => (
              <div
                key={patient.id}
                className="p-3 bg-white border border-clinic-border rounded-lg hover:shadow-md transition-shadow flex items-center justify-between text-sm"
              >
                <button
                  onClick={() => window.location.href = `/receptionist/patients/${patient.id}/appointments`}
                  className="flex-1 text-left flex items-center gap-3"
                >
                  <span className="font-semibold text-slate-900">{patient.name}</span>
                  <span className="text-slate-500">{patient.phone_number}</span>
                  {patient.age && <span className="text-slate-500">Age: {patient.age}</span>}
                  {patient.sex && <span className="text-slate-500">{patient.sex}</span>}
                  {patient.status && (
                    <Badge variant={patient.status === "active" ? "success" : "warning"}>
                      {patient.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  )}
                </button>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <button
                    onClick={() => window.location.href = `/receptionist/patients/${patient.id}/appointments`}
                    className="text-slate-500 hover:text-primary-600 transition-colors p-1"
                    title="View appointments"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleSelectPatient(patient)}
                    className="text-primary-500 hover:text-primary-600 transition-colors p-1"
                    title="Edit patient"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
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
          </SheetHeader>

          {patientDetails && (
            <div className="mt-6 space-y-4">
              {/* Patient Info - Editable */}
              <div className="space-y-4 pb-4 border-b border-clinic-border">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  {editingField === "phone_number" ? (
                    <input
                      type="tel"
                      value={editValues.phone_number || patientDetails.phone_number}
                      onChange={(e) => handleEditField("phone_number", e.target.value)}
                      onBlur={() => handleSaveEdit("phone_number")}
                      autoFocus
                      className="w-full px-3 py-2 rounded-lg border border-clinic-border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors text-sm"
                      placeholder="10-digit phone number"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditingField("phone_number");
                        setEditValues({ phone_number: patientDetails.phone_number });
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-900 bg-slate-50 hover:bg-slate-100 border border-clinic-border rounded-lg transition-colors"
                    >
                      {patientDetails.phone_number}
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Age
                  </label>
                  {editingField === "age" ? (
                    <input
                      type="number"
                      value={editValues.age ?? patientDetails.age ?? ""}
                      onChange={(e) => handleEditField("age", parseInt(e.target.value) || 0)}
                      onBlur={() => handleSaveEdit("age")}
                      autoFocus
                      className="w-full px-3 py-2 rounded-lg border border-clinic-border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors text-sm"
                      placeholder="Age in years"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditingField("age");
                        setEditValues({ age: patientDetails.age });
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-900 bg-slate-50 hover:bg-slate-100 border border-clinic-border rounded-lg transition-colors"
                    >
                      {patientDetails.age ? `${patientDetails.age} years` : "Not set"}
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sex
                  </label>
                  {editingField === "sex" ? (
                    <select
                      value={(editValues.sex as string) || patientDetails.sex || ""}
                      onChange={(e) => handleEditField("sex", e.target.value)}
                      onBlur={() => handleSaveEdit("sex")}
                      autoFocus
                      className="w-full px-3 py-2 rounded-lg border border-clinic-border bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors text-sm"
                    >
                      <option value="">Select sex...</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingField("sex");
                        setEditValues({ sex: patientDetails.sex });
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-900 bg-slate-50 hover:bg-slate-100 border border-clinic-border rounded-lg transition-colors"
                    >
                      {patientDetails.sex === "M"
                        ? "Male"
                        : patientDetails.sex === "F"
                        ? "Female"
                        : "Not set"}
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Address
                  </label>
                  {editingField === "address" ? (
                    <textarea
                      value={editValues.address || patientDetails.address || ""}
                      onChange={(e) => handleEditField("address", e.target.value)}
                      onBlur={() => handleSaveEdit("address")}
                      autoFocus
                      className="w-full px-3 py-2 rounded-lg border border-clinic-border bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors text-sm resize-none"
                      rows={3}
                      placeholder="Patient address"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditingField("address");
                        setEditValues({ address: patientDetails.address });
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-900 bg-slate-50 hover:bg-slate-100 border border-clinic-border rounded-lg transition-colors"
                    >
                      {patientDetails.address || "Not set"}
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
