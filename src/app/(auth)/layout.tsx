import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - My Clinic",
  description: "Sign in to My Clinic Management System",
};

export const revalidate = 0;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
