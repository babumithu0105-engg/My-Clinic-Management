"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { PatientSearchCombobox } from "@/components/patients/PatientSearchCombobox";
import { formatTime12h, formatDateReadable, getCurrentDate } from "@/lib/utils";
import type { Patient, AppointmentWithPatient } from "@/types";

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (appointment: AppointmentWithPatient) => void;
  appointmentId?: string;
  initialData?: Partial<AppointmentWithPatient>;
}

export function BookingForm({
  open,
  onOpenChange,
  appointmentId,
  initialData,
  onSuccess,
}: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [date, setDate] = useState(getCurrentDate());
  const [duration, setDuration] = useState("30");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [durationOptions, setDurationOptions] = useState<string[]>(["15", "30", "45"]);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const isEditMode = !!appointmentId;
  const title = isEditMode ? "Reschedule Appointment" : "Book Appointment";

  // Initialize form from initialData (reschedule mode)
  useEffect(() => {
    if (initialData && isEditMode && open) {
      if (initialData.patient) {
        setSelectedPatient(initialData.patient as Patient);
      }
      if (initialData.appointment_date) {
        setDate(initialData.appointment_date);
      }
      if (initialData.duration_minutes) {
        setDuration(initialData.duration_minutes.toString());
      }
      if (initialData.appointment_time) {
        setSelectedTime(initialData.appointment_time);
      }
      if (initialData.receptionist_notes) {
        setNotes(initialData.receptionist_notes);
      }
    }
  }, [initialData, isEditMode, open]);

  // Fetch duration options on mount
  useEffect(() => {
    const fetchDurationOptions = async () => {
      try {
        const response = await fetch("/api/config/duration-options");
        if (response.ok) {
          const data = await response.json();
          setDurationOptions(data.options || ["15", "30", "45"]);
        }
      } catch (error) {
        console.error("Failed to fetch duration options:", error);
      }
    };

    if (open) {
      fetchDurationOptions();
    }
  }, [open]);

  // Fetch available slots when date or duration changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!date || !duration || !selectedPatient) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        let url = `/api/appointments/available-slots?date=${date}&duration=${duration}`;
        if (isEditMode && appointmentId) {
          url += `&excludeId=${appointmentId}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch available slots");
        }
        const data = await response.json();
        setSlots(data.slots || []);

        // Clear selected time if it's no longer available
        if (selectedTime && !data.slots.includes(selectedTime)) {
          setSelectedTime(null);
        }
      } catch (error) {
        console.error("Error fetching slots:", error);
        setSlots([]);
        toast.error("Failed to load available slots");
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [date, duration, selectedPatient, isEditMode, appointmentId, selectedTime]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedTime(null); // Reset selected time when patient changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient || !date || !duration || !selectedTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const url = isEditMode ? `/api/appointments/${appointmentId}` : "/api/appointments";
      const method = isEditMode ? "PUT" : "POST";

      const payload = isEditMode
        ? {
            appointment_date: date,
            appointment_time: selectedTime,
            duration_minutes: parseInt(duration),
            receptionist_notes: notes || null,
          }
        : {
            patient_id: selectedPatient.id,
            appointment_date: date,
            appointment_time: selectedTime,
            duration_minutes: parseInt(duration),
            receptionist_notes: notes || null,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save appointment");
      }

      const appointment = await response.json();
      toast.success(
        isEditMode ? "Appointment rescheduled successfully" : "Appointment booked successfully"
      );
      onSuccess(appointment);
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {isEditMode ? "Change the appointment date or time" : "Select a patient and available time slot"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto sheet-scrollable px-6 py-6 space-y-5">
          {/* Patient */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Patient {!isEditMode && <span className="text-red-500 ml-0.5">*</span>}
            </label>
              {selectedPatient ? (
                <div className="px-3 py-2.5 border border-clinic-border rounded-lg bg-slate-50 text-slate-900 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{selectedPatient.name}</div>
                    <div className="text-sm text-slate-500">{selectedPatient.phone_number}</div>
                  </div>
                  {!isEditMode && (
                    <button
                      type="button"
                      onClick={() => setSelectedPatient(null)}
                      className="text-slate-400 hover:text-slate-600"
                      title="Change patient"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ) : (
                <PatientSearchCombobox
                  onSelect={handlePatientSelect}
                  placeholder="Search patient..."
                />
              )}
          </div>

          {/* Date */}
          <Input
            label="Appointment Date *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={getCurrentDate()}
            disabled={isLoading}
          />

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Duration (minutes) <span className="text-red-500 ml-0.5">*</span>
            </label>
            <Select value={duration} onValueChange={setDuration} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Slots */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Select Time <span className="text-red-500 ml-0.5">*</span>
            </label>
            {!selectedPatient ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 text-center">
                Select a patient first
              </div>
            ) : slotsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : slots.length === 0 ? (
              <EmptyState
                title="No slots available"
                description={`No available times for ${formatDateReadable(date)}`}
              />
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    disabled={isLoading}
                    className={`p-2.5 rounded-lg border transition-colors text-sm font-medium ${
                      selectedTime === slot
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-white border-slate-300 text-slate-900 hover:bg-slate-50"
                    } disabled:opacity-50`}
                  >
                    {formatTime12h(slot)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <Textarea
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes (optional)"
            disabled={isLoading}
            rows={3}
          />

          {/* Footer */}
          <SheetFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading || !selectedPatient || !selectedTime}
              fullWidth
            >
              {isEditMode ? "Reschedule" : "Book"} Appointment
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
