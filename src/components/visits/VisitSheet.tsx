"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { ConfirmInline } from "@/components/ui/ConfirmInline";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { toast } from "sonner";
import { XMarkIcon, CheckIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
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
        const fields = fieldsData.fields || [];
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
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Patient Visit</SheetTitle>
          <SheetDescription>Document patient visit details</SheetDescription>
        </SheetHeader>

        {state.isLoading ? (
          <LoadingOverlay message="Loading patient visit..." />
        ) : state.patient && state.visit ? (
          <div className="mt-4 space-y-4 px-6">
            {/* Patient Info */}
            <div className="pb-4 border-b">
              <h3 className="font-semibold text-slate-900 mb-3">Patient Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 px-3 py-3 bg-blue-50 text-blue-900 rounded-lg">
                  <span className="text-xs font-medium text-blue-600 uppercase">Name</span>
                  <span className="text-sm font-semibold truncate">{state.patient.name}</span>
                </div>
                {state.patient.age && (
                  <div className="flex items-center gap-2 px-3 py-3 bg-green-50 text-green-900 rounded-lg">
                    <span className="text-xs font-medium text-green-600 uppercase">Age</span>
                    <span className="text-sm font-semibold">{state.patient.age}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-3 bg-orange-50 text-orange-900 rounded-lg">
                  <span className="text-xs font-medium text-orange-600 uppercase">Phone</span>
                  <span className="text-sm font-semibold truncate">{state.patient.phone_number}</span>
                </div>
                {state.patient.sex && (
                  <div className="flex items-center gap-2 px-3 py-3 bg-purple-50 text-purple-900 rounded-lg">
                    <span className="text-xs font-medium text-purple-600 uppercase">Sex</span>
                    <span className="text-sm font-semibold">{state.patient.sex}</span>
                  </div>
                )}
              </div>
              {appointment?.receptionist_notes && (
                <div className="bg-slate-50 rounded-lg p-3 mt-3">
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1">Receptionist Notes</p>
                  <p className="text-sm text-slate-700">{appointment.receptionist_notes}</p>
                </div>
              )}
            </div>

            {/* Dynamic Fields or Notes Section */}
            {state.fields.length > 0 ? (
              <>
                <div className="pb-4 border-b">
                  <h3 className="font-semibold text-slate-900 mb-3">Visit Details</h3>
                  <div className="space-y-4">
                    {state.fields.map((field) => renderField(field))}
                  </div>
                </div>

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
              </>
            ) : (
              <div className="pb-4">
                <h3 className="font-semibold text-slate-900 mb-3">Visit Notes</h3>
                <Textarea
                  value={state.freeTextNotes}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, freeTextNotes: e.target.value }))
                  }
                  placeholder="Document patient visit observations, symptoms, diagnosis, treatment plan, and any other relevant information..."
                  rows={8}
                  disabled={state.isSaving || state.isCompleting}
                />
                <p className="text-sm text-slate-500 mt-2">
                  Tip: Custom visit fields can be configured in Admin → Visit Fields
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-6 pb-4 px-4 border-t justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={state.isSaving || state.isCompleting}
                className="flex items-center justify-center gap-2 px-6 h-10 rounded-lg font-medium min-w-[100px]"
              >
                <XMarkIcon className="w-5 h-5" />
                <span>Close</span>
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
                isLoading={state.isSaving}
                disabled={state.isCompleting}
                className="flex items-center justify-center gap-2 px-6 h-10 rounded-lg font-semibold min-w-[100px]"
              >
                {!state.isSaving && <CheckIcon className="w-5 h-5" />}
                <span>{state.isSaving ? "Saving..." : "Save"}</span>
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
                  className="flex items-center justify-center gap-2 px-6 h-10 rounded-lg font-semibold min-w-[100px]"
                >
                  {!state.isCompleting && <CheckCircleIcon className="w-5 h-5" />}
                  <span>{state.isCompleting ? "Completing..." : "Complete"}</span>
                </Button>
              </ConfirmInline>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
