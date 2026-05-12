"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { PatientSearchCombobox } from "@/components/patients/PatientSearchCombobox";
import { toast } from "sonner";
import { format } from "date-fns";

interface WalkInFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WalkInForm({ open, onOpenChange, onSuccess }: WalkInFormProps) {
  const [selectedPatient, setSelectedPatient] = React.useState<{ id: string; name: string; phone_number: string } | null>(null);
  const [duration, setDuration] = React.useState<string>("30");
  const [notes, setNotes] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [durations, setDurations] = React.useState<string[]>(["15", "30", "45"]);

  // Fetch available durations
  React.useEffect(() => {
    const fetchDurations = async () => {
      try {
        const response = await fetch("/api/config/duration-options");
        if (response.ok) {
          const data = await response.json();
          setDurations(data.data || ["15", "30", "45"]);
        }
      } catch (error) {
        console.error("Error fetching durations:", error);
      }
    };
    fetchDurations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    setIsLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          appointment_date: today,
          duration_minutes: parseInt(duration),
          receptionist_notes: notes || null,
          is_walk_in: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add walk-in");
      }

      toast.success("Walk-in added successfully");
      setSelectedPatient(null);
      setDuration("30");
      setNotes("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add walk-in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Add Walk-in Patient</SheetTitle>
          <SheetDescription>Check in a walk-in patient to the queue</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto sheet-scrollable px-6 py-6 space-y-5">
          {/* Patient Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Patient <span className="text-red-500 ml-0.5">*</span>
            </label>
            {selectedPatient ? (
              <div className="px-3 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 flex items-center justify-between">
                <div>
                  <div className="font-medium">{selectedPatient.name}</div>
                  <div className="text-sm text-slate-500">{selectedPatient.phone_number}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="text-slate-400 hover:text-slate-600"
                  title="Change patient"
                >
                  ✕
                </button>
              </div>
            ) : (
              <PatientSearchCombobox
                onSelect={(patient) => setSelectedPatient({ id: patient.id, name: patient.name, phone_number: patient.phone_number })}
                placeholder="Search or add patient..."
              />
            )}
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Duration (minutes) <span className="text-red-500 ml-0.5">*</span>
            </label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durations.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <Textarea
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., fever, cough, follow-up..."
            rows={3}
          />

          <div className="flex gap-3 pt-5 mt-6 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Add Walk-in
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
