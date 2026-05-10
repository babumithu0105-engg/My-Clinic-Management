"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthProvider";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Skeleton } from "@/components/ui/Skeleton";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { PhoneInput } from "@/components/ui/PhoneInput";

interface BusinessData {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export default function BusinessInfoAdmin() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [, setBusiness] = useState<BusinessData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [countryCode, setCountryCode] = useState("IN");

  // Load business data on mount
  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const response = await fetch("/api/admin/business");
        if (!response.ok) {
          throw new Error("Failed to load business info");
        }
        const data = await response.json();
        setBusiness(data);
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
        });
      } catch (error) {
        console.error("Error loading business:", error);
        toast.error("Failed to load business information");
      } finally {
        setIsLoading(false);
      }
    };

    loadBusiness();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Business name is required");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.address || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save");
      }

      const updated = await response.json();
      setBusiness(updated);
      toast.success("Business information updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <LoadingOverlay message="Loading your dashboard..." />;
  }

  return (
    <>
      <PageHeader
        title="Business Information"
        description="Manage your clinic's details"
      />

      <div className="max-w-2xl">
        {isLoading ? (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-24" />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Clinic Details</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <Input
                  label="Clinic Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isSaving}
                />

                <PhoneInput
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(phone) =>
                    setFormData((prev) => ({ ...prev, phone }))
                  }
                  countryCode={countryCode}
                  onCountryChange={setCountryCode}
                  disabled={isSaving}
                  placeholder="9876543210"
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  placeholder="clinic@example.com"
                />

                <Textarea
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  placeholder="Street address, city, postal code..."
                  rows={4}
                />
              </CardContent>

              <CardFooter className="gap-2 flex-row">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  disabled={isSaving}
                  fullWidth
                >
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}
