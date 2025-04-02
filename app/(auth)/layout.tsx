import React from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen flex justify-center items-center bg-gray-50 ${inter.className}`}>
      {children}
    </div>
  );
}
