"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { ConfirmInline } from "@/components/ui/ConfirmInline";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/Sheet";
import { CalendarDaysIcon, TrashIcon } from "@heroicons/react/24/outline";
import { formatDateReadable, getCurrentDate } from "@/lib/utils";
import { DatePicker } from "@/components/ui/DatePicker";

interface Holiday {
  id: string;
  holiday_date: string;
  reason: string | null;
}

export default function HolidaysAdmin() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [openSheet, setOpenSheet] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [formData, setFormData] = useState({
    holiday_date: "",
    reason: "",
  });

  // Load holidays on mount
  const loadHolidays = async () => {
    try {
      const response = await fetch("/api/admin/holidays");
      if (!response.ok) {
        throw new Error("Failed to load holidays");
      }
      const data = await response.json();
      setHolidays(data.holidays || []);
    } catch (error) {
      console.error("Error loading holidays:", error);
      toast.error("Failed to load holidays");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.holiday_date) {
      toast.error("Please select a date");
      return;
    }

    setIsAdding(true);

    try {
      const response = await fetch("/api/admin/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holiday_date: formData.holiday_date,
          reason: formData.reason || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add holiday");
      }

      toast.success("Holiday added successfully");
      setFormData({ holiday_date: "", reason: "" });
      setOpenSheet(false);
      await loadHolidays();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add holiday";
      toast.error(message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (holidayId: string) => {
    try {
      const response = await fetch(`/api/admin/holidays/${holidayId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete holiday");
      }

      toast.success("Holiday deleted successfully");
      await loadHolidays();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete";
      toast.error(message);
    }
  };

  if (!user) {
    return <LoadingOverlay message="Loading..." />;
  }

  return (
    <>
      <PageHeader
        title="Holidays & Closures"
        description="Manage dates when your clinic is closed"
        action={
          <Button
            variant="primary"
            onClick={() => setOpenSheet(true)}
          >
            Add Holiday
          </Button>
        }
      />

      <div className="max-w-2xl">
        {isLoading ? (
          <Card>
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </CardContent>
          </Card>
        ) : holidays.length === 0 ? (
          <EmptyState
            icon={<CalendarDaysIcon className="h-12 w-12 text-slate-300" />}
            title="No holidays configured"
            description="Add holiday dates to block appointments on those days"
            action={
              <Button variant="primary" onClick={() => setOpenSheet(true)}>
                Add Holiday
              </Button>
            }
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Configured Holidays</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between p-4 border border-clinic-border rounded-lg"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {formatDateReadable(holiday.holiday_date)}
                    </div>
                    {holiday.reason && (
                      <div className="text-sm text-slate-500">{holiday.reason}</div>
                    )}
                  </div>

                  <ConfirmInline
                    onConfirm={() => handleDelete(holiday.id)}
                    title="Delete Holiday"
                    description={`Remove ${formatDateReadable(holiday.holiday_date)} from closed dates?`}
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
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Holiday Sheet */}
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <div className="px-6">
            <SheetHeader className="mb-6">
              <SheetTitle>Add Holiday</SheetTitle>
              <SheetDescription>
                Select a date when the clinic will be closed
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              <DatePicker
                label="Date"
                value={formData.holiday_date}
                onChange={(date) => setFormData((prev) => ({ ...prev, holiday_date: date }))}
                min={getCurrentDate()}
                placeholder="Select a holiday date"
                disabled={isAdding}
              />

              <Input
                label="Reason (optional)"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="e.g., Festival, Conference, Staff Training"
                disabled={isAdding}
              />

              <div className="flex gap-3 pt-5 mt-6 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpenSheet(false)}
                  disabled={isAdding}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isAdding}
                  disabled={isAdding || !formData.holiday_date}
                  fullWidth
                >
                  Add Holiday
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
