"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmInline } from "@/components/ui/ConfirmInline";
import { Badge } from "@/components/ui/Badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/Sheet";
import { DocumentTextIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, PencilIcon } from "@heroicons/react/24/outline";

interface VisitField {
  id: string;
  field_name: string;
  field_type: "text" | "dropdown" | "checkbox" | "date" | "number";
  is_required: boolean;
  field_order: number;
  dropdown_options: string[] | null;
}

export default function VisitFieldsAdmin() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fields, setFields] = useState<VisitField[]>([]);
  const [formData, setFormData] = useState<{
    field_name: string;
    field_type: "text" | "dropdown" | "checkbox" | "date" | "number";
    is_required: boolean;
    dropdown_options: string;
  }>({
    field_name: "",
    field_type: "text",
    is_required: false,
    dropdown_options: "",
  });

  const loadFields = async () => {
    try {
      const response = await fetch("/api/admin/visit-fields");
      if (!response.ok) {
        throw new Error("Failed to load fields");
      }
      const data = await response.json();
      setFields(data.fields || []);
    } catch (error) {
      console.error("Error loading fields:", error);
      toast.error("Failed to load visit fields");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      field_name: "",
      field_type: "text",
      is_required: false,
      dropdown_options: "",
    });
    setEditingId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setOpenSheet(true);
  };

  const handleEdit = (field: VisitField) => {
    setFormData({
      field_name: field.field_name,
      field_type: field.field_type,
      is_required: field.is_required,
      dropdown_options: field.dropdown_options ? field.dropdown_options.join(", ") : "",
    });
    setEditingId(field.id);
    setOpenSheet(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.field_name.trim()) {
      toast.error("Field name is required");
      return;
    }

    const dropdownOptions =
      formData.field_type === "dropdown"
        ? formData.dropdown_options
            .split(",")
            .map((opt) => opt.trim())
            .filter((opt) => opt.length > 0)
        : null;

    if (formData.field_type === "dropdown" && (!dropdownOptions || dropdownOptions.length === 0)) {
      toast.error("Please enter at least one dropdown option");
      return;
    }

    setIsSaving(true);

    try {
      const url = editingId
        ? `/api/admin/visit-fields/${editingId}`
        : "/api/admin/visit-fields";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field_name: formData.field_name,
          field_type: formData.field_type,
          is_required: formData.is_required,
          dropdown_options: dropdownOptions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save");
      }

      toast.success(editingId ? "Field updated successfully" : "Field added successfully");
      setOpenSheet(false);
      resetForm();
      await loadFields();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMove = async (fieldId: string, direction: "up" | "down") => {
    try {
      const response = await fetch(`/api/admin/visit-fields/${fieldId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: direction === "up" ? "move_up" : "move_down" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reorder");
      }

      toast.success(`Field moved ${direction}`);
      await loadFields();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to move";
      toast.error(message);
    }
  };

  const handleDelete = async (fieldId: string) => {
    try {
      const response = await fetch(`/api/admin/visit-fields/${fieldId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete field");
      }

      toast.success("Field deleted successfully");
      await loadFields();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete";
      toast.error(message);
    }
  };


  if (!user) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <>
      <PageHeader
        title="Visit Documentation Fields"
        description="Customize what information doctors collect during patient visits"
        action={
          <Button variant="primary" onClick={handleAddNew}>
            Add Field
          </Button>
        }
      />

      <div className="max-w-3xl">
        {isLoading ? (
          <Card>
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </CardContent>
          </Card>
        ) : fields.length === 0 ? (
          <EmptyState
            icon={<DocumentTextIcon className="h-12 w-12 text-slate-300" />}
            title="No fields configured"
            description="Add fields that doctors will fill in during patient visits"
            action={
              <Button variant="primary" onClick={handleAddNew}>
                Add Field
              </Button>
            }
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Documentation Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-4 border border-clinic-border rounded-lg hover:shadow-sm transition-shadow"
                >
                  {/* Order & Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-slate-500 w-6">{index + 1}</div>
                      <div>
                        <div className="font-medium text-slate-900">{field.field_name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="default" size="sm">
                            {field.field_type}
                          </Badge>
                          {field.is_required && (
                            <Badge variant="danger" size="sm">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleMove(field.id, "up")}
                      disabled={index === 0}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <ChevronUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMove(field.id, "down")}
                      disabled={index === fields.length - 1}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleEdit(field)}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>

                    <ConfirmInline
                      onConfirm={() => handleDelete(field.id)}
                      title="Delete Field"
                      description={`Remove "${field.field_name}" from documentation?`}
                      isDangerous
                    >
                      <button
                        type="button"
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </ConfirmInline>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Field Sheet */}
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <div className="px-6">
            <SheetHeader className="mb-6">
              <SheetTitle>{editingId ? "Edit Field" : "Add Field"}</SheetTitle>
              <SheetDescription>
                {editingId
                  ? "Update field details"
                  : "Create a new documentation field"}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Field Name"
                name="field_name"
                value={formData.field_name}
                onChange={handleInputChange}
                placeholder="e.g., Symptoms, Diagnosis"
                disabled={isSaving}
                required
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Field Type *
                </label>
                <select
                  name="field_type"
                  value={formData.field_type}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className="w-full px-3 py-2.5 border border-clinic-border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 bg-white appearance-none"
                >
                  <option value="text">Text</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="date">Date</option>
                  <option value="number">Number</option>
                </select>
              </div>

              {formData.field_type === "dropdown" && (
                <Textarea
                  label="Dropdown Options *"
                  name="dropdown_options"
                  value={formData.dropdown_options}
                  onChange={handleInputChange}
                  placeholder="Enter options separated by commas&#10;e.g., Option 1, Option 2, Option 3"
                  disabled={isSaving}
                  rows={3}
                />
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_required"
                  checked={formData.is_required}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className="h-4 w-4 rounded border-clinic-border text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">Required field</span>
              </label>

              <SheetFooter className="pt-6 mt-8 border-t border-clinic-border gap-2 flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpenSheet(false)}
                  disabled={isSaving}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  disabled={isSaving || !formData.field_name}
                  fullWidth
                >
                  {editingId ? "Update" : "Add"} Field
                </Button>
              </SheetFooter>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
