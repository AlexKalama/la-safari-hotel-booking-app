import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Toaster } from "@/components/ui/sonner";
import { UserRoleProvider } from "@/context/user-role";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LA SAFARI HOTEL - Luxury Meets Adventure",
  description: "Welcome to LA SAFARI HOTEL! Experience luxury, comfort and adventure in Mombasa, Kenya.",
  icons: {
    icon: '/ls-logo.svg',
    apple: '/ls-logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="light">
            <UserRoleProvider>
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
              <Toaster />
            </UserRoleProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}