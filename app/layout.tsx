import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/shared/auth-context";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Petrosphere Ticketing System",
  description: "Internal company ticketing and support management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
