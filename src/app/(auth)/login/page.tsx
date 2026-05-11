"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import {
  CheckCircleIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

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

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("email") || searchParams.has("password")) {
      console.warn("⚠️ SECURITY: Credentials detected in URL. Clearing and redirecting...");
      window.history.replaceState({}, "", "/login");
      toast.error("For security, please enter credentials directly");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
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

      if (!data.business_ids || data.business_ids.length === 0) {
        throw new Error("User does not belong to any business");
      }

      localStorage.setItem("auth_token", data.token);

      let redirectPath = "/";

      if (data.business_ids.length > 1) {
        redirectPath = "/select-business";
      } else {
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
    <div className="min-h-screen flex">
      {/* Left Section - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">My Clinic</h1>
          </div>

          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Streamline Your Clinic Operations
          </h2>
          <p className="text-primary-100 text-lg mb-8 leading-relaxed">
            Manage appointments, track patient visits, and handle queue management efficiently
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: CheckCircleIcon, label: "Easy Queue Management" },
              { icon: SparklesIcon, label: "Real-time Doctor Dashboard" },
              { icon: ClipboardDocumentListIcon, label: "Comprehensive Visit Documentation" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-primary-200 flex-shrink-0" />
                <span className="text-primary-100">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer text */}
        <div className="relative z-10">
          <p className="text-primary-200 text-sm">
            Trusted by clinics worldwide
          </p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">My Clinic</h1>
            </div>
            <p className="text-slate-600">Clinic Management System</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-slate-600">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-8">
            A modern clinic management solution
          </p>
        </div>
      </div>
    </div>
  );
}
