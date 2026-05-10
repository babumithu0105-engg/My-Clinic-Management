"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmInline } from "@/components/ui/ConfirmInline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";
import type { AppointmentWithPatient, VisitWithFields, VisitDocumentationField, Patient } from "@/types";

interface VisitSheetProps {
  appointment: AppointmentWithPatient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

interface VisitState {
  visit: VisitWithFields | null;
  patient: Patient | null;
  fields: VisitDocumentationField[];
  fieldValues: Record<string, string>;
  freeTextNotes: string;
  isSaving: boolean;
  isCompleting: boolean;
  isLoading: boolean;
}

export function VisitSheet({ appointment, open, onOpenChange, onComplete }: VisitSheetProps) {
  const [state, setState] = React.useState<VisitState>({
    visit: null,
    patient: null,
    fields: [],
    fieldValues: {},
    freeTextNotes: "",
    isSaving: false,
    isCompleting: false,
    isLoading: false,
  });

  // Initialize visit on open
  React.useEffect(() => {
    if (!open || !appointment) return;

    const initializeVisit = async () => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        // Fetch patient details
        const patientRes = await fetch(`/api/patients/${appointment.patient_id}`);
        if (!patientRes.ok) throw new Error("Failed to load patient");
        const patientData = await patientRes.json();

        // Fetch visit documentation fields
        const fieldsRes = await fetch("/api/admin/visit-fields");
        if (!fieldsRes.ok) throw new Error("Failed to load form fields");
        const fieldsData = await fieldsRes.json();

        // Create visit record
        const visitRes = await fetch("/api/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointment_id: appointment.id }),
        });
        if (!visitRes.ok) throw new Error("Failed to create visit");
        const visitData = await visitRes.json();

        // Initialize field values from visit
        const fieldValues: Record<string, string> = {};
        const fields = fieldsData.data || [];
        fields.forEach((field: VisitDocumentationField) => {
          fieldValues[field.id] = visitData.data?.field_values?.[field.id] || "";
        });

        setState((prev) => ({
          ...prev,
          visit: visitData.data,
          patient: patientData.data,
          fields,
          fieldValues,
          freeTextNotes: visitData.data?.free_text_notes || "",
          isLoading: false,
        }));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load visit data");
        setState((prev) => ({ ...prev, isLoading: false }));
        onOpenChange(false);
      }
    };

    initializeVisit();
  }, [open, appointment, onOpenChange]);

  const handleFieldChange = (fieldId: string, value: string) => {
    setState((prev) => ({
      ...prev,
      fieldValues: { ...prev.fieldValues, [fieldId]: value },
    }));
  };

  const handleSave = async () => {
    if (!state.visit) return;

    setState((prev) => ({ ...prev, isSaving: true }));

    try {
      const response = await fetch(`/api/visits/${state.visit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          free_text_notes: state.freeTextNotes,
          field_values: state.fieldValues,
          action: "save",
        }),
      });

      if (!response.ok) throw new Error("Failed to save visit");
      toast.success("Visit saved successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save visit");
    } finally {
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const handleComplete = async () => {
    if (!state.visit) return;

    setState((prev) => ({ ...prev, isCompleting: true }));

    try {
      const response = await fetch(`/api/visits/${state.visit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          free_text_notes: state.freeTextNotes,
          field_values: state.fieldValues,
          action: "complete",
        }),
      });

      if (!response.ok) throw new Error("Failed to complete visit");
      toast.success("Visit completed successfully");
      onOpenChange(false);
      onComplete?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete visit");
    } finally {
      setState((prev) => ({ ...prev, isCompleting: false }));
    }
  };

  const renderField = (field: VisitDocumentationField) => {
    const value = state.fieldValues[field.id] || "";

    const commonProps = {
      label: field.field_name,
      value,
      onChange: (e: any) => handleFieldChange(field.id, e.target.value),
      required: field.is_required,
      disabled: state.isSaving || state.isCompleting,
    };

    switch (field.field_type) {
      case "text":
        return <Input key={field.id} {...commonProps} type="text" />;
      case "number":
        return <Input key={field.id} {...commonProps} type="number" />;
      case "date":
        return (
          <DatePicker
            key={field.id}
            label={field.field_name}
            value={value}
            onChange={(date) => handleFieldChange(field.id, date)}
            required={field.is_required}
            disabled={state.isSaving || state.isCompleting}
          />
        );
      case "checkbox":
        return (
          <div key={field.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.id}
              checked={value === "true"}
              onChange={(e) => handleFieldChange(field.id, e.target.checked ? "true" : "")}
              disabled={state.isSaving || state.isCompleting}
              className="h-4 w-4"
            />
            <label htmlFor={field.id} className="text-sm font-medium text-slate-700">
              {field.field_name}
              {field.is_required && <span className="text-red-600"> *</span>}
            </label>
          </div>
        );
      case "dropdown":
        return (
          <Select key={field.id} {...commonProps}>
            <option value="">Select {field.field_name}</option>
            {(field.dropdown_options || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        );
      default:
        return <Input key={field.id} {...commonProps} type="text" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Patient Visit</SheetTitle>
          <SheetDescription>Document patient visit details</SheetDescription>
        </SheetHeader>

        {state.isLoading ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-32" />
            <Skeleton className="h-20" />
          </div>
        ) : state.patient && state.visit ? (
          <div className="mt-6 space-y-6">
            {/* Patient Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-slate-600">Name:</span>
                  <span className="text-sm text-slate-900">{state.patient.name}</span>
                </div>
                {state.patient.age && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-slate-600">Age:</span>
                    <span className="text-sm text-slate-900">{state.patient.age}</span>
                  </div>
                )}
                {state.patient.sex && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-slate-600">Sex:</span>
                    <span className="text-sm text-slate-900">{state.patient.sex}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-slate-600">Phone:</span>
                  <span className="text-sm text-slate-900">{state.patient.phone_number}</span>
                </div>
                {appointment?.receptionist_notes && (
                  <div className="pt-2 border-t">
                    <span className="text-sm font-medium text-slate-600">Receptionist Notes:</span>
                    <p className="text-sm text-slate-700 mt-1">{appointment.receptionist_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dynamic Fields */}
            {state.fields.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visit Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {state.fields.map((field) => renderField(field))}
                </CardContent>
              </Card>
            )}

            {/* Free Text Notes */}
            <Textarea
              label="Additional Notes"
              value={state.freeTextNotes}
              onChange={(e) =>
                setState((prev) => ({ ...prev, freeTextNotes: e.target.value }))
              }
              placeholder="Any additional observations or notes..."
              rows={4}
              disabled={state.isSaving || state.isCompleting}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => onOpenChange(false)}
                disabled={state.isSaving || state.isCompleting}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={handleSave}
                isLoading={state.isSaving}
                disabled={state.isCompleting}
              >
                Save
              </Button>
              <ConfirmInline
                onConfirm={handleComplete}
                title="Complete Visit?"
                description="This will mark the visit as complete. The patient will be removed from the queue."
                disabled={state.isCompleting}
              >
                <Button
                  type="button"
                  variant="primary"
                  isLoading={state.isCompleting}
                  disabled={state.isSaving}
                >
                  Complete
                </Button>
              </ConfirmInline>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
