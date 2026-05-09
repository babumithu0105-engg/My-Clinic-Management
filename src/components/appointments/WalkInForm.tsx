"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { PatientSearchCombobox } from "@/components/patients/PatientSearchCombobox";
import { toast } from "sonner";
import { format } from "date-fns";

interface WalkInFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WalkInForm({ open, onOpenChange, onSuccess }: WalkInFormProps) {
  const [patientId, setPatientId] = React.useState<string>("");
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

    if (!patientId) {
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
          patient_id: patientId,
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
      setPatientId("");
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
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add Walk-in Patient</SheetTitle>
          <SheetDescription>Check in a walk-in patient to the queue</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Patient Selection */}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Patient <span className="text-red-600">*</span>
            </label>
            <PatientSearchCombobox
              value={patientId}
              onSelect={setPatientId}
              placeholder="Search or add patient..."
            />
          </div>

          {/* Duration */}
          <Select
            label="Duration (minutes)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          >
            <option value="">Select duration</option>
            {durations.map((d) => (
              <option key={d} value={d}>
                {d} minutes
              </option>
            ))}
          </Select>

          {/* Notes */}
          <Textarea
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., fever, cough, follow-up..."
            rows={3}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
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
