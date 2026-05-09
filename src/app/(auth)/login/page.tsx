"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { toast } from "sonner";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate inputs
      const newErrors: Partial<LoginFormData> = {};

      if (!formData.email) {
        newErrors.email = "Email is required";
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Send login request
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();

      // Check if user belongs to multiple businesses
      if (!data.business_ids || data.business_ids.length === 0) {
        throw new Error("User does not belong to any business");
      }

      localStorage.setItem("auth_token", data.token);

      let redirectPath = "/";

      if (data.business_ids.length > 1) {
        redirectPath = "/select-business";
      } else {
        // Auto-select single business
        const businessId = data.business_ids[0].id;
        const role = data.business_ids[0].role;

        localStorage.setItem("business_id", businessId);
        localStorage.setItem("business_role", role);

        redirectPath = role === "receptionist" ? "/receptionist"
                     : role === "doctor" ? "/doctor"
                     : role === "admin" ? "/admin"
                     : "/";
      }

      toast.success("Login successful!");

      // Use window.location for full page navigation
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 500);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-clinic-bg px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Clinic Management</CardTitle>
          <CardDescription>Enter your credentials to log in</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              disabled={isLoading}
            />
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </CardFooter>
        </form>

      </Card>
    </div>
  );
}
