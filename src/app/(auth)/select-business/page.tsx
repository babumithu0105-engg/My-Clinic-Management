"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { toast } from "sonner";

interface BusinessOption {
  id: string;
  role: string;
}

export default function SelectBusinessPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  // Get business list from login response stored in localStorage
  useEffect(() => {
    // In a real app, you'd get this from the auth state
    // For now, we'll expect it to be passed via URL params or stored
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Decode token to get business_ids
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );
      if (payload.business_ids && payload.business_ids.length > 0) {
        setBusinesses(payload.business_ids);
        setSelectedBusinessId(payload.business_ids[0].id);
      }
    } catch (error) {
      console.error("Failed to parse token:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleSelect = async () => {
    if (!selectedBusinessId) return;

    try {
      setIsLoading(true);

      const business = businesses.find((b) => b.id === selectedBusinessId);
      if (!business) return;

      // Store business selection
      localStorage.setItem("business_id", selectedBusinessId);
      localStorage.setItem("business_role", business.role);

      // Redirect based on role
      const role = business.role;
      if (role === "receptionist") {
        router.push("/receptionist");
      } else if (role === "doctor") {
        router.push("/doctor");
      } else if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }

      toast.success("Business selected!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Selection failed";
      toast.error(message);
      console.error("Selection error:", error);
      setIsLoading(false);
    }
  };

  if (isLoading && businesses.length === 0) {
    return <LoadingOverlay message="Loading your clinics..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-clinic-bg px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Select Clinic</CardTitle>
          <CardDescription>
            You belong to multiple clinics. Please select one to continue.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            {businesses.map((business) => (
              <label
                key={business.id}
                className="flex items-center p-4 rounded-lg border border-clinic-border cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <input
                  type="radio"
                  name="business"
                  value={business.id}
                  checked={selectedBusinessId === business.id}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="ml-3">
                  <p className="font-medium text-slate-900">
                    {business.id === selectedBusinessId ? "✓ " : ""}
                    Clinic (ID: {business.id.slice(0, 8)})
                  </p>
                  <p className="text-sm text-slate-600 capitalize">
                    Your role: {business.role}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSelect}
            isLoading={isLoading}
            disabled={!selectedBusinessId || isLoading}
          >
            {isLoading ? "Continuing..." : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
