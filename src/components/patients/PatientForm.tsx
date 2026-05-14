"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
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
    status: (initialData?.status as "active" | "inactive") || "active",
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          phone_number: initialData.phone_number || "",
          age: initialData.age?.toString() || "",
          sex: initialData.sex || "",
          address: initialData.address || "",
          status: (initialData.status as "active" | "inactive") || "active",
        });
      } else {
        setFormData({
          name: "",
          phone_number: "",
          age: "",
          sex: "",
          address: "",
          status: "active",
        });
      }
      setErrors({});
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
        ...(isEditMode && { status: formData.status }),
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
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {isEditMode ? "Update patient information" : "Add a new patient to the system"}
          </SheetDescription>
        </SheetHeader>

        {isEditMode && initialData && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">{initialData.name}</h3>
              <p className="text-xs text-slate-600 mt-1">
                {initialData.phone_number}{initialData.age ? ` • Age ${initialData.age}` : ''}{initialData.sex ? ` • ${initialData.sex}` : ''}
              </p>
            </div>
            {initialData.status && (
              <Badge variant={initialData.status === "active" ? "success" : "warning"}>
                {initialData.status === "active" ? "Active" : "Inactive"}
              </Badge>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto sheet-scrollable px-6 py-6 space-y-5">
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

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Sex</label>
            <Select value={formData.sex} onValueChange={(value) => handleSelectChange("sex", value)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select sex..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Male</SelectItem>
                <SelectItem value="F">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Address</label>
            <Textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address (optional)"
              disabled={isLoading}
              rows={3}
            />
          </div>

          {isEditMode && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}


          <div className="flex gap-3 pt-5 mt-6 border-t border-slate-100">
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
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
