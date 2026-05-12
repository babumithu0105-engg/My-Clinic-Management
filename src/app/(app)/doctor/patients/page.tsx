"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { UserGroupIcon, CalendarIcon } from "@heroicons/react/24/outline";
import type { Patient } from "@/types";

const ITEMS_PER_PAGE = 10;

export default function DoctorPatientsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPatients(1);
  }, []);

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

  const handleViewDetails = (patient: Patient) => {
    window.location.href = `/doctor/patients/${patient.id}`;
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
          description={search ? `No patients match "${search}"` : "Patients will appear here"}
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
                  onClick={() => handleViewDetails(patient)}
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
                    onClick={() => handleViewDetails(patient)}
                    className="text-slate-500 hover:text-primary-600 transition-colors p-1"
                    title="View visits"
                  >
                    <CalendarIcon className="h-4 w-4" />
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
                <button
                  onClick={() => loadPatients(currentPage - 1, search)}
                  disabled={!hasPrevPage || isLoading}
                  className="px-3 py-2 rounded-lg border border-clinic-border text-slate-900 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Previous
                </button>
                <button
                  onClick={() => loadPatients(currentPage + 1, search)}
                  disabled={!hasNextPage || isLoading}
                  className="px-3 py-2 rounded-lg border border-clinic-border text-slate-900 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
