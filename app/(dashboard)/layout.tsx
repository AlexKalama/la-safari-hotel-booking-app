import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth(); // Ensure you await auth()

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
