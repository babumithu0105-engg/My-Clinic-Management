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
import type { Patient } from "@/types";

interface PatientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  initialData?: Partial<Patient>;
  onSuccess: (patient: Patient) => void;
}

export function PatientForm({
  open,
  onOpenChange,
  patientId,
  initialData,
  onSuccess,
}: PatientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    phone_number: initialData?.phone_number || "",
    age: initialData?.age || "",
    sex: initialData?.sex || "",
    address: initialData?.address || "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        phone_number: initialData.phone_number || "",
        age: initialData.age?.toString() || "",
        sex: initialData.sex || "",
        address: initialData.address || "",
      });
    }
  }, [initialData, open]);

  const isEditMode = !!patientId;
  const title = isEditMode ? "Edit Patient" : "Add Patient";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone is required";
    } else if (formData.phone_number.length < 7) {
      newErrors.phone_number = "Phone must be at least 7 digits";
    }
    if (formData.age && isNaN(Number(formData.age))) {
      newErrors.age = "Age must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const url = isEditMode ? `/api/patients/${patientId}` : "/api/patients";
      const method = isEditMode ? "PUT" : "POST";

      const payload = {
        name: formData.name,
        phone_number: formData.phone_number,
        age: formData.age ? Number(formData.age) : null,
        sex: formData.sex || null,
        address: formData.address || null,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save patient");
      }

      const patient = await response.json();
      toast.success(
        isEditMode ? "Patient updated successfully" : "Patient added successfully"
      );
      onSuccess(patient);
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <div className="px-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl">{title}</SheetTitle>
            <SheetDescription>
              {isEditMode ? "Update patient information" : "Add a new patient to the system"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Patient name"
            error={errors.name}
            disabled={isLoading}
          />

          <Input
            label="Phone Number *"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="10-digit phone number"
            error={errors.phone_number}
            disabled={isLoading}
          />

          <Input
            label="Age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            placeholder="Age in years"
            error={errors.age}
            disabled={isLoading}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Sex</label>
            <select
              name="sex"
              value={formData.sex}
              onChange={(e) => handleSelectChange("sex", e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2.5 border border-clinic-border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50 appearance-none bg-white"
            >
              <option value="">Select sex...</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <Textarea
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address (optional)"
            disabled={isLoading}
            rows={3}
          />

          <SheetFooter className="pt-6 mt-8 border-t border-clinic-border gap-2 flex-row">
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
              disabled={isLoading}
              fullWidth
            >
              {isEditMode ? "Update" : "Add"} Patient
            </Button>
          </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
