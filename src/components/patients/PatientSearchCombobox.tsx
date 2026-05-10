"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { PatientForm } from "./PatientForm";
import type { Patient } from "@/types";

interface PatientSearchComboboxProps {
  onSelect: (patient: Patient) => void;
  placeholder?: string;
  className?: string;
}

export function PatientSearchCombobox({
  onSelect,
  placeholder = "Search by name or phone...",
  className = "",
}: PatientSearchComboboxProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [openAddForm, setOpenAddForm] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!search.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/patients?search=${encodeURIComponent(search)}`
        );
        if (!response.ok) {
          throw new Error("Search failed");
        }
        const data = await response.json();
        setResults(data.data || []);
        setShowDropdown(true);
      } catch (error) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const handleSelect = (patient: Patient) => {
    onSelect(patient);
    setSearch("");
    setShowDropdown(false);
    setResults([]);
  };

  const handleNewPatientSuccess = (patient: Patient) => {
    handleSelect(patient);
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => search && setShowDropdown(true)}
      />

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-clinic-border rounded-lg shadow-lg z-50">
          {isLoading ? (
            <div className="p-2 space-y-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {results.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelect(patient)}
                  className="w-full text-left px-4 py-3 hover:bg-primary-50 border-b border-clinic-border last:border-b-0 transition-colors"
                >
                  <div className="font-medium text-slate-900">{patient.name}</div>
                  <div className="text-sm text-slate-500">
                    {patient.phone_number}
                    {patient.age && ` • Age: ${patient.age}`}
                  </div>
                </button>
              ))}
            </div>
          ) : search.trim() ? (
            <div className="p-4">
              <EmptyState
                title="No patients found"
                description={`No patients match "${search}"`}
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setOpenAddForm(true);
                      setShowDropdown(false);
                    }}
                  >
                    Add New Patient
                  </Button>
                }
              />
            </div>
          ) : null}
        </div>
      )}

      <PatientForm
        open={openAddForm}
        onOpenChange={setOpenAddForm}
        onSuccess={handleNewPatientSuccess}
      />
    </div>
  );
}
