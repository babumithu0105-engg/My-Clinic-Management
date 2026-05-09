"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthProvider";
import { useBusiness } from "@/context/BusinessProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { TimePicker } from "@/components/ui/TimePicker";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface WorkingHour {
  day_of_week: number;
  is_open: boolean;
  start_time: string | null;
  end_time: string | null;
}

export default function WorkingHoursAdmin() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hours, setHours] = useState<WorkingHour[]>([]);

  // Load working hours on mount
  useEffect(() => {
    const loadHours = async () => {
      try {
        const response = await fetch("/api/admin/working-hours");
        if (!response.ok) {
          throw new Error("Failed to load working hours");
        }
        const data = await response.json();
        setHours(data.working_hours || []);
      } catch (error) {
        console.error("Error loading working hours:", error);
        toast.error("Failed to load working hours");
      } finally {
        setIsLoading(false);
      }
    };

    loadHours();
  }, []);

  const handleToggleOpen = (dayOfWeek: number) => {
    setHours((prev) =>
      prev.map((h) =>
        h.day_of_week === dayOfWeek
          ? { ...h, is_open: !h.is_open }
          : h
      )
    );
  };

  const handleTimeChange = (
    dayOfWeek: number,
    field: "start_time" | "end_time",
    value: string
  ) => {
    setHours((prev) =>
      prev.map((h) =>
        h.day_of_week === dayOfWeek
          ? { ...h, [field]: value }
          : h
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate times if open
    for (const hour of hours) {
      if (hour.is_open && (!hour.start_time || !hour.end_time)) {
        toast.error(`Please set start and end times for ${DAYS[hour.day_of_week]}`);
        return;
      }
      if (hour.is_open && hour.start_time && hour.end_time) {
        if (hour.start_time >= hour.end_time) {
          toast.error(`End time must be after start time for ${DAYS[hour.day_of_week]}`);
          return;
        }
      }
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/working-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hours),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save");
      }

      toast.success("Working hours updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <>
      <PageHeader
        title="Working Hours"
        description="Set clinic hours for each day of the week"
      />

      <div className="max-w-2xl">
        {isLoading ? (
          <Card>
            <CardContent className="space-y-4 pt-6">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {hours.map((hour) => (
                  <div
                    key={hour.day_of_week}
                    className="flex items-center gap-4 p-4 border border-clinic-border rounded-lg"
                  >
                    <div className="w-24 font-medium text-slate-900 flex-shrink-0">
                      {DAYS[hour.day_of_week]}
                    </div>

                    <label className="flex items-center gap-2 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={hour.is_open}
                        onChange={() => handleToggleOpen(hour.day_of_week)}
                        disabled={isSaving}
                        className="h-4 w-4 rounded border-clinic-border text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-600">Open</span>
                    </label>

                    {hour.is_open && (
                      <div className="flex items-center gap-3 flex-1">
                        <TimePicker
                          value={hour.start_time || "09:00"}
                          onChange={(time) =>
                            handleTimeChange(hour.day_of_week, "start_time", time)
                          }
                          disabled={isSaving}
                        />
                        <span className="text-slate-400 font-medium">to</span>
                        <TimePicker
                          value={hour.end_time || "18:00"}
                          onChange={(time) =>
                            handleTimeChange(hour.day_of_week, "end_time", time)
                          }
                          disabled={isSaving}
                        />
                      </div>
                    )}

                    {!hour.is_open && (
                      <div className="flex-1 text-sm text-slate-500">Closed</div>
                    )}
                  </div>
                ))}
              </CardContent>

              <CardFooter className="gap-2 flex-row">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  disabled={isSaving}
                  fullWidth
                >
                  Save Schedule
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
