import { AuthProvider } from "@/context/AuthProvider";
import { BusinessProvider } from "@/context/BusinessProvider";
import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <BusinessProvider>
        <AppShell>{children}</AppShell>
      </BusinessProvider>
    </AuthProvider>
  );
}
