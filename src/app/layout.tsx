import type { Metadata, Viewport } from "next";
import { Kodchasan } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const kodchasan = Kodchasan({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-kodchasan",
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Clinic Management",
  description: "Multi-tenant clinic management application",
  icons: {
    icon: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={kodchasan.variable}>
      <body>
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
